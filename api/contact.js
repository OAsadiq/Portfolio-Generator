import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function enableCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

// ── Rate limiting ──
// Durable window (shared via the leads table, survives cold starts):
const DURABLE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const DURABLE_MAX = 5;                     // max messages per IP per window
// In-memory burst guard (per warm instance, catches rapid-fire bursts):
const BURST_WINDOW_MS = 20 * 1000;         // 20 seconds
const BURST_MAX = 3;
const burstHits = new Map(); // ip -> number[] timestamps

function burstLimited(ip) {
  const now = Date.now();
  const hits = (burstHits.get(ip) || []).filter(t => now - t < BURST_WINDOW_MS);
  hits.push(now);
  burstHits.set(ip, hits);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (burstHits.size > 5000) {
    for (const [k, v] of burstHits) {
      if (!v.some(t => now - t < BURST_WINDOW_MS)) burstHits.delete(k);
    }
  }
  return hits.length > BURST_MAX;
}

export default async function handler(req, res) {
  enableCORS(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ownerEmail, senderName, senderEmail, message, portfolioName, company } = req.body || {};

  // Honeypot: real users never fill the hidden "company" field. Bots do.
  // Return a success response so the bot thinks it worked, but do nothing.
  if (company) {
    return res.status(200).json({ success: true });
  }

  if (!ownerEmail || !senderName || !senderEmail || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail) || !emailRegex.test(ownerEmail)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // ── Rate limit (per IP) ──
  const ip = getClientIp(req);
  const tooManyMsg = 'Too many messages. Please wait a few minutes and try again.';

  // Fast in-memory burst guard.
  if (burstLimited(ip)) {
    return res.status(429).json({ error: tooManyMsg });
  }

  // Durable window backed by the leads table (survives cold starts / instances).
  try {
    const since = new Date(Date.now() - DURABLE_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', since);
    if ((count || 0) >= DURABLE_MAX) {
      return res.status(429).json({ error: tooManyMsg });
    }
  } catch (err) {
    // If the check fails, don't block a legitimate sender — the burst guard still applies.
    console.error('Rate-limit check error:', err);
  }

  // ── Save the lead to the dashboard inbox ──
  // Resolve the owning user/portfolio from the owner email. Each user has at
  // most one portfolio, so the owner email maps to a single record.
  try {
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id, user_id')
      .eq('user_email', ownerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase.from('leads').insert({
      portfolio_id: portfolio?.id || null,
      user_id: portfolio?.user_id || null,
      owner_email: ownerEmail,
      sender_name: senderName,
      sender_email: senderEmail,
      message,
      ip,
    });
  } catch (err) {
    // Don't fail the request if logging the lead errors — the email still matters.
    console.error('Lead insert error:', err);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const emailHtml = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:24px;">New message via your portfolio</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Someone reached out through your Porfilr portfolio${portfolioName ? ` (${escapeHtml(portfolioName)})` : ''}.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:100px;">From</td><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${escapeHtml(senderName)}</td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Email</td><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;"><a href="mailto:${escapeHtml(senderEmail)}" style="color:#2563eb;">${escapeHtml(senderEmail)}</a></td></tr>
        </table>
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0;color:#0f172a;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>
        <a href="https://porfilr.com" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">View your Porfilr portfolio</a>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">Sent via <a href="https://porfilr.com" style="color:#2563eb;">Porfilr</a></p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Porfilr <sadiq@porfilr.com>',
        to: ownerEmail,
        reply_to: senderEmail,
        subject: `New message from ${senderName} via your Porfilr portfolio`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
