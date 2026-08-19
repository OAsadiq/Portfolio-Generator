// Porfilr — 24h market movers for the journal sidebar.
//
// Ambient market context, nothing more. Deliberately NOT a signal, a recommendation, or a
// link to trade: the kit is positioned around seeing your own trading clearly, and a
// journal that nudges you to trade more works against that (and against the user).
//
// Pure normalisation + selection here so the ranking rules are unit-tested; the network
// fetching and caching live in api/trending.js.

/** Stablecoins and wrapped majors — a 0.02% move isn't news, and they crowd the list. */
const BORING = new Set([
  'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'FDUSD', 'USDE', 'PYUSD', 'EURT', 'USDP',
]);

/**
 * Leveraged tokens (BTC3LUSDT, ETH5SUSDT). They move 3-5x the underlying by design, so
 * they'd permanently occupy a list sorted by biggest mover while telling you nothing
 * about the market.
 */
export function isLeveragedToken(base) {
  return /\d+[LS]$/i.test(base);
}

/**
 * Below this much 24h quote volume, a big percentage is noise from an illiquid book.
 *
 * Calibrated against live MEXC data, not guessed. At $1M the entire top-movers list was
 * micro-caps (BTW +50%, SHOT -27%) on $1-4M books — meaningless to someone trading majors,
 * and the kind of thing that looks like a pump tip sitting next to their own P&L. At $10M
 * the list becomes BTC / ETH / SOL / XRP. At $50M only two pairs survive.
 */
export const MIN_QUOTE_VOLUME = 10_000_000;

/**
 * Always shown, in this order, when the feed has them. A trader glancing at the panel
 * wants a stable reference — a table whose rows change completely every five minutes is
 * noise, and on a quiet day a pure movers list is either empty or nothing but micro-caps.
 */
export const MAJORS = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'DOGE'];

// Number(null) is 0 and Number('') is 0 — so a missing price would sail through as $0.00
// and a missing change as "flat", both of which read as real data. Reject them first.
// (Same trap chart.js documents; worth repeating rather than sharing, since this file is
// meant to stay standalone.)
const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Normalise MEXC's /api/v3/ticker/24hr rows.
 *
 * CAREFUL: MEXC's priceChangePercent is a FRACTION, not a percentage — BTC moving 0.47%
 * comes back as 0.0047. Rendering it raw shows "0.0047%" and makes every market look
 * dead. Verified against priceChange/prevClosePrice on live data.
 */
export function fromMexc(rows) {
  const out = [];
  for (const r of rows || []) {
    const symbol = String(r?.symbol || '');
    if (!symbol.endsWith('USDT')) continue;          // one quote currency keeps it comparable
    const base = symbol.slice(0, -4);
    if (!base || BORING.has(base) || isLeveragedToken(base)) continue;

    const price = num(r.lastPrice);
    const changePct = num(r.priceChangePercent);
    const volume = num(r.quoteVolume);
    if (price === null || changePct === null || volume === null) continue;

    out.push({ symbol: base, price, changePct: changePct * 100, volume });
  }
  return out;
}

/** Normalise CoinGecko /coins/markets rows. Its percentage is already a percentage. */
export function fromCoinGecko(rows) {
  const out = [];
  for (const r of rows || []) {
    const base = String(r?.symbol || '').toUpperCase();
    if (!base || BORING.has(base) || isLeveragedToken(base)) continue;

    const price = num(r.current_price);
    const changePct = num(r.price_change_percentage_24h);
    const volume = num(r.total_volume);
    if (price === null || changePct === null || volume === null) continue;

    out.push({ symbol: base, price, changePct, volume });
  }
  return out;
}

/**
 * Biggest movers, liquid ones only, newest ranking first.
 * Sorted by ABSOLUTE change so a crash is as visible as a rally — a movers list that only
 * shows green is a lie about the day.
 */
export function topMovers(items, { limit = 8, minVolume = MIN_QUOTE_VOLUME } = {}) {
  return (items || [])
    .filter((i) => i && i.volume >= minVolume && i.changePct !== null)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, limit)
    .map((i) => ({
      symbol: i.symbol,
      price: i.price,
      changePct: Math.round(i.changePct * 100) / 100,
      volume: Math.round(i.volume),
    }));
}

