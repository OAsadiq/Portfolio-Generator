// Porfilr — trade CSV import.
//
// Turns a broker CSV export into validated trade rows for the journal. Pure functions so
// the parsing (which is where import bugs live) is unit-tested. Used client-side in the
// Trade Journal; kept here so it shares the test harness with metrics.js / chart.js.
//
// Design stance: never silently drop or mangle a row. Every row either becomes a valid
// trade or is reported with a human reason. These numbers become an investor-facing
// track record — a quietly misparsed P&L is worse than a rejected row.

// ── CSV parsing ────────────────────────────────────────────────────────────
// A real parser (not split-on-comma): handles quoted fields, commas and newlines inside
// quotes, escaped "" quotes, CRLF, and a leading BOM.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const s = String(text || '').replace(/^﻿/, ''); // strip BOM

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } // escaped quote
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      // Close the row on \n or \r\n; swallow the paired \r.
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      // Skip blank lines rather than emit an empty row.
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

// ── Column detection ───────────────────────────────────────────────────────
// Each trade field maps to the header names brokers actually use. Two families are
// covered, and they are shaped very differently:
//
//   FOREX (MT4/MT5, cTrader): one row per round-trip position — open time, close time,
//   entry, exit and profit all on the same row. Maps straight onto a journal trade.
//
//   CRYPTO EXCHANGES (Bybit, MEXC, Binance futures): the useful export is the
//   closed-P&L / position-history one, which is also round-trip but names things
//   differently ("Contracts" for the instrument, "Closed P&L" for profit) and often
//   carries only ONE timestamp — the close. Handled below.
//
// Matching is case-insensitive and ignores non-letters, so "Closed P&L" -> "closedpl".
const FIELD_ALIASES = {
  // "contracts" is a SYMBOL here, not a quantity: Bybit's closed-P&L export puts the
  // instrument (BTCUSDT) under "Contracts". Quantity is "Qty" on the same file.
  symbol:      ['symbol', 'instrument', 'ticker', 'pair', 'market', 'item', 'security',
                'contracts', 'contract', 'coin', 'futures', 'tradingpair'],
  direction:   ['direction', 'side', 'type', 'action', 'buysell', 'longshort', 'position',
                'closingdirection', 'positionside', 'orderside', 'tradeside'],
  opened_at:   ['openedat', 'opentime', 'opendate', 'entrytime', 'entrydate', 'dateopened',
                'open', 'datetime', 'date', 'createtime', 'openingtime'],
  closed_at:   ['closedat', 'closetime', 'closedate', 'exittime', 'exitdate', 'dateclosed',
                'close', 'tradetime', 'closingtime', 'updatetime', 'transactiontime'],
  entry_price: ['entryprice', 'openprice', 'entry', 'priceopen', 'avgentry', 'fillprice',
                'avgentryprice', 'avgopenprice', 'openingprice'],
  exit_price:  ['exitprice', 'closeprice', 'exit', 'priceclose', 'avgexit',
                'avgexitprice', 'avgcloseprice', 'closingprice'],
  size:        ['size', 'lots', 'volume', 'quantity', 'qty', 'units', 'amount',
                'filledqty', 'executedqty', 'closedsize', 'positionsize', 'filled'],
  pnl:         ['pnl', 'profit', 'profitloss', 'netpl', 'netprofit', 'realizedpnl', 'plnet',
                'result', 'gain', 'closedpl', 'realizedpl', 'realisedpnl', 'realisedpl',
                'realizedprofit', 'closedpnl'],
  fees:        ['fees', 'fee', 'commission', 'commissions', 'cost', 'charges',
                'tradingfee', 'feepaid', 'totalfee'],
  notes:       ['notes', 'comment', 'comments', 'note', 'remark'],
};

// Columns that name a CURRENCY rather than carry a number. Binance writes "Fee Coin"
// next to "Fee"; matching the wrong one puts "USDT" where a fee amount belongs, which
// parses to null and silently zeroes every fee in the import.
const CURRENCY_COLUMNS = ['feecoin', 'feeasset', 'commissionasset', 'feecurrency', 'pnlcurrency'];

const norm = (h) => String(h || '').toLowerCase().replace(/[^a-z]/g, '');

