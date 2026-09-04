// One-off: two individual emails, not a blast.
//
//   node scripts/send-two-notes.mjs --dry     preview exactly what would go out
//   node scripts/send-two-notes.mjs           send
//
// WHY these two and not the other six kit owners: of eight template_purchases rows, seven
// are grants and one is a sale. Only one person outside the team has ever logged a trade.
// A "new feature" blast to people who never opened the product is noise, and it would
// spend the one message a paying customer reads on the wrong thing.
//
//   Kudus  — paid $35 on 3 Aug, hit the desktop-only wall on 15 Aug (see
//            desktop_reminders), never built a page. That wall is now gone.
//   Oni    — the only active user: 7 trades between 14 and 22 Aug. His journal is on but
//            the live track record toggle is OFF, so his page shows none of it.
//
// Marks calendar_announced_at for the recipient of the feature note only, so the general
// announcement can still reach the others later without double-sending to him.

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

const wrap = (body) => `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:540px;color:#181b22;font-size:15px;line-height:1.6;">${body}</div>`;
const p = (t) => `<p style="color:#4f5661;">${t}</p>`;

const KUDUS_TEXT = `Hi Kudus,

You bought the Trader Kit on the 3rd of August, and as far as I can tell you've never been
able to build your page. I think I know why, and it was our fault.

When you came back on the 15th, you would have hit a screen telling you the builder needs a
desktop. You were on your phone. That was it — no way forward, and nothing to show for what
you'd paid.

That's fixed. You can now set the whole thing up from your phone: build the page, publish it,
log trades, and import your history from Bybit, MEXC, Binance, MT4, MT5 or cTrader if you'd
rather not type them in.

Your kit is still there and still yours: https://porfilr.com/templates

It should take about ten minutes now. If anything at all gets in your way this time, reply
straight to this — it comes to me, and I'll fix it the same way I fixed this one.

— Sadiq
Porfilr`;

const KUDUS_HTML = wrap(`
  <p>Hi Kudus,</p>
  <p>You bought the Trader Kit on the 3rd of August, and as far as I can tell you've never been able to build your page. I think I know why, and it was our fault.</p>
  ${p('When you came back on the 15th, you would have hit a screen telling you the builder needs a desktop. You were on your phone. That was it — no way forward, and nothing to show for what you\'d paid.')}
  ${p('That\'s fixed. You can now set the whole thing up from your phone: build the page, publish it, log trades, and import your history from Bybit, MEXC, Binance, MT4, MT5 or cTrader if you\'d rather not type them in.')}
  <p style="margin:26px 0;"><a href="https://porfilr.com/templates" style="background:#e0b252;color:#0b0e14;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;">Open your kit</a></p>
  ${p('It should take about ten minutes now. If anything at all gets in your way this time, reply straight to this — it comes to me, and I\'ll fix it the same way I fixed this one.')}
  <p style="color:#4f5661;">— Sadiq<br/>Porfilr</p>`);

// No first name: he entered "The Spruce" as his name, which is a handle. Guessing one from
// his email address would be a bad way to open a trust-repair email.
const ONI_TEXT = `Hi,

Thanks for sticking with it, and for telling me about the trades that seemed to disappear.
I found it: the page was quietly reloading itself whenever you switched tabs, which would
wipe anything you'd typed but not yet saved. If you were flicking between your chart and the
journal, that's exactly when it would bite. It's fixed.

While I was in there, three things you'll care about:

Your calendar is live. Seven trades in, it now shows your month day by day — each day
coloured by profit or loss, with the number of trades and your wins and losses on it. It's
in your Journal.

Your track record isn't switched on. You've set your balance and logged your trades, but the
live track record on your public page is still off, so your page isn't showing any of it.
There's a toggle in the Journal. Worth thirty seconds.

You can import instead of typing. Bybit, MEXC, Binance, MT4, MT5 and cTrader — export your
closed positions and drop the file in.

You've found two real problems for us so far. If you find a third, tell me — reply here and
it comes straight to me.

— Sadiq
Porfilr`;

const ONI_HTML = wrap(`
  <p>Hi,</p>
  <p>Thanks for sticking with it, and for telling me about the trades that seemed to disappear. I found it: the page was quietly reloading itself whenever you switched tabs, which would wipe anything you'd typed but not yet saved. If you were flicking between your chart and the journal, that's exactly when it would bite. It's fixed.</p>
  ${p('While I was in there, three things you\'ll care about:')}
  ${p('<strong>Your calendar is live.</strong> Seven trades in, it now shows your month day by day — each day coloured by profit or loss, with the number of trades and your wins and losses on it. It\'s in your Journal.')}
  ${p('<strong>Your track record isn\'t switched on.</strong> You\'ve set your balance and logged your trades, but the live track record on your public page is still off, so your page isn\'t showing any of it. There\'s a toggle in the Journal. Worth thirty seconds.')}
  ${p('<strong>You can import instead of typing.</strong> Bybit, MEXC, Binance, MT4, MT5 and cTrader — export your closed positions and drop the file in.')}
  <p style="margin:26px 0;"><a href="https://porfilr.com/journal/the-spruce" style="background:#e0b252;color:#0b0e14;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;">Open your journal</a></p>
  ${p('You\'ve found two real problems for us so far. If you find a third, tell me — reply here and it comes straight to me.')}
  <p style="color:#4f5661;">— Sadiq<br/>Porfilr</p>`);

const NOTES = [
  {
    to: 'kuduslawal2000@gmail.com',
    subject: "I owe you an apology — it's fixed now",
    text: KUDUS_TEXT, html: KUDUS_HTML, markAnnounced: false,
  },
  {
    to: 'oniibukundavid@gmail.com',
    subject: "That bug you found — plus your calendar's ready",
    text: ONI_TEXT, html: ONI_HTML, markAnnounced: true,
  },
];

if (!RESEND && !DRY) { console.error('Missing RESEND_API_KEY in .env'); process.exit(1); }

let sent = 0, failed = 0;
for (const n of NOTES) {
  if (DRY) {
    console.log(`\n${'='.repeat(64)}\nTO      ${n.to}\nSUBJECT ${n.subject}\n${'='.repeat(64)}\n${n.text}\n`);
    continue;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: n.to, subject: n.subject,
        html: n.html, text: n.text, reply_to: 'hello@porfilr.com',
      }),
    });
    if (!res.ok) { console.log(`FAIL  ${n.to} — ${await res.text()}`); failed++; continue; }

    if (n.markAnnounced) {
      const { data: u } = await sb.auth.admin.listUsers({ perPage: 1000 });
      const usr = u.users.find((x) => (x.email || '').toLowerCase() === n.to);
      if (usr) {
        await sb.from('template_purchases')
          .update({ calendar_announced_at: new Date().toISOString() })
          .eq('user_id', usr.id).eq('template_id', 'trader-template');
      }
    }
    console.log(`SENT  ${n.to}`);
    sent++;
  } catch (e) {
    console.log(`FAIL  ${n.to} — ${e.message}`);
    failed++;
  }
}

if (!DRY) console.log(`\nDone. ${sent} sent, ${failed} failed.`);
