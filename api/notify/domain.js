import { createClient } from '@supabase/supabase-js';
import { ownerEmailFor, shouldEmailOwner, isJournalTemplate } from '../_lib/liveEmail.js';

// Admin notifier. Target of one or more Supabase Database Webhooks.
// Each webhook sends { type: 'INSERT'|'UPDATE'|'DELETE', table, record, old_record }.
// We branch on table + type to send the right admin email. Keeping everything in this
// single endpoint avoids adding a new serverless function (Vercel Hobby caps at 12).

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sadiq@porfilr.com';
const FROM = 'Porfilr <sadiq@porfilr.com>';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function shell(title, intro, rows, accent = '#0f172a') {
  const cells = rows
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:130px;">${k}</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${v}</td></tr>`)
    .join('');
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <h2 style="margin:0 0 8px;color:${accent};font-size:22px;">${title}</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">${intro}</p>
        <table style="width:100%;border-collapse:collapse;">${cells}</table>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">Porfilr admin notification</p>
    </div>`;
}

async function buildEmail(payload) {
  const type = payload?.type;
  const table = payload?.table;
  const record = payload?.record || {};
  const old = payload?.old_record || {};

  // ── New signup → admin notice + welcome email to the new user ──
  if (table === 'referrals' && type === 'INSERT') {
    let email = null, name = null;
    try {
      const { data } = await supabase.auth.admin.getUserById(record.user_id);
      email = data?.user?.email || null;
      name = data?.user?.user_metadata?.full_name || null;
    } catch { /* fall through with what we have */ }

    const messages = [{
      to: ADMIN_EMAIL,
      subject: `🎉 New Porfilr signup${email ? `: ${email}` : ''}`,
      html: shell('🎉 New signup', 'Someone just created a Porfilr account.', [
        ['Name', name],
        ['Email', email],
        ['User ID', record.user_id],
        ['Referral code', record.code],
      ], '#0d9488'),
    }];

    if (email) {
      messages.push({ to: email, subject: 'Welcome to Porfilr — let’s get your portfolio live', html: welcomeEmail(name) });
    }
    return messages;
  }

  // ── New portfolio published → admin notice + "you're live" email to the user ──
  if (table === 'portfolios' && type === 'INSERT') {
    // The portfolio's user_email is the CONTACT email the user typed (can be a typo).
    // Look up their real account/login email so the admin notice shows both.
    let accountEmail = null;
    if (record.user_id) {
      try {
        const { data } = await supabase.auth.admin.getUserById(record.user_id);
        accountEmail = data?.user?.email || null;
      } catch { /* fall through */ }
    }

    // A journal draft is also a portfolios INSERT. Say which this is rather than
    // reporting every row as a publish.
    const isDraft = record.status !== 'active';

    const messages = [{
      to: ADMIN_EMAIL,
      subject: isDraft
        ? `📓 Journal started: ${record.user_name || record.slug}`
        : `🚀 New portfolio: ${record.user_name || record.slug}`,
      html: shell(
        isDraft ? '📓 Journal started' : '🚀 New portfolio published',
        isDraft
          ? 'A user opened a journal. No page is published yet.'
          : 'A user just published a portfolio.',
        [
          ['Name', record.user_name],
          ['Account email', accountEmail],
          ['Contact email', record.user_email],
          ['Template', record.template_id],
          ['Status', record.status],
          ['Live URL', isDraft || !record.slug ? null : `porfilr.com/p/${record.slug}`],
        ],
        isDraft ? '#0d9488' : '#ea580c',
      ),
    }];

    // Only a genuinely published page earns an email, and which one depends on the
    // template — see api/_lib/liveEmail.js for why both of those were wrong before.
    if (shouldEmailOwner(record)) {
      let ownsKit = false;
      if (isJournalTemplate(record.template_id) && record.user_id) {
        try {
          const { data } = await supabase
            .from('template_purchases')
            .select('id')
            .eq('user_id', record.user_id)
            .eq('template_id', record.template_id)
            .limit(1);
          ownsKit = (data || []).length > 0;
        } catch { /* assume free — the worst case is mentioning a limit they don't have */ }
      }

      const { subject, html } = ownerEmailFor({
        templateId: record.template_id,
        name: record.user_name,
        slug: record.slug,
        ownsKit,
      });
      messages.push({ to: record.user_email, subject, html });
    }
    return messages;
  }

  // ── Draft promoted to published → the "you're live" email ──
  //
  // A journal user's row is INSERTed as a draft and only becomes a real page later, so
  // the publish is an UPDATE. Without this branch they'd never be told their page went
  // live. Gated on the TRANSITION, not on the new value, so ordinary edits to an
  // already-published page don't re-send it.
  //
  // NOTE: this needs the portfolios Database Webhook to have UPDATE ticked, not just
  // INSERT. If journal users stop getting the email, check that first.
  if (table === 'portfolios' && type === 'UPDATE'
      && old.status !== 'active' && record.status === 'active') {
    if (!shouldEmailOwner(record)) return [];

    let ownsKit = false;
    if (isJournalTemplate(record.template_id) && record.user_id) {
      try {
        const { data } = await supabase
          .from('template_purchases')
          .select('id')
          .eq('user_id', record.user_id)
          .eq('template_id', record.template_id)
          .limit(1);
        ownsKit = (data || []).length > 0;
      } catch { /* assume free */ }
    }

    const { subject, html } = ownerEmailFor({
      templateId: record.template_id,
      name: record.user_name,
      slug: record.slug,
      ownsKit,
    });
    return [
      {
        to: ADMIN_EMAIL,
        subject: `🚀 Page published: ${record.user_name || record.slug}`,
        html: shell('🚀 Page published', 'A draft just went live.', [
          ['Name', record.user_name],
          ['Contact email', record.user_email],
          ['Template', record.template_id],
          ['Live URL', `porfilr.com/p/${record.slug}`],
        ], '#ea580c'),
      },
      { to: record.user_email, subject, html },
    ];
  }

  // ── Mobile visitor asked for a "finish on desktop" link → email it to them ──
  if (table === 'desktop_reminders' && type === 'INSERT' && record.email) {
    return [{
      to: record.email,
      subject: 'Finish building your Porfilr portfolio on desktop',
      html: desktopLinkEmail(record.resume_url),
    }];
  }

  // ── New Pro purchase / referral-unlock ──
  if (table === 'subscriptions' && type === 'INSERT' && record.plan === 'pro' && record.status === 'active') {
    return [{
      to: ADMIN_EMAIL,
      subject: '💰 New Pro user',
      html: shell('💰 New Pro user', 'Someone just unlocked Pro (purchase or referral reward).', [
        ['User ID', record.user_id],
        ['Plan', record.plan],
        ['Status', record.status],
      ], '#16a34a'),
    }];
  }

  // ── Existing: custom domain newly set (UPDATE) ──
  if (table === 'portfolios' && type === 'UPDATE' && record.custom_domain && record.custom_domain !== old.custom_domain) {
    return [{
      to: ADMIN_EMAIL,
      subject: `🌐 New custom domain request: ${record.custom_domain}`,
      html: shell('🌐 New custom domain request', 'A Pro user added a custom domain. Add it in Vercel → Settings → Domains.', [
        ['Domain', record.custom_domain],
        ['Portfolio', `${record.user_name || ''} (porfilr.com/p/${record.slug})`],
        ['User email', record.user_email],
      ], '#0f172a'),
    }];
  }

  return []; // nothing to notify for this event
}

// ── Welcome email sent to a brand-new user ──
function welcomeEmail(name) {
  const first = (name || '').split(' ')[0] || 'there';
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:#fff;border-radius:12px;padding:36px;border:1px solid #e2e8f0;">
        <p style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;">Porfil<span style="color:#ea580c;">r</span></p>
        <h1 style="font-size:24px;color:#0f172a;margin:18px 0 10px;">Welcome, ${first} 👋</h1>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
          You're in. Porfilr turns your work into a clean, professional portfolio — live in about 10 minutes, no code required. Here's how to get yours up:
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:8px 0;color:#0f172a;font-size:15px;"><strong>1.</strong> Pick a template</td></tr>
          <tr><td style="padding:8px 0;color:#0f172a;font-size:15px;"><strong>2.</strong> Add your work &amp; details</td></tr>
          <tr><td style="padding:8px 0;color:#0f172a;font-size:15px;"><strong>3.</strong> Hit publish — you're live</td></tr>
        </table>
        <a href="https://porfilr.com/templates" style="display:inline-block;background:#ea580c;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Build my portfolio →</a>
        <p style="color:#64748b;font-size:13px;line-height:1.7;margin:24px 0 0;">
          It's free to start. When you're ready for a custom domain and analytics, Pro is a one-time $19 — no subscription.
        </p>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:20px 0 0;">
          Reply to this email anytime — I read every one.<br/>— Sadiq,<br/>Founder of Porfilr
        </p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You're receiving this because you signed up at porfilr.com</p>
    </div>`;
}

