// One-off announcement: tell existing Trader Kit owners about the trading calendar.
//
//   node scripts/announce-calendar.mjs --dry     (preview who gets it, sends nothing)
//   node scripts/announce-calendar.mjs           (actually send)
//
// Requires SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY in .env.
// Run locally only — the service key must never leave your machine.
//
// Sends to everyone who owns the Trader Kit. One email, no repeats: re-running skips
// anyone already announced (tracked in template_purchases.calendar_announced_at).

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const DRY = process.argv.includes('--dry');
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
const RESEND = env.RESEND_API_KEY;
const FROM = 'Porfilr <hello@porfilr.com>';

function html(name) {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:540px;color:#181b22;font-size:15px;line-height:1.6;">
    <p>${name ? `Hi ${name},` : 'Hi,'}</p>
    <p>Quick one — there's a new feature in your Trader Kit: a <strong>trading calendar</strong>.</p>
    <p style="color:#4f5661;">
      It's a month view of your trading days, each one coloured by profit or loss, with the number of
      trades and your wins and losses on the day. The thing it's actually good for is spotting your
      own patterns — the days of the week you keep giving it back, or whether one big day is carrying
      a wall of red.
    </p>
    <p style="color:#4f5661;">
      It's in your Journal now, built from the trades you've already logged — nothing to set up.
    </p>
    <p style="color:#4f5661;">
      Two other things landed while I was in there: you can now <strong>import your history</strong>
      straight from Bybit, MEXC, Binance, MT4, MT5 or cTrader instead of typing trades in one by one —
      and the whole thing <strong>works on your phone</strong> now, including building and editing your
      page.
    </p>
    <p style="color:#4f5661;">
      You can also <strong>show it on your public page</strong> if you want. That's off by default and
      completely your call. If you turn it on, it shows the colours and your green/red day counts —
      <strong>never your daily amounts</strong>. Your exact figures stay private to you.
    </p>
    <p style="margin:26px 0;">
      <a href="https://porfilr.com/dashboard" style="background:#e0b252;color:#0b0e14;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;">See your calendar</a>
    </p>
    <p style="color:#4f5661;">A request: if there's something else you want the kit to do, just reply and tell me. This calendar exists because a trader asked for it.</p>
    <p style="color:#4f5661;">— Sadiq, Porfilr</p>
  </div>`;
}

function text(name) {
  return `${name ? `Hi ${name},` : 'Hi,'}

Quick one — there's a new feature in your Trader Kit: a TRADING CALENDAR.

It's a month view of your trading days, each coloured by profit or loss, with the number of
trades and your wins and losses on the day. The thing it's actually good for is spotting your
own patterns — the days you keep giving it back, or whether one big day is carrying a wall of
red.

It's in your Journal now, built from trades you've already logged — nothing to set up.

Two other things landed while I was in there: you can now import your history straight from
Bybit, MEXC, Binance, MT4, MT5 or cTrader instead of typing trades in one by one — and the
whole thing works on your phone now, including building and editing your page.

You can also show it on your public page if you want. That's off by default and completely
your call. If you turn it on, it shows the colours and your green/red day counts — never your
daily amounts. Your exact figures stay private to you.

See your calendar: https://porfilr.com/dashboard

A request: if there's something else you want the kit to do, just reply and tell me. This
calendar exists because a trader asked for it.

— Sadiq, Porfilr`;
}

const { data: owners, error } = await sb
  .from('template_purchases')
  .select('user_id, calendar_announced_at')
  .eq('template_id', 'trader-template');

if (error) { console.error('Fetch error:', error.message); process.exit(1); }

const pending = (owners || []).filter((o) => !o.calendar_announced_at);
console.log(`${owners.length} kit owner(s), ${pending.length} not yet announced.${DRY ? ' (dry run)' : ''}\n`);

let sent = 0, skipped = 0, failed = 0;

for (const o of pending) {
  let email = null, name = null;
  try {
    const { data } = await sb.auth.admin.getUserById(o.user_id);
    email = data?.user?.email || null;
    name = (data?.user?.user_metadata?.full_name || '').split(' ')[0] || null;
  } catch { /* fall through */ }

  if (!email) { console.log(`SKIP  ${o.user_id.slice(0, 8)} — no email`); skipped++; continue; }
  if (DRY) { console.log(`DRY   would email ${email}`); sent++; continue; }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: email,
        subject: 'New in your Trader Kit: a trading calendar',
        html: html(name), text: text(name), reply_to: 'hello@porfilr.com',
      }),
    });
    if (!res.ok) { console.log(`FAIL  ${email} — ${await res.text()}`); failed++; continue; }

    await sb.from('template_purchases')
      .update({ calendar_announced_at: new Date().toISOString() })
      .eq('user_id', o.user_id).eq('template_id', 'trader-template');
    console.log(`SENT  ${email}`);
    sent++;
  } catch (e) {
    console.log(`FAIL  ${email} — ${e.message}`);
    failed++;
  }
}

// "sent" in a dry run means "would have been sent" — saying it plainly, because the old
// wording printed "8 sent" after a preview that delivered nothing, which is exactly how
// someone concludes the emails already went out.
console.log(
  DRY
    ? `\nDry run — nothing was sent. ${sent} would be emailed, ${skipped} skipped, ${failed} failed.`
    : `\nDone. ${sent} sent, ${skipped} skipped, ${failed} failed.`
);
