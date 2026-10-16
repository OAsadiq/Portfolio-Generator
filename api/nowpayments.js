// Porfilr — crypto checkout via NOWPayments.
//
// ONE function handles both jobs (create an invoice, receive the IPN) because Vercel caps
// serverless functions and we're close to it. They're told apart by the signature header,
// which only NOWPayments can produce.
//
//   POST  { action: 'create-invoice', product, userId, email }   -> { url }
//   POST  with x-nowpayments-sig header                          -> IPN callback
//
// WHY THIS EXISTS
// Paystack and Flutterwave both require a registered Nigerian entity we don't have, so
// there is no automated naira rail available to us. Our audience are traders who already
// hold USDT, so crypto is the one rail that can be automatic — everything else (bank
// transfer) is verified by hand through scripts/grant-kit.mjs.
//
// Env:
//   NOWPAYMENTS_API_KEY     server-side only, never VITE_
//   NOWPAYMENTS_IPN_SECRET  used to verify callbacks

import { createClient } from '@supabase/supabase-js';
import { verifyIpnSignature, buildOrderId, parseOrderId, isPaid, isNoticeable } from './_lib/nowpayments.js';
import { grantLifetimePro, hasActivePro } from './_lib/proAccess.js';
import { sendKitWelcomeEmail } from './_lib/kitEmail.js';

const API = 'https://api.nowpayments.io/v1';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Server owns the price. Never trust a client-sent amount — the same rule as
// KIT_PRICE_ENV in api/stripe/actions.js, and for the same reason.
const PRICE_USD = {
  pro: 19,
  'trader-template': 35,
  // TEMPORARY — remove once crypto is proven in production.
  //
  // A $1 product so the whole chain can be exercised for real money without spending $35:
  // invoice created -> paid on-chain -> IPN received -> signature verified -> order_id
  // parsed -> status checked -> fulfilment dispatched.
  //
  // It grants NOTHING and writes NOTHING (see fulfil). The parts it can't prove — the
  // purchase insert and the Pro grant — are shared with paths that already run in
  // production. What it does prove is the part that has never run anywhere: that a real
  // NOWPayments callback survives Vercel's JSON parsing and still matches the signature.
  'test-1usd': 1,
};

const TEST_PRODUCT = 'test-1usd';

function siteUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'porfilr.com';
  const proto = String(host).startsWith('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

// ── Create an invoice ────────────────────────────────────────────────────────
async function createInvoice(req, res) {
  const { product, userId, email } = req.body || {};
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Crypto payments are not configured' });
  if (!userId) return res.status(400).json({ error: 'Sign in first' });

  const price = PRICE_USD[product];
  if (!price) return res.status(400).json({ error: 'Unknown product' });

  // Already owns it? Don't take money for something they have. The test product is
  // exempt — it grants nothing, so it can be bought repeatedly while debugging.
  if (product === TEST_PRODUCT) { /* no ownership to check */ }
  else if (product === 'pro') {
    if (await hasActivePro(supabase, userId)) return res.status(200).json({ alreadyOwned: true });
  } else {
    const { data: owned } = await supabase
      .from('template_purchases')
      .select('id').eq('user_id', userId).eq('template_id', product).maybeSingle();
    if (owned) return res.status(200).json({ alreadyOwned: true });
  }

  const site = siteUrl(req);
  try {
    const r = await fetch(`${API}/invoice`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: price,
        price_currency: 'usd',
        // Let the buyer pick the chain at checkout. Pinning usdttrc20 here would reject
        // anyone holding USDT on another network, which is most of the reason people
        // bounce off crypto checkouts.
        order_id: buildOrderId(userId, product),
        order_description: product === 'pro' ? 'Porfilr Pro (lifetime)' : 'Porfilr Journal',
        ipn_callback_url: `${site}/api/nowpayments`,
        success_url: `${site}/dashboard?paid=1`,
        cancel_url: `${site}/pricing`,
        customer_email: email || undefined,
      }),
    });
    if (!r.ok) {
      console.error('nowpayments invoice failed:', await r.text());
      return res.status(502).json({ error: 'Could not start crypto checkout' });
    }
    const data = await r.json();
    if (!data?.invoice_url) return res.status(502).json({ error: 'No checkout URL returned' });
    return res.status(200).json({ url: data.invoice_url });
  } catch (err) {
    console.error('nowpayments invoice error:', err.message);
    return res.status(502).json({ error: 'Could not start crypto checkout' });
  }
}

