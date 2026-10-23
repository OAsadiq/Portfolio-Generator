// Porfilr — what currency a trader's numbers are in, and how to print them.
//
// WHY THIS EXISTS
// Trades store bare numbers. Inside the journal that's fine — the trader knows their own
// currency. But a published page and a shared report card are read by STRANGERS, and
// strangers default to dollars. A Lagos trader's ₦450,000 month reads as $450k to everyone
// who sees it. That's misleading by omission, and it cuts against the one thing Porfilr
// sells: numbers you can take at face value.
//
// Worse, it creates a perverse incentive — the least honest-looking cards would be the
// most impressive ones.
//
// SCOPE, deliberately small:
//   • ONE declaration per journal, set once. Never per-trade.
//   • NO conversion, ever. We state the unit; we don't do FX.
//   • Unset is valid. A bare number still prints — we nudge, we never block.

/** Offered in the journal settings dropdown, in the order shown. */
export const CURRENCIES = [
  { code: 'USD',  symbol: '$',   label: 'US Dollar' },
  { code: 'NGN',  symbol: '₦',   label: 'Nigerian Naira' },
  { code: 'EUR',  symbol: '€',   label: 'Euro' },
  { code: 'GBP',  symbol: '£',   label: 'British Pound' },
  { code: 'USDT', symbol: '',    label: 'USDT' },
  { code: 'CAD',  symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD',  symbol: 'A$',  label: 'Australian Dollar' },
  { code: 'ZAR',  symbol: 'R',   label: 'South African Rand' },
  { code: 'KES',  symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'GHS',  symbol: 'GH₵', label: 'Ghanaian Cedi' },
  { code: 'INR',  symbol: '₹',   label: 'Indian Rupee' },
];

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function isValidCurrency(code) {
  return BY_CODE.has(String(code || '').toUpperCase());
}

/** The currency record, or null when unset or unrecognised. */
export function currencyOf(code) {
  return BY_CODE.get(String(code || '').toUpperCase()) || null;
}

/**
 * Format an amount for display.
 *
 * With a currency: "₦450,000" — or "450,000 USDT" for codes with no symbol, because a
 * trailing code reads naturally where a prefix wouldn't.
 *
 * WITHOUT a currency: a BARE number, never a dollar sign. Defaulting to "$" is precisely
 * the misreading this module exists to prevent — it would be a guess, and wrong for a good
 * share of our audience.
 */
export function formatMoney(amount, code, opts = {}) {
  const { signed = false, round = false } = opts;
  // Number(null) and Number('') are both 0, so a missing value would otherwise render as
  // "$0" — telling a reader the trader finished flat when we simply don't know.
  if (amount === null || amount === undefined || amount === '') return '—';
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';

  const abs = Math.abs(n);
  const body = round
    ? Math.round(abs).toLocaleString('en-US')
    : abs.toLocaleString('en-US', { maximumFractionDigits: 2 });

  const sign = n < 0 ? '-' : (signed && n > 0 ? '+' : '');
  const cur = currencyOf(code);

  if (!cur) return `${sign}${body}`;
  if (!cur.symbol) return `${sign}${body} ${cur.code}`;
  return `${sign}${cur.symbol}${body}`;
}

/**
 * Compact form for chart axes: 1.2M / 31k / 450.
 * Same rule — no symbol invented when the currency is unknown.
 */
export function compactMoney(amount, code) {
  if (amount === null || amount === undefined || amount === '') return '—';
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  const cur = currencyOf(code);
  const prefix = cur?.symbol || '';
  const suffix = cur && !cur.symbol ? ` ${cur.code}` : '';
  const abs = Math.abs(n);

  let body;
  if (abs >= 1e6) body = `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  else if (abs >= 1e4) body = `${Math.round(n / 1000)}k`;
  else if (abs >= 1000) body = `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  else body = String(Math.round(n));

  return `${prefix}${body}${suffix}`;
}

export default formatMoney;
