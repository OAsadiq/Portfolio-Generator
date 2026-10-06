// Porfilr — give someone the kit: either as a free grant, or to fulfil a sale we took by
// hand.
//
// The kit is gated on the template_purchases table, so inserting a row there gives full
// access — no Stripe, no coupon.
//
//   node scripts/grant-kit.mjs alice@example.com bob@example.com     (free grant)
//   node scripts/grant-kit.mjs --template=trader-template alice@example.com
//   node scripts/grant-kit.mjs --revoke alice@example.com            (take access back)
//   node scripts/grant-kit.mjs --list                                (who has the kit)
//
// MANUAL SALES — someone actually paid:
//
//   node scripts/grant-kit.mjs --paid=35 --currency=USD  --ref=tx_abc   alice@example.com
//   node scripts/grant-kit.mjs --paid=25000 --currency=NGN --ref=FT2410 bola@example.com
//   node scripts/grant-kit.mjs --paid=20 --currency=USDT --ref=0xabc…   kemi@example.com
//
// `--paid` is in MAJOR units (dollars/naira), stored as minor units to match Stripe.
//
// WHY THIS MATTERS: Paystack and Flutterwave both require a Nigerian entity we don't have,
// so Nigerian sales are collected by hand. Recording them as amount 0 would file a real
// customer as a free grant — the founding counter ignores them, revenue stays wrong, and
// the one question this quarter exists to answer ("does anyone pay?") gets a false no.
//
// A free grant now means exactly one thing: nobody paid. Keep it that way.
//
// Requires SUPABASE_URL + SUPABASE_SERVICE_KEY in .env. The service key is powerful and
// bypasses RLS — run this LOCALLY only, never commit it, never ship it.
//
// The tester must have signed in at least once first (so their account exists). If an
// email isn't found, tell them to sign up at porfilr.com, then re-run.

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// --- load .env (quoted values tolerated) ---
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY in .env'); process.exit(1); }
const sb = createClient(url, key);

// --- args ---
const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const list = args.includes('--list');
const templateId = (args.find((a) => a.startsWith('--template=')) || '--template=trader-template').split('=')[1];
const emails = args.filter((a) => !a.startsWith('--')).map((e) => e.toLowerCase());

// --- manual sale options ---
const flag = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

const CURRENCIES = ['USD', 'NGN', 'USDT'];
const paidRaw = flag('paid');
const currency = (flag('currency') || 'USD').toUpperCase();
const ref = flag('ref');

let amountMinor = 0;
let provider = 'grant';

if (paidRaw !== null) {
  const major = Number(paidRaw);
  if (!Number.isFinite(major) || major <= 0) {
    console.error(`--paid must be a positive number of ${currency} (got "${paidRaw}")`);
    process.exit(1);
  }
  if (!CURRENCIES.includes(currency)) {
    console.error(`--currency must be one of ${CURRENCIES.join(', ')} (got "${currency}")`);
    process.exit(1);
  }
  // A manual sale with no reference can't be reconciled against a bank statement or a
  // block explorer later, which is the whole reason for recording it.
  if (!ref) {
    console.error('--ref is required with --paid (bank transfer id, or crypto tx hash)');
    process.exit(1);
  }
  // Stored in MINOR units to match Stripe's amount_total, so both paths agree.
  amountMinor = Math.round(major * 100);
  provider = currency === 'USDT' ? 'manual_usdt' : 'manual_transfer';
} else if (ref || flag('currency')) {
  console.error('--ref / --currency only make sense with --paid. Did you mean to record a sale?');
  process.exit(1);
}

const money = (minor, cur) => {
  const sym = { USD: '$', NGN: '₦', USDT: '' }[cur] ?? '';
  const n = (minor / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return cur === 'USDT' ? `${n} USDT` : `${sym}${n}`;
};

// --- find a user by email (paginate; admin API has no email filter) ---
async function findUserByEmail(email) {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email || '').toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 1000) return null; // last page
  }
  return null;
}

async function doList() {
  const { data, error } = await sb
    .from('template_purchases')
    .select('user_id, template_id, amount, currency, provider, payment_ref, purchased_at')
    .eq('template_id', templateId);
  if (error) throw error;
  if (!data.length) { console.log(`No one owns ${templateId} yet.`); return; }

  console.log(`Owners of ${templateId}:`);
  for (const row of data) {
    const { data: u } = await sb.auth.admin.getUserById(row.user_id);
    // Never print a bare "$" against an amount whose currency we were told — that is the
    // exact misreading sql/016 exists to stop.
    const paid = row.amount > 0
      ? `${money(row.amount, row.currency || 'USD')} via ${row.provider || 'stripe'}`
      : 'granted free';
    console.log(`  ${(u?.user?.email || row.user_id).padEnd(34)} ${paid.padEnd(28)} ${String(row.purchased_at || '').slice(0, 10)}`);
  }

  // Revenue per currency. Deliberately NOT summed across them — there is no honest single
  // number, and inventing an exchange rate here would make the total look authoritative.
  const byCur = {};
  for (const r of data.filter((x) => x.amount > 0)) {
    const c = r.currency || 'USD';
    byCur[c] = byCur[c] || { n: 0, total: 0 };
    byCur[c].n++; byCur[c].total += r.amount;
  }
  const paidRows = data.filter((x) => x.amount > 0).length;
  console.log(`\n  ${paidRows} paid, ${data.length - paidRows} granted free`);
  for (const [c, v] of Object.entries(byCur)) console.log(`  ${v.n} × ${c}: ${money(v.total, c)}`);
}

async function main() {
  if (list) { await doList(); return; }
  if (emails.length === 0) {
    console.error('Usage: node scripts/grant-kit.mjs [--revoke] [--template=trader-template] <email> [email…]');
    process.exit(1);
  }

  for (const email of emails) {
    const user = await findUserByEmail(email);
    if (!user) { console.log(`SKIP  ${email} — no account (ask them to sign in once first)`); continue; }

    if (revoke) {
      const { error } = await sb.from('template_purchases').delete().eq('user_id', user.id).eq('template_id', templateId);
      console.log(error ? `FAIL  ${email} — ${error.message}` : `REVOKED  ${email}`);
      continue;
    }

    // Already owns it? The unique index would reject a duplicate anyway.
    const { data: owned } = await sb.from('template_purchases').select('id').eq('user_id', user.id).eq('template_id', templateId).maybeSingle();
    if (owned) { console.log(`ALREADY  ${email} already has ${templateId}`); continue; }

    const { error } = await sb.from('template_purchases').insert({
      user_id: user.id,
      template_id: templateId,
      stripe_payment_intent_id: null,   // never Stripe from this script
      amount: amountMinor,              // 0 for a grant, minor units for a manual sale
      currency,
      provider,
      payment_ref: ref,
    });
    if (error) { console.log(`FAIL  ${email} — ${error.message}`); continue; }
    console.log(amountMinor > 0
      ? `SOLD     ${email} → ${templateId}  ${money(amountMinor, currency)} via ${provider} (${ref})`
      : `GRANTED  ${email} → ${templateId}  (free — nobody paid)`);
  }
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
