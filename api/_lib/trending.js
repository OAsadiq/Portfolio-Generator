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
    volume: Math.round(i.volume),
    major: !!i.major,
  }));
}

export default topMovers;