/**
 * Best-guess mapping of trade field -> column index (or null).
 *
 * When an export carries only a close time (the crypto closed-P&L shape), the open time
 * is pointed at the same column: a closed-P&L row genuinely doesn't say when the position
 * was opened, and refusing the whole file over a column the exchange never wrote would
 * reject every Bybit and MEXC export outright. `assumedOpenTime` reports it so the UI can
 * be honest about what was inferred.
 */
export function autoDetectMapping(headers) {
  const normed = (headers || []).map(norm);
  const mapping = {};

  // Two passes over ALL fields, with claimed columns removed between them. Doing exact
  // matches everywhere before any loose match is what stops a specific column being
  // stolen by a vague one: Bybit's "Closed P&L" normalises to "closedpl", which contains
  // "close", so a single pass handed it to closed_at and the real "Trade Time" column
  // went unused — every row then failed with "could not read the open date (-400.25)".
  const claimed = new Set();
  const usable = (h, i) => !claimed.has(i) && !CURRENCY_COLUMNS.includes(h);

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const idx = normed.findIndex((h, i) => usable(h, i) && aliases.includes(h));
    mapping[field] = idx === -1 ? null : idx;
    if (idx !== -1) claimed.add(idx);
  }

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (mapping[field] != null) continue;
    const idx = normed.findIndex((h, i) => usable(h, i) && aliases.some((a) => h.includes(a)));
    mapping[field] = idx === -1 ? null : idx;
    if (idx !== -1) claimed.add(idx);
  }

  mapping.assumedOpenTime = false;
  if (mapping.opened_at == null && mapping.closed_at != null) {
    mapping.opened_at = mapping.closed_at;
    mapping.assumedOpenTime = true;
  }

  return mapping;
}

/**
 * Is this a fill-level export rather than a round-trip one?
 *
 * Binance's spot "Trade History" lists individual executions: a buy row and a sell row,
 * with no profit column, because profit only exists once the two are paired. Importing it
 * as-is would create hundreds of bogus open positions. Pairing fills FIFO is a real
 * feature, not a parsing tweak — so detect it and say which export to download instead.
 */
export function looksLikeFillExport(mapping) {
  const has = (f) => mapping[f] != null;
  return !has('pnl') && !has('closed_at') && has('symbol') && has('size');
}

// ── Value coercion ─────────────────────────────────────────────────────────
/** Parse a money/number cell: strips $, thousands commas, spaces; (123) => -123. */
export function parseNumber(raw) {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (s === '' || s === '-' || s === '--' || /^n\/?a$/i.test(s)) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }   // (123.45) accounting negative
  s = s.replace(/[$€£,\s]/g, '');
  if (s.endsWith('-')) { neg = true; s = s.slice(0, -1); }       // trailing-minus formats
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return neg ? -Math.abs(n) : n;
}

/** long/short from buy/sell/long/short/b/s (and MT "0"=buy,"1"=sell). Null if unknown. */
export function parseDirection(raw) {
  const s = String(raw == null ? '' : raw).trim().toLowerCase();
  if (['long', 'buy', 'b', 'bought', 'l', '0'].includes(s)) return 'long';
  if (['short', 'sell', 's', 'sold', '1'].includes(s)) return 'short';
  if (s.includes('buy') || s.includes('long')) return 'long';
  if (s.includes('sell') || s.includes('short')) return 'short';
  return null;
}

