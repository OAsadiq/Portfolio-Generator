// Porfilr — GET /api/trending
//
// 24h market movers for the journal. Public market data only: no API keys, no user data,
// no affiliate links, nothing that tells anyone what to trade.
//
// SOURCE ORDER MATTERS. Verified from a US IP (Vercel's default region):
//   Binance  -> 451 "restricted location"
//   Bybit    -> 403 CloudFront country block
//   MEXC     -> 200 OK
// So MEXC is primary and CoinGecko is the fallback. Binance and Bybit are deliberately
// absent: adding them would mean a guaranteed failed request on every cold cache.
//
// Failure is quiet by design — this is ambient decoration on a page that matters. It
// returns 200 with an empty list so the widget hides itself rather than showing an error
// box in the middle of someone's trading journal.

import { fromMexc, fromCoinGecko, marketSnapshot } from './_lib/trending.js';

const SOURCES = [
  {
    name: 'mexc',
    url: 'https://api.mexc.com/api/v3/ticker/24hr',
    parse: fromMexc,
  },
  {
    name: 'coingecko',
    url: 'https://api.coingecko.com/api/v3/coins/markets'
       + '?vs_currency=usd&order=volume_desc&per_page=100&page=1&price_change_percentage=24h',
    parse: fromCoinGecko,
  },
];

// Warm-invocation cache. The CDN header below does the real work; this just stops a burst
// of requests on one warm instance from hitting the upstream repeatedly.
const TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, body: null };

async function fetchSource(src) {
  // Upstreams are third parties on someone else's page-load path — never wait long.
  const res = await fetch(src.url, {
    signal: AbortSignal.timeout(6000),
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${src.name} responded ${res.status}`);
  const json = await res.json();
  const items = marketSnapshot(src.parse(json));
  if (!items.length) throw new Error(`${src.name} returned nothing usable`);
  return items;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (cache.body && Date.now() - cache.at < TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    return res.status(200).json(cache.body);
  }

  for (const src of SOURCES) {
    try {
      const items = await fetchSource(src);
      const body = { items, source: src.name, updatedAt: new Date().toISOString() };
      cache = { at: Date.now(), body };
      // stale-while-revalidate: an upstream outage keeps serving the last good list
      // instead of blanking the widget.
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
      return res.status(200).json(body);
    } catch (err) {
      console.error(`trending: ${src.name} failed —`, err.message);
    }
  }

  // Everything failed. Serve the last good list if we have one, however old — stale
  // market data labelled with its timestamp beats an empty panel.
  if (cache.body) {
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).json({ ...cache.body, stale: true });
  }

  res.setHeader('Cache-Control', 's-maxage=60');
  return res.status(200).json({ items: [], source: null, updatedAt: null });
}
