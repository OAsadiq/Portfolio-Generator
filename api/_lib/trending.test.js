// Porfilr — market movers tests.  Run: npm test
//
// A movers table is only worth showing if the ranking is honest: real percentages, both
// directions, and nothing illiquid or synthetic crowding the list.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fromMexc, fromCoinGecko, fromFrankfurter, topMovers, marketSnapshot,
  isLeveragedToken, MIN_QUOTE_VOLUME,
} from './trending.js';

const mexcRow = (symbol, pct, vol, price = 100) => ({
  symbol, priceChangePercent: String(pct), quoteVolume: String(vol), lastPrice: String(price),
});

test('MEXC percentages are fractions and get scaled', () => {
  // The trap: MEXC sends 0.0047 for a 0.47% move. Shipping it raw shows "0.0047%" and
  // makes every market look flat. Verified against live data (priceChange/prevClose).
  const [btc] = fromMexc([mexcRow('BTCUSDT', '0.0047', 354378267, '64358.23')]);
  assert.equal(btc.symbol, 'BTC');
  assert.equal(Math.round(btc.changePct * 100) / 100, 0.47);
  assert.equal(btc.price, 64358.23);
});

test('CoinGecko percentages are already percentages', () => {
  const [x] = fromCoinGecko([
    { symbol: 'sol', current_price: 180.5, price_change_percentage_24h: 6.2, total_volume: 5e8 },
  ]);
  assert.equal(x.symbol, 'SOL');
  assert.equal(x.changePct, 6.2, 'not multiplied by 100 as well');
});

test('the two sources agree on scale for the same move', () => {
  // Both feeds have to produce the same number, or the table silently changes meaning
  // when the primary source is down and the fallback takes over.
  const [a] = fromMexc([mexcRow('SOLUSDT', '0.062', 5e8)]);
  const [b] = fromCoinGecko([
    { symbol: 'sol', current_price: 100, price_change_percentage_24h: 6.2, total_volume: 5e8 },
  ]);
  assert.equal(Math.round(a.changePct * 10) / 10, b.changePct);
});

test('only USDT pairs are kept, and the suffix is stripped', () => {
  const out = fromMexc([mexcRow('ETHUSDT', '0.05', 9e8), mexcRow('ETHBTC', '0.05', 9e8)]);
  assert.equal(out.length, 1);
  assert.equal(out[0].symbol, 'ETH');
});

test('stablecoins are excluded', () => {
  // A 0.02% move on USDC is not news, and they'd otherwise fill the list on a quiet day.
  assert.equal(fromMexc([mexcRow('USDCUSDT', '0.0001', 9e9)]).length, 0);
  assert.equal(fromCoinGecko([
    { symbol: 'dai', current_price: 1, price_change_percentage_24h: 0.01, total_volume: 9e9 },
  ]).length, 0);
});

test('leveraged tokens are excluded', () => {
  // BTC3L moves 3x the underlying by design, so it would permanently top a "biggest
  // mover" list while saying nothing about the market.
  assert.equal(isLeveragedToken('BTC3L'), true);
  assert.equal(isLeveragedToken('ETH5S'), true);
  assert.equal(isLeveragedToken('BTC'), false);
  assert.equal(isLeveragedToken('SOL'), false);
  assert.equal(fromMexc([mexcRow('BTC3LUSDT', '0.15', 9e8)]).length, 0);
});

test('illiquid pumps are filtered out', () => {
  // A +900% move on $12k of volume is a thin book, not a market event. Showing it next to
  // a trader's own numbers implies it is worth acting on.
  const movers = topMovers([
    { symbol: 'SCAM', price: 0.01, changePct: 900, volume: 12_000 },
    { symbol: 'ETH', price: 3000, changePct: 4.1, volume: 9e8 },
  ]);
  assert.equal(movers.length, 1);
  assert.equal(movers[0].symbol, 'ETH');
});

