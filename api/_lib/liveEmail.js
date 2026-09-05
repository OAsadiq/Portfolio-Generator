// Which "you're live" email a new portfolios row earns — and whether it earns one at all.
//
// Two things were wrong before this module existed:
//
//  1. EVERY portfolios INSERT sent "🎉 Your portfolio is live". Since the journal pivot,
//     /journal creates a DRAFT row just to give the journal a home, so a trader who
//     clicked "Start free" was congratulated on publishing a page that does not exist —
//     with a link to /p/<throwaway-slug>, which 404s because api/p filters status='active'.
//
//  2. The copy ignored template_id, so a trader got the minimal-template email: put the
//     link in your Instagram bio, send it instead of a Google Doc, enquiries land in your
//     inbox. None of that is why they came, and the journal — the actual product — went
//     unmentioned.
//
// Extracted here rather than left inline in api/notify/domain.js so the branching is
// testable; domain.js is a webhook handler and nothing exercises it in CI.

/**
 * Templates whose real product is the journal, not the page. `trader-template` declares
 * `kit: 'trader-kit'` in its own _index.js; this list is the api-side mirror of that,
 * matching how domain.js already identifies it for the nudge queries.
 */
export const JOURNAL_TEMPLATES = ['trader-template'];

/**
 * Free-plan trade limit, for COPY ONLY — mirrors src/lib/plan.ts.
 *
 * `public.free_trade_cap()` in sql/014_trade_cap_15.sql is the real limit, enforced by a
 * trigger. Change the SQL first, then both copies. A mismatch has shipped once already.
 */
export const FREE_TRADE_CAP = 15;

export function isJournalTemplate(templateId) {
  return JOURNAL_TEMPLATES.includes(String(templateId || ''));
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Does this row earn an email to its owner?
 *
 * Only a genuinely published page does. A draft is invisible to everyone including its
 * owner's audience, so congratulating them on it is both untrue and a broken link.
 */
export function shouldEmailOwner(record = {}) {
  return record.status === 'active' && !!record.user_email && !!record.slug;
}

const wrap = (inner) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:#fff;border-radius:12px;padding:36px;border:1px solid #e2e8f0;">
        <p style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;">Porfil<span style="color:#ea580c;">r</span></p>
        ${inner}
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">Sent because you published a page at porfilr.com</p>
    </div>`;

const row = (t) => `<tr><td style="padding:6px 0;color:#475569;font-size:14px;">• ${t}</td></tr>`;

/** The original email, now scoped to pages where the page IS the product. */
function portfolioLive(first, slug) {
  const url = `https://porfilr.com/p/${encodeURIComponent(slug)}`;
  return wrap(`
        <h1 style="font-size:24px;color:#0f172a;margin:18px 0 10px;">It's live, ${esc(first)} 🎉</h1>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
          Your portfolio is published and ready to share. Here's your link:
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:15px;font-weight:600;color:#0f172a;">porfilr.com/p/${esc(slug)}</div>
        <a href="${url}" style="display:inline-block;background:#0f172a;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">View my portfolio →</a>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:24px 0 8px;font-weight:600;">Now put it to work:</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${row('Drop the link in your email signature, LinkedIn, and Instagram bio')}
          ${row('Send it with your next pitch instead of a Google Doc')}
          ${row('Enquiries from your contact form land straight in your inbox')}
        </table>
        <p style="color:#64748b;font-size:13px;line-height:1.7;margin:20px 0 0;">
          You can edit any detail anytime from your account. Want a custom domain (yourname.com) and analytics? Pro is a one-time $19.
        </p>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:20px 0 0;">— Sadiq, founder of Porfilr</p>`);
}

/**
 * The journal version. The page is the sidenote here — an empty page is worth nothing
 * until there are trades behind it, so every step points at the journal, and the free
 * cap is stated plainly rather than sprung on them at trade 16.
 */
function journalLive(first, slug, ownsKit) {
  const journalUrl = `https://porfilr.com/journal/${encodeURIComponent(slug)}`;
  const pageUrl = `https://porfilr.com/p/${encodeURIComponent(slug)}`;
  return wrap(`
        <h1 style="font-size:24px;color:#0f172a;margin:18px 0 10px;">Your journal is ready, ${esc(first)}</h1>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
          Your page is live at <a href="${pageUrl}" style="color:#0f172a;font-weight:600;">porfilr.com/p/${esc(slug)}</a> —
          but it's the trades behind it that make it worth showing. Three things to do next:
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
          <tr><td style="padding:0 0 16px;">
            <p style="margin:0 0 3px;color:#0f172a;font-size:15px;font-weight:700;">1. Set your starting balance</p>
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">Your return % is measured against it, so nothing calculates until it's set.</p>
          </td></tr>
          <tr><td style="padding:0 0 16px;">
            <p style="margin:0 0 3px;color:#0f172a;font-size:15px;font-weight:700;">2. Log your trades — or import them</p>
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">Bybit, MEXC, Binance, MT4, MT5 and cTrader exports all drop straight in. Only closed trades count.</p>
          </td></tr>
          <tr><td>
            <p style="margin:0 0 3px;color:#0f172a;font-size:15px;font-weight:700;">3. Turn on your live track record</p>
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">One switch, and your page starts showing your real return, win rate, drawdown and equity curve — updating as you trade.</p>
          </td></tr>
        </table>
        <a href="${journalUrl}" style="display:inline-block;background:#e0b252;color:#0b0e14;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Open my journal →</a>
        ${ownsKit ? '' : `
        <p style="color:#64748b;font-size:13px;line-height:1.7;margin:22px 0 0;">
          You're on the free plan: ${FREE_TRADE_CAP} trades, everything else included — calendar, stats, equity curve, imports.
          Past ${FREE_TRADE_CAP} you'll be asked to unlock the full journal, one time, no subscription.
        </p>`}
        <p style="color:#64748b;font-size:13px;line-height:1.7;margin:20px 0 0;">
          Your numbers are self-reported and your page says so plainly — we never dress that up as "verified". If you have a MyFXBook or broker link, add it; that's your independent proof.
        </p>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:20px 0 0;">— Sadiq, founder of Porfilr</p>`);
}

/**
 * Pick the email for a newly published page.
 * Returns `{ subject, html }`.
 */
export function ownerEmailFor({ templateId, name, slug, ownsKit = false } = {}) {
  const first = (name || '').trim().split(/\s+/)[0] || 'there';
  return isJournalTemplate(templateId)
    ? { subject: 'Your Porfilr Journal is ready', html: journalLive(first, slug, ownsKit) }
    : { subject: '🎉 Your portfolio is live', html: portfolioLive(first, slug) };
}