// The "you're live" emails now live in api/_lib/liveEmail.js — there are two of them
// (page vs journal), the choice is template-dependent, and it needed tests.

// ── "Finish on desktop" link for a mobile visitor who hit the Pro builder ──
function desktopLinkEmail(resumeUrl) {
  const url = resumeUrl && /^https?:\/\//.test(resumeUrl) ? resumeUrl : 'https://porfilr.com/templates';
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:#fff;border-radius:12px;padding:36px;border:1px solid #e2e8f0;">
        <p style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;">Porfil<span style="color:#ea580c;">r</span></p>
        <h1 style="font-size:24px;color:#0f172a;margin:18px 0 10px;">Pick up where you left off 💻</h1>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
          You started building on your phone — the editor for this template works best on a bigger screen. Open this link on a laptop or desktop and finish your portfolio in a few minutes:
        </p>
        <a href="${url}" style="display:inline-block;background:#ea580c;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Continue on desktop →</a>
        <p style="color:#64748b;font-size:13px;line-height:1.7;margin:24px 0 0;">Tip: bookmark porfilr.com so it's easy to find when you're back at your computer.</p>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:20px 0 0;">— Sadiq, founder of Porfilr</p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You asked us to email you this link from porfilr.com</p>
    </div>`;
}

// ── Re-engagement nudge for users who signed up but never published ──
function nudgeEmail(name) {
  const first = (name || '').split(' ')[0] || 'there';
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:#fff;border-radius:12px;padding:36px;border:1px solid #e2e8f0;">
        <p style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;">Porfil<span style="color:#ea580c;">r</span></p>
        <h1 style="font-size:24px;color:#0f172a;margin:18px 0 10px;">Your portfolio is one step away, ${first}</h1>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
          You signed up — but haven't published your portfolio yet. It only takes about 10 minutes: pick a template, add your work, hit publish. You'll have a clean, shareable link you can put on every pitch and application.
        </p>
        <a href="https://porfilr.com/templates" style="display:inline-block;background:#ea580c;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Finish my portfolio →</a>
        <p style="color:#64748b;font-size:13px;line-height:1.7;margin:24px 0 0;">
          Free to start, no code, no designer. Stuck on something? Just reply — I'll help.
        </p>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:20px 0 0;">— Sadiq, founder of Porfilr</p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You're receiving this because you signed up at porfilr.com</p>
    </div>`;
}