test('losers rank alongside winners', () => {
  // Sorted on ABSOLUTE change. A table that only shows green is a lie about the day —
  // and this product is meant to help someone see their trading honestly.
  const movers = topMovers([
    { symbol: 'AAA', price: 1, changePct: 5, volume: 9e8 },
    { symbol: 'BBB', price: 1, changePct: -18, volume: 9e8 },
    { symbol: 'CCC', price: 1, changePct: 9, volume: 9e8 },
  ], { limit: 2 });
  assert.deepEqual(movers.map((m) => m.symbol), ['BBB', 'CCC']);
});

test('the list respects its limit and rounds percentages', () => {
  const raw = Array.from({ length: 30 }, (_, i) => ({
    symbol: `T${i}`, price: 1, changePct: i + 0.123456, volume: 9e8,
  }));
  const movers = topMovers(raw, { limit: 8 });
  assert.equal(movers.length, 8);
  assert.equal(movers[0].changePct, 29.12);
});

test('bad rows are skipped, not rendered as zero', () => {
  // Number(null) is 0 — a null price rendered as $0.00 would look like a crashed market.
  const out = fromMexc([
    mexcRow('OKUSDT', '0.05', 9e8),
    { symbol: 'BADUSDT', priceChangePercent: null, quoteVolume: '9e8', lastPrice: '1' },
    { symbol: 'ALSOBADUSDT', priceChangePercent: '0.05', quoteVolume: '9e8', lastPrice: 'n/a' },
  ]);
  assert.deepEqual(out.map((o) => o.symbol), ['OK']);
});

test('empty and malformed input never throws', () => {
  assert.deepEqual(fromMexc(null), []);
  assert.deepEqual(fromMexc(undefined), []);
  assert.deepEqual(fromCoinGecko([]), []);
  assert.deepEqual(topMovers(null), []);
  assert.deepEqual(topMovers([null, undefined]), []);
});

test('the volume floor is high enough to exclude micro-caps', () => {
  // At $1M the live list was BTW +50%, SHOT -27% on $1-4M books. Calibrated against real
  // MEXC data — see the comment on the constant.
  assert.ok(MIN_QUOTE_VOLUME >= 10_000_000);
});

// ── The panel's actual contents ────────────────────────────────────────────

const feed = [
  { symbol: 'BTC', price: 64000, changePct: 0.37, volume: 3.5e8 },
  { symbol: 'ETH', price: 3000, changePct: 1.03, volume: 1.2e8 },
  { symbol: 'SOL', price: 180, changePct: 2.0, volume: 4e7 },
  { symbol: 'WILD', price: 0.5, changePct: -19.4, volume: 6e7 },
  { symbol: 'MID', price: 2, changePct: 8.1, volume: 3e7 },
  { symbol: 'THIN', price: 0.01, changePct: 400, volume: 50_000 },
];

test('majors lead the panel in their fixed order', () => {
  const snap = marketSnapshot(feed, { limit: 5 });
  assert.deepEqual(snap.slice(0, 3).map((s) => s.symbol), ['BTC', 'ETH', 'SOL']);
  assert.equal(snap[0].major, true);
});

test('remaining rows are the biggest liquid movers', () => {
  const snap = marketSnapshot(feed, { limit: 5 });
  assert.deepEqual(snap.slice(3).map((s) => s.symbol), ['WILD', 'MID']);
  assert.equal(snap[3].major, false);
  assert.equal(snap.some((s) => s.symbol === 'THIN'), false, 'illiquid pump excluded');
});

test('a major is never duplicated as a mover', () => {
  // SOL is both a major and a big mover — it must appear once.
  const snap = marketSnapshot(feed, { limit: 8 });
  assert.equal(snap.filter((s) => s.symbol === 'SOL').length, 1);
});

test('majors show even below the liquidity floor', () => {
  // BTC is worth a row on a slow day regardless — it's the row people look for first.
  const snap = marketSnapshot([{ symbol: 'BTC', price: 64000, changePct: 0.1, volume: 1000 }]);
  assert.equal(snap.length, 1);
  assert.equal(snap[0].symbol, 'BTC');
});

test('the panel respects its limit', () => {
  assert.equal(marketSnapshot(feed, { limit: 2 }).length, 2);
  assert.equal(marketSnapshot(feed, { limit: 99 }).length, 5, 'only what passes the floor');
});

