// Porfilr — branded short-link redirect + click logger.
//
//   GET /r/:code  ->  logs a click, then 302 to porfilr.com with the right UTM tags.
//
// Branded (it's porfilr.com, so people trust and click it), and we own the click data —
// no third-party shortener. Used to measure each growth person's traffic honestly:
//   porfilr.com/r/c1  ->  utm_content=team_c1   (Candidate 1)
//   porfilr.com/r/c2  ->  utm_content=team_c2   (Candidate 2)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Short code -> where it lands + the utm_content it tags visitors with.
// Personal team links land on the HOME page: not every click is a trader — many are
// creators who just want to try a template, and the home page serves both. Use a
// dedicated code with path '/trader-kit' for trader-only campaigns if needed later.
const CODES = {
  c1: { utm: 'team_c1', path: '/' },
  c2: { utm: 'team_c2', path: '/' },
};

const BASE = 'https://porfilr.com';

export default async function handler(req, res) {
  const code = String(req.query.code || '').trim().toLowerCase();
  const entry = CODES[code] || null;
  const utmContent = entry ? entry.utm : null;

  // Build the destination. Known code -> tagged landing page; unknown -> plain home
  // (never 404 a real person who clicked a link).
  const dest = entry
    ? `${BASE}${entry.path}?utm_source=x&utm_medium=social&utm_campaign=growth&utm_content=${encodeURIComponent(entry.utm)}`
    : `${BASE}/`;

  // Log the click (fire-and-forget — a logging error must never block the redirect).
  try {
    await supabase.from('events').insert({
      name: 'ref_click',
      path: `/r/${code}`,
      props: {
        code,
        utm_content: utmContent,
        known: !!utmContent,
        referrer: req.headers['referer'] || req.headers['referrer'] || null,
        ua: req.headers['user-agent'] || null,
      },
    });
  } catch (err) {
    console.error('ref_click log failed:', err.message);
  }

  // 302 (not 301): the mapping can change, so don't let browsers cache it permanently.
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(302, { Location: dest });
  res.end();
}
