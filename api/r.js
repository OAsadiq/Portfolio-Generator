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
//
// The team links land on /trader-kit because 100% of current content is trader content —
// a trader arriving from a track-record conversation and landing on a generic portfolio
// homepage bounces (we measured exactly that: 42 real visitors, 0 onward clicks).
// Use the `gen` link when talking to non-trader creators.
const CODES = {
  c1: { utm: 'team_c1', path: '/trader-kit' },
  c2: { utm: 'team_c2', path: '/trader-kit' },
  // General-audience links — same people, non-trader conversations.
  g1: { utm: 'team_c1_gen', path: '/' },
  g2: { utm: 'team_c2_gen', path: '/' },
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

  // Social platforms fetch every shared link to build a preview card. Those hits are NOT
  // people — 63% of our first two weeks of "clicks" were bots, which made the growth
  // numbers look 3x better than reality. Flag them so reporting can count humans only.
  const ua = req.headers['user-agent'] || '';
  const isBot = !ua || /bot|crawler|spider|preview|fetch|curl|python|headless|facebookexternalhit|Twitterbot|WhatsApp|Slackbot|LinkedInBot|Discordbot|TelegramBot|Go-http|axios|node-fetch/i.test(ua);

  // Log the click (fire-and-forget — a logging error must never block the redirect).
  try {
    await supabase.from('events').insert({
      name: 'ref_click',
      path: `/r/${code}`,
      props: {
        code,
        utm_content: utmContent,
        known: !!utmContent,
        bot: isBot,
        referrer: req.headers['referer'] || req.headers['referrer'] || null,
        ua: ua || null,
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