// ── Find signups with no portfolio (≥1 day old, not yet nudged) and email them once ──
/**
 * Nudge Porfilr Journal buyers who paid but haven't finished setting up — the ones who started
 * and stalled. Three stall points, each with its own message, because "you haven't finished"
 * is useless but "you just need your starting balance" is actionable.
 * Runs daily; each buyer is nudged at most once (kit_nudged_at on template_purchases).
 */
async function sendKitNudges(apiKey) {
  const olderThan1d = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: buyers } = await supabase
    .from('template_purchases')
    .select('user_id, purchased_at')
    .eq('template_id', 'trader-template')
    .is('kit_nudged_at', null)
    .lt('purchased_at', olderThan1d)
    .limit(50);

  if (!buyers || buyers.length === 0) return 0;

  let sent = 0;
  for (const b of buyers) {
    const stamp = new Date().toISOString();
    const mark = () => supabase.from('template_purchases')
      .update({ kit_nudged_at: stamp }).eq('user_id', b.user_id).eq('template_id', 'trader-template');

    // Where did they stall?
    const { data: p } = await supabase
      .from('portfolios')
      .select('id, slug, starting_balance, journal_enabled')
      .eq('user_id', b.user_id).eq('template_id', 'trader-template')
      .maybeSingle();

    let subject = null, body = null;

    if (!p) {
      subject = 'Your Porfilr Journal is waiting';
      body = `You picked up the Porfilr Journal but haven't built your page yet. It takes about 10 minutes — your bio, markets, strategy and how you handle risk.`;
    } else {
      const { count: closed } = await supabase
        .from('trades').select('id', { count: 'exact', head: true })
        .eq('portfolio_id', p.id).not('closed_at', 'is', null);

      if (!(p.starting_balance > 0)) {
        subject = 'One number away from your live track record';
        body = `Your page is up — nice. It just needs your <strong>starting balance</strong> before anything can calculate. Your return % is measured against it, so nothing shows until it's set. It's the first field in your Journal.`;
      } else if (!closed) {
        subject = 'Add your trades and your page comes alive';
        body = `Your balance is set. Now log a few closed trades — or import your whole history at once with a CSV from MT4/MT5 or your broker. Only closed trades count toward your numbers.`;
      } else if (!p.journal_enabled) {
        subject = 'Your track record is ready — just switch it on';
        body = `You've logged trades and your numbers are computed. One switch left: turn on <strong>live track record</strong> in your Journal and your page starts showing your real return, win rate, drawdown and equity curve.`;
      }
    }

    // Fully set up → nothing to nudge, just stop checking them.
    if (!subject) { await mark(); continue; }

    let email = null, name = null;
    try {
      const { data } = await supabase.auth.admin.getUserById(b.user_id);
      email = data?.user?.email || null;
      name = data?.user?.user_metadata?.full_name?.split(' ')[0] || null;
    } catch { /* no email — mark anyway so we don't re-loop */ }

    if (email) {
      const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;color:#181b22;font-size:15px;line-height:1.6;">
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p style="color:#4f5661;">${body}</p>
        <p style="margin:24px 0;"><a href="https://porfilr.com/dashboard" style="background:#e0b252;color:#0b0e14;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Pick up where you left off</a></p>
        <p style="color:#4f5661;">Stuck on anything? Just reply — it comes straight to me.</p>
        <p style="color:#4f5661;">— Sadiq, Porfilr</p>
      </div>`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: email, subject, html, reply_to: 'hello@porfilr.com' }),
      });
      sent++;
    }
    await mark();
  }
  return sent;
}

/**
 * Nudge traders whose LIVE page has gone quiet — no closed trade in 10+ days while their
 * public track record is on.
 *
 * Deliberately NOT a "log your trades twice a week" schedule: that emails people who are
 * already logging, and pressures traders to trade during quiet periods, which is bad advice
 * from a product built on discipline. This only fires when it actually costs them something
 * — their public page is ageing — and at most once every 14 days per trader.
 */
async function sendStaleTrackRecordNudges(apiKey) {
  const STALE_DAYS = 10;
  const COOLDOWN_DAYS = 14;
  const now = Date.now();
  const staleBefore = new Date(now - STALE_DAYS * 864e5).toISOString();
  const cooldownBefore = new Date(now - COOLDOWN_DAYS * 864e5).toISOString();

  // Only live, set-up trader pages can go "stale" in a way that matters.
  const { data: pages } = await supabase
    .from('portfolios')
    .select('id, slug, user_id, stale_nudged_at')
    .eq('template_id', 'trader-template')
    .eq('journal_enabled', true)
    .gt('starting_balance', 0)
    .limit(100);

  if (!pages || pages.length === 0) return 0;

  let sent = 0;
  for (const p of pages) {
    // Respect the cooldown so this can never become a drip campaign.
    if (p.stale_nudged_at && p.stale_nudged_at > cooldownBefore) continue;

    const { data: recent } = await supabase
      .from('trades')
      .select('closed_at')
      .eq('portfolio_id', p.id)
      .not('closed_at', 'is', null)
      .order('closed_at', { ascending: false })
      .limit(1);

    const last = recent && recent[0] ? recent[0].closed_at : null;
    if (!last) continue;                    // never traded — a different nudge handles that
    if (last > staleBefore) continue;       // still current, nothing to say

    const days = Math.floor((now - new Date(last).getTime()) / 864e5);

    let email = null, name = null;
    try {
      const { data } = await supabase.auth.admin.getUserById(p.user_id);
      email = data?.user?.email || null;
      name = (data?.user?.user_metadata?.full_name || '').split(' ')[0] || null;
    } catch { /* fall through */ }

    if (email) {
      const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;color:#181b22;font-size:15px;line-height:1.6;">
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p style="color:#4f5661;">Your track record hasn't had a new closed trade in ${days} days, so your page is starting to look quiet to anyone checking it out.</p>
        <p style="color:#4f5661;">If you've been trading, adding them keeps your page current — that "recently updated" signal is the thing a screenshot can never show. If you've been sitting out, no problem at all: that's discipline, not a gap.</p>
        <p style="margin:24px 0;"><a href="https://porfilr.com/dashboard" style="background:#e0b252;color:#0b0e14;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Update your journal</a></p>
        <p style="color:#4f5661;">— Sadiq, Porfilr</p>
      </div>`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: email, subject: 'Your track record is going quiet', html, reply_to: 'hello@porfilr.com' }),
      });
      sent++;
    }
    await supabase.from('portfolios').update({ stale_nudged_at: new Date().toISOString() }).eq('id', p.id);
  }
  return sent;
}

