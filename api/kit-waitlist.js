// Porfilr — public email capture for a kit's founding offer.
//
//   POST /api/kit-waitlist  { email, firstName?, kit?, company? (honeypot) }
//
// For visitors who aren't ready to buy: "notify me before the price changes." Every
// signup lands in kit_waitlist (kit-specific) AND newsletter_subscribers (the marketing
// list) — solving the email-list gap. Public and unauthenticated, so it carries the same
// honeypot + rate limit as the contact form.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function enableCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

// In-memory burst guard (per warm instance) — blunts rapid-fire spam.
const BURST_WINDOW_MS = 20 * 1000;
const BURST_MAX = 5;
const burstHits = new Map();
function burstLimited(ip) {
  const now = Date.now();
  const hits = (burstHits.get(ip) || []).filter((t) => now - t < BURST_WINDOW_MS);
  hits.push(now);
  burstHits.set(ip, hits);
  if (burstHits.size > 5000) {
    for (const [k, v] of burstHits) if (!v.some((t) => now - t < BURST_WINDOW_MS)) burstHits.delete(k);
  }
  return hits.length > BURST_MAX;
}

const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export default async function handler(req, res) {
  enableCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, firstName, kit, company } = req.body || {};

    // Honeypot: bots fill hidden fields. Pretend success, write nothing.
    if (company) return res.status(200).json({ success: true });

    const clean = String(email || '').trim().toLowerCase();
    if (!validEmail(clean)) return res.status(400).json({ error: 'Enter a valid email.' });
    if (burstLimited(getClientIp(req))) return res.status(429).json({ error: 'Please wait a moment and try again.' });

    const kitId = String(kit || 'trader-template').trim();
    const first = firstName ? String(firstName).trim().slice(0, 80) : null;

    // Kit-specific list. Ignore duplicates rather than error at the user.
    const { error: kitErr } = await supabase
      .from('kit_waitlist')
      .insert({ email: clean, kit: kitId });
    if (kitErr && !/duplicate|unique/i.test(kitErr.message)) {
      console.error('kit_waitlist insert:', kitErr.message);
    }

    // Marketing list (the point of the whole exercise). Duplicates are fine.
    const { error: nlErr } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: clean, first_name: first, source: `kit_waitlist:${kitId}`, is_active: true });
    if (nlErr && !/duplicate|unique/i.test(nlErr.message)) {
      console.error('newsletter insert:', nlErr.message);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('kit-waitlist error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
