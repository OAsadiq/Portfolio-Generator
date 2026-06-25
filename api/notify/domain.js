import { createClient } from '@supabase/supabase-js';

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
      messages.push({ to: email, subject: 'Welcome to Porfilr 🟠 — let’s get your portfolio live', html: welcomeEmail(name) });
    }
    return messages;
  }

  // ── New portfolio published ──
  if (table === 'portfolios' && type === 'INSERT') {
    return [{
      to: ADMIN_EMAIL,
      subject: `🚀 New portfolio: ${record.user_name || record.slug}`,
      html: shell('🚀 New portfolio published', 'A user just published a portfolio.', [
        ['Name', record.user_name],
        ['Email', record.user_email],
        ['Template', record.template_id],
        ['Live URL', record.slug ? `porfilr.com/p/${record.slug}` : null],
      ], '#ea580c'),
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
          Reply to this email anytime — I read every one.<br/>— Sadiq, founder of Porfilr
        </p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You're receiving this because you signed up at porfilr.com</p>
    </div>`;
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
      return res.status(200).json({ ok: true });
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