async function sendPublishNudges(apiKey) {
  const now = Date.now();
  const olderThan1d = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const within7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates } = await supabase
    .from('referrals')
    .select('user_id')
    .is('nudged_at', null)
    .lt('created_at', olderThan1d)
    .gt('created_at', within7d)
    .limit(50);

  if (!candidates || candidates.length === 0) return 0;

  const ids = candidates.map(c => c.user_id);
  const { data: withPortfolio } = await supabase.from('portfolios').select('user_id').in('user_id', ids);
  const hasPortfolio = new Set((withPortfolio || []).map(p => p.user_id));

  let sent = 0;
  for (const c of candidates) {
    const stamp = new Date().toISOString();
    // Already published → just mark so we stop checking them.
    if (hasPortfolio.has(c.user_id)) {
      await supabase.from('referrals').update({ nudged_at: stamp }).eq('user_id', c.user_id);
      continue;
    }
    let email = null, name = null;
    try {
      const { data } = await supabase.auth.admin.getUserById(c.user_id);
      email = data?.user?.email || null;
      name = data?.user?.user_metadata?.full_name || null;
    } catch { /* no email — still mark below to avoid re-looping */ }

    if (email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: email, subject: 'Your Porfilr portfolio is one step away', html: nudgeEmail(name) }),
      });
      sent++;
    }
    await supabase.from('referrals').update({ nudged_at: stamp }).eq('user_id', c.user_id);
  }
  return sent;
}

