// Porfilr — public founding-spots counter for a kit.
//
//   GET /api/kit-stats?kit=trader-template
//   -> { kit, claimed, limit, spotsLeft, open }
//
// Powers the "X of 20 founding spots claimed" counter and the "founding closed" flip.
// Public and unauthenticated — it exposes only an aggregate count, never who bought.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// The founding cohort size per kit. When claimed >= limit, the offer closes and the
// page flips to the monthly plan.
const FOUNDING_LIMITS = { 'trader-template': 20 };
const DEFAULT_LIMIT = 20;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const kit = String(req.query.kit || 'trader-template').trim();
  const limit = FOUNDING_LIMITS[kit] || DEFAULT_LIMIT;

  try {
    // Count PAID spots only. Free grants (testers, referral credits) insert amount: 0 —
    // they shouldn't consume a visible founding spot on the public counter.
    const { count, error } = await supabase
      .from('template_purchases')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', kit)
      .gt('amount', 0);
    if (error) throw error;

    const claimed = count || 0;
    // 60s edge cache: the counter should feel live but doesn't need to be exact-to-the-second.
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({
      kit,
      claimed,
      limit,
      spotsLeft: Math.max(0, limit - claimed),
      open: claimed < limit,
    });
  } catch (err) {
    console.error('kit-stats error:', err);
    return res.status(500).json({ error: 'Could not load founding stats' });
  }
}