/** Tolerant date parse -> ISO string, or null. Handles MT4 dots (2024.01.15 14:30). */
export function parseDate(raw) {
  const s = String(raw == null ? '' : raw).trim();
  if (!s) return null;
  let d = new Date(s);
  if (isNaN(d.getTime())) {
    // MT4/MT5 use "YYYY.MM.DD HH:MM:SS" — swap dots in the date portion for dashes.
    const fixed = s.replace(/^(\d{4})\.(\d{2})\.(\d{2})/, '$1-$2-$3');
    d = new Date(fixed);
  }
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// ── Row → trade ────────────────────────────────────────────────────────────
/**
 * Build a validated trade from one CSV row. Returns { trade } or { error, raw }.
 * `trade` is DB-ready except for user_id/portfolio_id/template_id, added by the caller.
 * Validation mirrors the manual form and the DB constraints exactly.
 */
export function rowToTrade(row, mapping) {
  const cell = (field) => {
    const i = mapping[field];
    return i == null || i < 0 || i >= row.length ? '' : String(row[i] ?? '').trim();
  };

  const symbol = cell('symbol').toUpperCase();
  if (!symbol) return { error: 'Missing symbol' };

  const opened_at = parseDate(cell('opened_at'));
  if (!opened_at) return { error: `Could not read the open date ("${cell('opened_at')}")` };

  const closedRaw = cell('closed_at');
  const closed_at = closedRaw ? parseDate(closedRaw) : null;
  if (closedRaw && !closed_at) return { error: `Could not read the close date ("${closedRaw}")` };
  if (closed_at && new Date(closed_at) < new Date(opened_at)) {
    return { error: 'Close date is before the open date' };
  }

  // direction defaults to long only when the column is absent entirely; if a value is
  // present but unrecognisable, that's an error (don't guess the wrong side).
  let direction = 'long';
  if (mapping.direction != null && mapping.direction >= 0) {
    const d = parseDirection(cell('direction'));
    if (!d) return { error: `Unrecognised direction ("${cell('direction')}")` };
    direction = d;
  }

  const pnlRaw = cell('pnl');
  const pnl = pnlRaw === '' ? null : parseNumber(pnlRaw);
  if (pnlRaw !== '' && pnl === null) return { error: `P&L isn't a number ("${pnlRaw}")` };
  // DB constraint: a closed trade must carry a P&L.
  if (closed_at && pnl === null) return { error: 'Closed trade has no P&L' };

  const size = parseNumber(cell('size'));
  if (cell('size') !== '' && (size === null || size <= 0)) return { error: 'Size must be greater than 0' };

  const entry_price = parseNumber(cell('entry_price'));
  if (cell('entry_price') !== '' && (entry_price === null || entry_price <= 0)) return { error: 'Entry price must be greater than 0' };
  const exit_price = parseNumber(cell('exit_price'));
  if (cell('exit_price') !== '' && (exit_price === null || exit_price <= 0)) return { error: 'Exit price must be greater than 0' };

  let fees = parseNumber(cell('fees'));
  if (cell('fees') !== '' && (fees === null || fees < 0)) return { error: 'Fees cannot be negative' };
  if (fees === null) fees = 0;

  return {
    trade: {
      symbol, direction, opened_at, closed_at,
      entry_price, exit_price, size, pnl, fees,
      notes: cell('notes') || null,
    },
  };
}

/**
 * Parse a full CSV import. Returns headers, the detected mapping, and per-row results
 * (each valid or with an error + line number), so the UI can preview before committing.
 */
export function parseTradeCsv(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return { headers: [], mapping: {}, valid: [], errors: [], totalRows: 0 };

  const headers = rows[0];
  const mapping = autoDetectMapping(headers);
  const dataRows = rows.slice(1);

  // Refuse a fill-level export outright rather than importing hundreds of phantom open
  // positions. Naming the right export is the whole fix, so the message says which one.
  if (looksLikeFillExport(mapping)) {
    return {
      headers,
      mapping,
      valid: [],
      errors: [],
      totalRows: dataRows.length,
      fileError:
        'This looks like a list of individual fills (buys and sells separately), which has no profit per trade. ' +
        'Export your closed positions instead — on Bybit that\'s "Closed P&L", on MEXC and Binance it\'s the ' +
        'futures position or trade history that includes realised P&L.',
    };
  }

  const valid = [];
  const errors = [];
  dataRows.forEach((row, i) => {
    if (row.every((c) => String(c).trim() === '')) return; // skip blank line
    const res = rowToTrade(row, mapping);
    if (res.trade) valid.push(res.trade);
    else errors.push({ line: i + 2, message: res.error, raw: row }); // +2: 1-indexed + header
  });

  return {
    headers,
    mapping,
    valid,
    errors,
    totalRows: dataRows.length,
    // True when the file had no open-time column and the close time was used for both.
    assumedOpenTime: !!mapping.assumedOpenTime,
  };
}

export default parseTradeCsv;