test('an empty feed yields an empty panel, not a crash', () => {
  assert.deepEqual(marketSnapshot([]), []);
  assert.deepEqual(marketSnapshot(null), []);
});

// ── Forex ──────────────────────────────────────────────────────────────────

// Two ECB publications. USD is the base, so these are USD->X and several need inverting.
const fx = {
  rates: {
    '2026-08-17': { EUR: 0.86259, GBP: 0.73800, JPY: 159.20, CAD: 1.39000 },
    '2026-08-18': { EUR: 0.86386, GBP: 0.73933, JPY: 159.70, CAD: 1.38740 },
  },
};

test('EURUSD is quoted the way traders quote it, not as the ECB base', () => {
  // The trust test. ECB says USD->EUR = 0.86386; the pair is EURUSD = 1/0.86386 = 1.1576.
  // Printing 0.86 next to "EURUSD" makes a trader distrust everything else on the page.
  const rows = fromFrankfurter(fx);
  const eur = rows.find((r) => r.symbol === 'EURUSD');
  assert.ok(Math.abs(eur.price - 1.15759) < 0.001, `got ${eur.price}`);
});

test('a non-inverted pair keeps the ECB rate as-is', () => {
  // USDJPY is already quoted USD-first, so it must NOT be flipped.
  const jpy = fromFrankfurter(fx).find((r) => r.symbol === 'USDJPY');
  assert.equal(jpy.price, 159.7);
});

test('inverting a pair flips the sign of its daily change', () => {
  // USD->EUR rose (0.86259 -> 0.86386), so the dollar strengthened and EURUSD FELL.
  // Computing the change before inverting would print a gain on a losing day.
  const eur = fromFrankfurter(fx).find((r) => r.symbol === 'EURUSD');
  assert.ok(eur.changePct < 0, `EURUSD should be down, got ${eur.changePct}`);

  const jpy = fromFrankfurter(fx).find((r) => r.symbol === 'USDJPY');
  assert.ok(jpy.changePct > 0, 'USDJPY rose with the dollar');
});

test('the two directions agree in magnitude', () => {
  // EUR moved 0.147% against the dollar; the inverted pair must show the same size move.
  const eur = fromFrankfurter(fx).find((r) => r.symbol === 'EURUSD');
  assert.ok(Math.abs(Math.abs(eur.changePct) - 0.147) < 0.01, `got ${eur.changePct}`);
});

test('FX prices keep enough decimals to be usable', () => {
  // Rounding EURUSD to 2dp gives 1.16 and erases the range traders work in.
  const eur = fromFrankfurter(fx).find((r) => r.symbol === 'EURUSD');
  assert.ok(String(eur.price).split('.')[1].length >= 4);
});

test('a single publication reports no change rather than zero', () => {
  // "0.00%" claims the market was flat. With one data point we simply do not know.
  const rows = fromFrankfurter({ rates: { '2026-08-18': { EUR: 0.86386 } } });
  assert.deepEqual(rows, []);
});

test('a currency missing from the feed is skipped, not zeroed', () => {
  const rows = fromFrankfurter(fx);
  assert.equal(rows.some((r) => r.symbol === 'USDCHF'), false, 'CHF absent from this payload');
  assert.equal(rows.some((r) => r.symbol === 'USDCAD'), true);
});

test('malformed forex payloads never throw', () => {
  assert.deepEqual(fromFrankfurter(null), []);
  assert.deepEqual(fromFrankfurter({}), []);
  assert.deepEqual(fromFrankfurter({ rates: {} }), []);
  assert.deepEqual(fromFrankfurter({ rates: { '2026-08-18': { EUR: 0 } } }), []);
});

test('forex rows survive the snapshot without a volume figure', () => {
  // ECB publishes no volume, so the liquidity floor must not silently drop every pair.
  const snap = marketSnapshot(fromFrankfurter(fx), { majors: [] });
  assert.ok(snap.length >= 3, `expected FX rows through, got ${snap.length}`);
});
