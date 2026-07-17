// Porfilr — public track-record endpoint for the Trade Journal.
//
//   GET /api/track-record?slug=<portfolio-slug>
//   -> { metrics: {...}, curve: [...], updatedAt, stale }
//
// This is what makes a published trader page LIVE: the page ships as static HTML with
// the last-known numbers baked in, then fetches this at view time for current ones.
//
// SECURITY NOTE — this route runs with the SERVICE KEY, which bypasses RLS. It can
// therefore read any trader's private trades, and it is unauthenticated. That is only
// safe because of two hard rules, both enforced below:
//
//   1. It returns ONLY the computed aggregate from computeMetrics(). Never trade rows,
//      never notes, never symbols, never prices. (There's a test pinning this.)
//   2. It serves only portfolios that have explicitly opted in (journal_enabled) and
//      have a starting balance set. Anything else 404s — no partial data, no leak.
//
// Trade CRUD deliberately does NOT live here. The rest of the app writes to Supabase
// directly with the anon key under RLS (see desktop_reminders), and the trades policies
// already enforce owner-only access. Adding CRUD routes would duplicate that boundary
// in a second place — two things to keep in sync, one more place to get it wrong.

import { createClient } from '@supabase/supabase-js';
import { computeMetrics } from './_lib/metrics.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Published pages are served from porfilr.com AND from users' custom domains, so this
// read is cross-origin by design. The payload is public data (it's rendered on a public
// page), so a wildcard is appropriate here.
function enableCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

// Burst guard only. The CDN cache below absorbs almost all real traffic, so this exists
// to blunt cache-busting hammering, not to police normal readers.
const BURST_WINDOW_MS = 10 * 1000;
const BURST_MAX = 20;
const burstHits = new Map(); // ip -> timestamps

function burstLimited(ip) {
  const now = Date.now();
  const hits = (burstHits.get(ip) || []).filter((t) => now - t < BURST_WINDOW_MS);
  hits.push(now);
  burstHits.set(ip, hits);
  if (burstHits.size > 5000) {
    for (const [k, v] of burstHits) {
      if (!v.some((t) => now - t < BURST_WINDOW_MS)) burstHits.delete(k);
    }
  }
  return hits.length > BURST_MAX;
}

// A track record that stopped updating is worse than no timestamp — "updated 8 months
// ago" actively damages the trader. Past this, the page hides the stamp.
const STALE_AFTER_DAYS = 45;

export default async function handler(req, res) {
  enableCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const slug = String(req.query.slug || '').trim();
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  if (burstLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const { data: portfolio, error: pErr } = await supabase
      .from('portfolios')
      .select('id, journal_enabled, starting_balance, metrics_updated_at')
      .eq('slug', slug)
      .maybeSingle();

    if (pErr) throw pErr;

    // Same 404 for "no such page", "journal off", and "no starting balance" — an
    // attacker shouldn't be able to tell these apart.
    if (!portfolio || !portfolio.journal_enabled || !(portfolio.starting_balance > 0)) {
      return res.status(404).json({ error: 'No track record published for this page' });
    }

    // Only the columns the maths needs. Notably NOT notes — no reason to pull a private
    // field into a process that serialises its output to the public.
    const { data: trades, error: tErr } = await supabase
      .from('trades')
      .select('opened_at, closed_at, pnl, fees')
      .eq('portfolio_id', portfolio.id)
      .not('closed_at', 'is', null)
      .order('closed_at', { ascending: true })
      .limit(5000);

    if (tErr) throw tErr;

    const metrics = computeMetrics(trades || [], portfolio.starting_balance);

    const lastTradeAt = metrics.curve.length
      ? metrics.curve[metrics.curve.length - 1].t
      : null;
    const stale = lastTradeAt
      ? Date.now() - new Date(lastTradeAt).getTime() > STALE_AFTER_DAYS * 86400000
      : true;

    // Persist the aggregate so publish-time can bake it in as the offline fallback.
    // Fire-and-forget: a failed cache write must never fail the read.
    supabase
      .from('portfolios')
      .update({ metrics_cache: metrics, metrics_updated_at: new Date().toISOString() })
      .eq('id', portfolio.id)
      .then(({ error }) => { if (error) console.error('metrics_cache write failed:', error.message); });

    // Matches the published page's own caching. A track record does not need to be
    // real-time; five minutes is indistinguishable to a reader and spares the DB.
    // `?v=` (owner preview links, passed through by the page) opts out entirely so the
    // trader who just logged a trade sees it immediately — and so we don't fill the
    // cache with a throwaway entry per owner visit.
    res.setHeader(
      'Cache-Control',
      req.query.v !== undefined ? 'no-store, max-age=0' : 's-maxage=300, stale-while-revalidate=600'
    );
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    return res.status(200).json({
      metrics: {
        totalReturnPct: metrics.totalReturnPct,
        winRate: metrics.winRate,
        profitFactor: metrics.profitFactor,
        maxDrawdownPct: metrics.maxDrawdownPct,
        totalTrades: metrics.totalTrades,
        trackRecordLabel: metrics.trackRecordLabel,
      },
      curve: metrics.curve,
      lastTradeAt,
      updatedAt: metrics.computedAt,
      stale,
      // Said plainly, in the payload itself, so nothing downstream can mistake what
      // this is. We compute these numbers; we do not verify them.
      disclosure: 'Self-reported by the account holder. Not verified by Porfilr.',
    });
  } catch (err) {
    console.error('track-record error:', err);
    return res.status(500).json({ error: 'Could not load track record' });
  }
}