// ── Fulfilment ───────────────────────────────────────────────────────────────
async function fulfil({ userId, product, paymentId, amountUsd, email }) {
  // The $1 test deliberately writes nothing: a junk row in template_purchases would skew
  // the paid-vs-granted numbers we use to judge whether anyone actually buys this.
  if (product === TEST_PRODUCT) {
    console.log(`[nowpayments TEST] callback verified end to end — payment ${paymentId}, user ${userId}, $${amountUsd}. Nothing granted, nothing written.`);
    return 'test-ok';
  }

  if (product === 'pro') {
    if (await hasActivePro(supabase, userId)) return 'already';
    await grantLifetimePro(supabase, userId);
    return 'granted';
  }

  const { data: owned } = await supabase
    .from('template_purchases')
    .select('id').eq('user_id', userId).eq('template_id', product).maybeSingle();
  if (owned) return 'already';

  const { error } = await supabase.from('template_purchases').insert({
    user_id: userId,
    template_id: product,
    stripe_payment_intent_id: null,
    // Minor units, matching Stripe. Priced in USD even though they paid USDT — the invoice
    // is denominated in dollars, so that is the honest figure to record.
    amount: Math.round(Number(amountUsd || 0) * 100),
    currency: 'USD',
    provider: 'nowpayments',
    payment_ref: String(paymentId || ''),
  });
  if (error) throw new Error(error.message);

  // Never allowed to fail the webhook: access is already granted, and a mail error must
  // not make NOWPayments retry a purchase we've honoured.
  try {
    if (email) await sendKitWelcomeEmail({ to: email, firstName: '' });
  } catch (e) {
    console.error('kit welcome email after crypto purchase failed:', e.message);
  }
  return 'granted';
}

// ── IPN callback ─────────────────────────────────────────────────────────────
async function handleIpn(req, res) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  const sig = req.headers['x-nowpayments-sig'];

  if (!verifyIpnSignature(req.body, sig, secret)) {
    // Don't say why. An unsigned caller gets nothing useful back.
    return res.status(401).json({ error: 'bad signature' });
  }

  const { payment_status: status, order_id, payment_id, price_amount } = req.body || {};
  const parsed = parseOrderId(order_id);
  // 200 on anything we can't act on: a non-2xx makes NOWPayments retry forever, and a
  // foreign or malformed order id will never become actionable.
  if (!parsed) return res.status(200).json({ ignored: 'unrecognised order_id' });

  if (isNoticeable(status)) {
    console.warn(`nowpayments ${status} for ${order_id} (payment ${payment_id}) — needs a human`);
    return res.status(200).json({ noted: status });
  }
  if (!isPaid(status)) return res.status(200).json({ ignored: status });

  try {
    const { data: u } = await supabase.auth.admin.getUserById(parsed.userId);
    const result = await fulfil({
      userId: parsed.userId,
      product: parsed.product,
      paymentId: payment_id,
      amountUsd: price_amount,
      email: u?.user?.email || null,
    });
    console.log(`nowpayments ${status}: ${parsed.product} -> ${parsed.userId} (${result})`);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    // 500 so it retries — this is OUR failure, and the money is real.
    console.error('nowpayments fulfilment error:', err.message);
    return res.status(500).json({ error: 'fulfilment failed' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  // The signature header is the only thing NOWPayments sends that a browser can't fake
  // its way past — it's what separates a callback from a checkout request.
  if (req.headers['x-nowpayments-sig']) return handleIpn(req, res);
  if (req.body?.action === 'create-invoice') return createInvoice(req, res);
  return res.status(400).json({ error: 'Unknown action' });
}
