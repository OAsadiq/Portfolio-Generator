// Porfilr — grant (or revoke) a kit to tester accounts WITHOUT payment.
//
// The kit is gated on the template_purchases table, so inserting a row there gives full
// access — no Stripe, no coupon. Same shape the referral-credit path uses (amount 0,
// null payment intent). Use this to hand the Trader Kit to testers before launch.
//
//   node scripts/grant-kit.mjs alice@example.com bob@example.com
//   node scripts/grant-kit.mjs --template=trader-template alice@example.com
//   node scripts/grant-kit.mjs --revoke alice@example.com        (take access back)
//   node scripts/grant-kit.mjs --list                            (who has the kit)
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
  const { data, error } = await sb.from('template_purchases').select('user_id, template_id, amount, purchased_at').eq('template_id', templateId);
  if (error) throw error;
  if (!data.length) { console.log(`No one owns ${templateId} yet.`); return; }
  console.log(`Owners of ${templateId}:`);
  for (const row of data) {
    const { data: u } = await sb.auth.admin.getUserById(row.user_id);
    console.log(`  ${u?.user?.email || row.user_id}  ${row.amount ? '($' + (row.amount / 100) + ')' : '(granted free)'}  ${row.purchased_at || ''}`);
  }
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
      stripe_payment_intent_id: null, // no payment — a free tester grant
      amount: 0,
    });
    console.log(error ? `FAIL  ${email} — ${error.message}` : `GRANTED  ${email} → ${templateId}`);
  }
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
