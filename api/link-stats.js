// Porfilr — self-serve stats for a growth person's tracked link.
//
//   GET /api/link-stats?code=ayo&key=<LINK_STATS_KEY>
//   -> { code, clicks, botClicks, sales, revenue, commission, since }
//
// Why this exists: growth people are paid partly on commission, and the contract promises
// they can see their own numbers rather than take our word for it. This gives them a URL
// they can check any time.
//
// Only aggregate counts for ONE code are returned — never customer details, never other
// people's numbers. A shared key keeps it from being casually enumerable.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// code -> the utm_content it tags. Must mirror CODES in api/r.js.
const CODE_UTM = {
  c1: 'team_c1',
  c2: 'team_c2',
  g1: 'team_c1_gen',
  g2: 'team_c2_gen',
  ayo: 'ayo',
  ayog: 'ayo_gen',
};

// Commission rate on attributed kit sales (founding offer). Keep in step with contracts.
const COMMISSION_RATE = 0.25;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const expected = process.env.LINK_STATS_KEY;
  if (!expected || req.query.key !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const code = String(req.query.code || '').trim().toLowerCase();
  const utm = CODE_UTM[code];
  if (!utm) return res.status(404).json({ error: 'Unknown link code' });

  try {
    // Clicks — humans only. Bots (link-preview fetchers) are counted separately so the
    // headline number isn't inflated; they were 63% of our first two weeks.
    const { data: clickRows, error: cErr } = await supabase
      .from('events')
      .select('props')
      .eq('name', 'ref_click')
      .limit(10000);
    if (cErr) throw cErr;

    let clicks = 0, botClicks = 0;
    for (const row of clickRows || []) {
      if (row.props?.code !== code) continue;
      if (row.props?.bot === true) botClicks++;
      else clicks++;
    }

    // Sales attributed to this link.
    const { data: sales, error: sErr } = await supabase
      .from('template_purchases')
      .select('amount, purchased_at')
      .eq('attribution', utm)
      .gt('amount', 0);
    if (sErr) throw sErr;

    const revenue = (sales || []).reduce((sum, s) => sum + (s.amount || 0), 0) / 100;

    return res.status(200).json({
      code,
      clicks,                       // real people
      botClicks,                    // link previews, not people
      sales: (sales || []).length,
      revenue: Math.round(revenue * 100) / 100,
      commission: Math.round(revenue * COMMISSION_RATE * 100) / 100,
      note: 'Clicks exclude bot/link-preview fetches. Sales are purchases attributed to this link.',
    });
  } catch (err) {
    console.error('link-stats error:', err);
    return res.status(500).json({ error: 'Could not load stats' });
  }
}
