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

import { fromMexc, fromCoinGecko, fromFrankfurter, marketSnapshot, FX_PAIRS } from './_lib/trending.js';

/** Start of the timeseries window: far enough back to clear a long weekend or a holiday
 *  and still find two ECB publications. */
function fxSince() {
  const d = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

const MARKETS = {
  crypto: {
    // "24h" is literal here: a rolling window from the exchange.
    changeLabel: '24h',
    sources: [
      {
        name: 'mexc',
        url: () => 'https://api.mexc.com/api/v3/ticker/24hr',
        parse: fromMexc,
      },
      {
        name: 'coingecko',
        url: () => 'https://api.coingecko.com/api/v3/coins/markets'
                 + '?vs_currency=usd&order=volume_desc&per_page=100&page=1&price_change_percentage=24h',
        parse: fromCoinGecko,
      },
    ],
  },
  forex: {
    // NOT "24h". The ECB publishes one reference rate per working day, so this is the
    // move since the previous publication — which over a weekend is three days ago.
    // Labelling it "24h" to match the crypto tab would be quietly false.
    changeLabel: 'vs prev close',
    sources: [
      {
        name: 'ecb',
        url: () => `https://api.frankfurter.app/${fxSince()}..`
                 + `?from=USD&to=${FX_PAIRS.map((p) => p.ccy).join(',')}`,
        parse: fromFrankfurter,
        // Every FX row is a major: liquid by definition, no volume published, and a fixed
        // set of seven. Passing them all as `majors` keeps them in conventional order —
        // ranking seven fixed pairs by biggest mover would reshuffle the table daily for
        // no benefit, and traders scan this list by position.
        snapshot: (items) => marketSnapshot(items, {
          majors: FX_PAIRS.map((p) => p.pair),
          minVolume: 0,
          limit: FX_PAIRS.length,
        }),
      },
    ],
  },
};

// Warm-invocation cache. The CDN header below does the real work; this just stops a burst
// of requests on one warm instance from hitting the upstream repeatedly.
const TTL_MS = 5 * 60 * 1000;
const cache = new Map();   // market -> { at, body }

async function fetchSource(src) {
  // Upstreams are third parties on someone else's page-load path — never wait long.
  const res = await fetch(src.url(), {
    signal: AbortSignal.timeout(6000),
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${src.name} responded ${res.status}`);
  const json = await res.json();
  const items = (src.snapshot || marketSnapshot)(src.parse(json));
  if (!items.length) throw new Error(`${src.name} returned nothing usable`);
  return items;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Unknown values fall back to crypto rather than erroring — this panel is never worth
  // a failed request, and the query string comes straight from a URL.
  const key = String(req.query?.market || '').toLowerCase();
  const market = MARKETS[key] ? key : 'crypto';
  const cfg = MARKETS[market];

  const hit = cache.get(market);
  if (hit && Date.now() - hit.at < TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    return res.status(200).json(hit.body);
  }

  for (const src of cfg.sources) {
    try {
      const items = await fetchSource(src);
      const body = {
        items,
        market,
        changeLabel: cfg.changeLabel,
        source: src.name,
        updatedAt: new Date().toISOString(),
        // FX rows carry the ECB publication date; surfacing it stops a Monday-morning
        // reader assuming Friday's rates are live.
        asOf: items[0]?.asOf || null,
      };
      cache.set(market, { at: Date.now(), body });
      // stale-while-revalidate: an upstream outage keeps serving the last good list
      // instead of blanking the widget.
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
      return res.status(200).json(body);
    } catch (err) {
      console.error(`trending(${market}): ${src.name} failed —`, err.message);
    }
  }

  // Everything failed. Serve the last good list if we have one, however old — stale
  // market data labelled as stale beats an empty panel.
  if (hit) {
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).json({ ...hit.body, stale: true });
  }

  res.setHeader('Cache-Control', 's-maxage=60');
  return res.status(200).json({ items: [], market, source: null, updatedAt: null });
}