// ── Forex ──────────────────────────────────────────────────────────────────
//
// The majors, in the convention traders actually quote them.
//
// This is the detail that decides whether a trader trusts the panel. Frankfurter (ECB)
// quotes everything against a USD base: USD->EUR = 0.8639. But nobody trades "USDEUR" —
// the pair is EURUSD, and it's 1/0.8639 = 1.1576. Printing 0.8639 next to "EURUSD" is the
// kind of mistake that makes someone close the tab and not come back.
//
// `invert: true` means the ECB rate must be flipped to get the conventional quote. Note
// that inverting also flips the SIGN of the daily change, which is why the change is
// computed from the already-inverted series rather than negated afterwards.
export const FX_PAIRS = [
  { pair: 'EURUSD', ccy: 'EUR', invert: true },
  { pair: 'GBPUSD', ccy: 'GBP', invert: true },
  { pair: 'USDJPY', ccy: 'JPY', invert: false },
  { pair: 'AUDUSD', ccy: 'AUD', invert: true },
  { pair: 'USDCAD', ccy: 'CAD', invert: false },
  { pair: 'USDCHF', ccy: 'CHF', invert: false },
  { pair: 'NZDUSD', ccy: 'NZD', invert: true },
];

/**
 * Normalise a Frankfurter timeseries ({ rates: { 'YYYY-MM-DD': { EUR: n, ... } } }) into
 * panel rows, using the two most recent published days.
 *
 * ECB publishes ONE reference rate per working day, so this is a daily change, not the
 * rolling 24h figure the crypto feed gives. The caller labels it accordingly — presenting
 * it as "24h" beside crypto would be quietly wrong, and on a Sunday it would be a day and
 * a half stale with no indication.
 */
export function fromFrankfurter(payload, pairs = FX_PAIRS) {
  const rates = payload?.rates;
  if (!rates || typeof rates !== 'object') return [];

  const days = Object.keys(rates).sort();          // ISO dates sort chronologically
  if (days.length === 0) return [];
  const latest = rates[days[days.length - 1]];
  const prev = days.length > 1 ? rates[days[days.length - 2]] : null;

  const out = [];
  for (const { pair, ccy, invert } of pairs) {
    const raw = num(latest?.[ccy]);
    if (raw === null || raw === 0) continue;
    const price = invert ? 1 / raw : raw;

    let changePct = null;
    const rawPrev = num(prev?.[ccy]);
    if (rawPrev !== null && rawPrev !== 0) {
      const before = invert ? 1 / rawPrev : rawPrev;
      if (before !== 0) changePct = ((price - before) / before) * 100;
    }
    // No previous publication (first day of a series) means no change to report. Zero
    // would claim the market was flat, which is a different statement.
    if (changePct === null) continue;

    out.push({
      symbol: pair,
      // FX needs the extra places: rounding EURUSD to 2dp turns 1.1576 into 1.16 and
      // erases the range most traders work in.
      price: Math.round(price * 1e5) / 1e5,
      changePct,
      volume: Infinity,   // no volume in ECB data; majors are liquid by definition
      major: true,
      asOf: days[days.length - 1],
    });
  }
  return out;
}

/**
 * What the journal panel actually renders: the majors it can find, then the biggest
 * liquid movers to fill the remaining rows.
 *
 * Each row is tagged `major: true/false` so the UI can show why it's there. Majors keep
 * their fixed order (they're a reference, not a ranking); movers are sorted by absolute
 * change like everywhere else.
 */
export function marketSnapshot(items, { limit = 8, minVolume = MIN_QUOTE_VOLUME, majors = MAJORS } = {}) {
  const list = (items || []).filter((i) => i && i.changePct !== null);
  const bySymbol = new Map(list.map((i) => [i.symbol, i]));

  // Majors bypass the volume floor: BTC is worth showing on a slow day regardless, and
  // it's the one row a trader looks for first.
  const picked = [];
  for (const m of majors) {
    const hit = bySymbol.get(m);
    if (hit && picked.length < limit) picked.push({ ...hit, major: true });
  }

  const taken = new Set(picked.map((p) => p.symbol));
  const movers = topMovers(
    list.filter((i) => !taken.has(i.symbol)),
    { limit: Math.max(0, limit - picked.length), minVolume }
  ).map((m) => ({ ...m, major: false }));

  return [...picked, ...movers].map((i) => ({
    symbol: i.symbol,
    price: i.price,
    changePct: Math.round(i.changePct * 100) / 100,
    // Infinity for FX (no volume published) would serialise to null in JSON; keep it out.
    volume: Number.isFinite(i.volume) ? Math.round(i.volume) : null,
    major: !!i.major,
    ...(i.asOf ? { asOf: i.asOf } : {}),
  }));
}

export default topMovers;