// ── Daily digest (triggered by a Vercel Cron GET) ──
async function buildDigest() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [signups, portfolios, leads, pros, events] = await Promise.all([
    supabase.from('referrals').select('user_id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('portfolios').select('user_name, template_id, slug').gte('created_at', since).order('created_at', { ascending: false }),
    supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('subscriptions').select('user_id', { count: 'exact', head: true }).eq('plan', 'pro').eq('status', 'active').gte('created_at', since),
    supabase.from('events').select('name').gte('created_at', since),
  ]);

  const newPortfolios = portfolios.data || [];
  const eventCounts = {};
  for (const e of (events.data || [])) eventCounts[e.name] = (eventCounts[e.name] || 0) + 1;

  const stat = (label, value) =>
    `<td style="padding:14px;text-align:center;background:#f8fafc;border-radius:10px;"><div style="font-size:26px;font-weight:700;color:#0f172a;">${value}</div><div style="font-size:12px;color:#64748b;margin-top:2px;">${label}</div></td>`;

  const portfolioList = newPortfolios.length
    ? `<table style="width:100%;border-collapse:collapse;margin-top:8px;">${newPortfolios.slice(0, 15).map(p =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;">${p.user_name || p.slug}</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;text-align:right;">porfilr.com/p/${p.slug}</td></tr>`).join('')}</table>`
    : '<p style="color:#94a3b8;font-size:13px;margin:8px 0 0;">No new portfolios today.</p>';

  const eventRows = Object.keys(eventCounts).length
    ? Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px;">${k}</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${v}</td></tr>`).join('')
    : '<tr><td style="padding:6px 0;color:#94a3b8;font-size:13px;">No tracked events today.</td></tr>';

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <h2 style="margin:0 0 4px;color:#0f172a;font-size:22px;">📊 Porfilr — last 24 hours</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">${new Date().toUTCString().slice(0, 16)}</p>
        <table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:24px;">
          <tr>${stat('Signups', signups.count || 0)}${stat('Portfolios', newPortfolios.length)}${stat('Pro', pros.count || 0)}${stat('Messages', leads.count || 0)}</tr>
        </table>
        <h3 style="margin:0 0 4px;color:#0f172a;font-size:15px;">New portfolios</h3>
        ${portfolioList}
        <h3 style="margin:24px 0 8px;color:#0f172a;font-size:15px;">Activity events</h3>
        <table style="width:100%;border-collapse:collapse;">${eventRows}</table>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">Porfilr daily digest · pageviews live in Cloudflare</p>
    </div>`;

  return { subject: `📊 Porfilr daily digest — ${signups.count || 0} signups, ${newPortfolios.length} portfolios`, html };
}

export default async function handler(req, res) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Email service not configured' });

  // GET = scheduled daily digest (Vercel Cron). Verify the cron secret if one is set.
  if (req.method === 'GET') {
    const secret = process.env.CRON_SECRET;
    if (secret && req.headers.authorization !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const digest = await buildDigest();
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: ADMIN_EMAIL, subject: digest.subject, html: digest.html }),
      });

      // Re-engagement nudges (never let this break the digest).
      let nudged = 0;
      try { nudged = await sendPublishNudges(apiKey); } catch (e) { console.error('Nudge error:', e); }

      let kitNudged = 0;
      try { kitNudged = await sendKitNudges(apiKey); } catch (e) { console.error('Kit nudge error:', e); }

      let staleNudged = 0;
      try { staleNudged = await sendStaleTrackRecordNudges(apiKey); } catch (e) { console.error('Stale nudge error:', e); }

      return res.status(200).json({ ok: true, nudged, kitNudged, staleNudged });
    } catch (err) {
      console.error('Digest error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).end();

  try {
    const messages = await buildEmail(req.body);
    if (!messages || messages.length === 0) return res.status(200).json({ skipped: true });

    await Promise.all(messages.map(m =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: m.to, subject: m.subject, html: m.html }),
      })
    ));

    return res.status(200).json({ ok: true, sent: messages.length });
  } catch (err) {
    console.error('Notify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
