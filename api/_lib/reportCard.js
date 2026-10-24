// Porfilr — Execution Report Card: the numbers, and the rules about showing them.
//
// One month, one card. Everything the card renders comes from here, and everything Phase 2
// shares, prompts on, or puts on the finishers' wall reads the same object — so a score in
// a tweet can never disagree with the score on the card it came from.
//
// Pure functions. No network, no Supabase. The thin query wrapper lives in
// src/lib/getReportCardStats.ts.
//
// THE RULES THIS FILE OWNS
//   eligible    15+ trades journaled in the month (the 15-Trade Challenge bar)
//   showScore   at least half the month's trades carry a preset tag
//   net result  a PERCENTAGE. Money only when the trader explicitly asks for it.
//
// Why the 50% rule: a score computed from three tagged trades out of forty isn't an
// execution score, it's a sample of a sample. Showing it would be the same sin as a
// screenshot with no context — the thing Porfilr exists to replace.

import { tagStats, inMonth } from './tags.js';
import { closedTrades, totalReturnPct, winRate } from './metrics.js';

/** Trades needed before a month earns a card. Mirrors the 15-Trade Challenge. */
export const CARD_MIN_TRADES = 15;

/** Fraction of a month's trades that must be tagged before a score is shown. */
export const MIN_TAGGED_RATIO = 0.5;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/** 'YYYY-MM' -> 'October 2026'. Returns '' for anything malformed. */
export function monthLabel(yearMonth) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(yearMonth || ''));
  if (!m) return '';
  const idx = Number(m[2]) - 1;
  if (idx < 0 || idx > 11) return '';
  return `${MONTHS[idx]} ${m[1]}`;
}

/** The previous calendar month as 'YYYY-MM'. What the monthly prompt asks about. */
export function previousMonth(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Each day of the month as 'win' | 'loss' | 'flat' | null (no trades closed).
 *
 * The card needs something that could only be THIS month. Four summary numbers could
 * belong to anyone; the shape of a month — where the red clusters, whether the green is
 * steady or one spike — is particular to the trader who traded it.
 *
 * Win/loss only, never amounts, matching the public calendar. A day's P&L is exactly the
 * figure a trader may not want on a post, and this object is rendered into a PNG people
 * put on a timeline.
 *
 * Bucketed on the date STRING, not a parsed Date: the journal stores a mix of plain dates
 * and ISO timestamps, and parsing '2026-09-01' as UTC in a western timezone moves it into
 * August.
 */
export function dayResults(trades, yearMonth) {
  const ym = String(yearMonth || '');
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return [];

  const net = new Map();
  for (const t of Array.isArray(trades) ? trades : []) {
    const d = String(t?.closed_at || '').slice(0, 10);
    if (!d.startsWith(`${ym}-`)) continue;        // open, or another month
    // Explicit emptiness check first: Number(null) and Number('') are both 0, so an
    // unpriced row would otherwise count as a real day that broke exactly even.
    if (t.pnl === null || t.pnl === undefined || t.pnl === '') continue;
    const pnl = Number(t.pnl);
    if (!Number.isFinite(pnl)) continue;
    const fees = Number(t.fees);
    const day = Number(d.slice(8, 10));
    net.set(day, (net.get(day) || 0) + pnl - (Number.isFinite(fees) ? fees : 0));
  }

  const total = new Date(y, m, 0).getDate();
  const out = [];
  for (let d = 1; d <= total; d++) {
    if (!net.has(d)) { out.push(null); continue; }
    const v = net.get(d);
    out.push(v > 0 ? 'win' : v < 0 ? 'loss' : 'flat');
  }
  return out;
}

/**
 * Build the card for one month.
 *
 * @param {Array<any>} trades          every trade for the user (filtered to the month here)
 * @param {string} yearMonth            'YYYY-MM'
 * @param {number|null} [startingBalance] needed for net result %; null leaves it null rather than guessing
 * @param {{showMoney?: boolean}} [options]
 *
 * Returns a flat object — no nested shapes — because three separate surfaces render from
 * it and each one reaching into a different nesting level is how they drift apart.
 */
export function reportCardStats(trades, yearMonth, startingBalance = null, options = {}) {
  const { showMoney = false } = options;
  const month = inMonth(trades, yearMonth);
  const closed = closedTrades(month);
  const tags = tagStats(month);

  const journaled = month.length;
  const eligible = journaled >= CARD_MIN_TRADES;

  // Tagged ratio comes from tagStats and is null on an empty month. Treat that as 0 so
  // the comparison below can't be accidentally true for a month with nothing in it.
  const taggedRatio = tags.taggedRatio ?? 0;
  const showScore = tags.tagged > 0 && taggedRatio >= MIN_TAGGED_RATIO;

  // The money figure, ONLY when the trader asked for it.
  //
  // The key is omitted entirely rather than set to null when the toggle is off. Null would
  // still be a property a template could print, and this object is rendered into a PNG
  // people post publicly — the safest version of "don't show it" is "it isn't there".
  //
  // Deliberately UNLABELLED, matching how the journal already renders P&L. There is no
  // currency column on trades: a trader in Lagos logging naira and one in Ohio logging
  // dollars both just type numbers. Printing "$" on a shared card would be a guess, and a
  // wrong one roughly half the time.
  const money = showMoney
    ? { netResultValue: closed.reduce((s, c) => s + c.net, 0) }
    : {};

  return {
    yearMonth: String(yearMonth || ''),
    label: monthLabel(yearMonth),
    showMoney: !!showMoney,
    ...money,

    // Counts
    journaled,
    closed: closed.length,
    tagged: tags.tagged,
    clean: tags.clean,
    untagged: journaled - tags.tagged,

    // Gates
    eligible,
    minTrades: CARD_MIN_TRADES,
    showScore,
    taggedRatio,

    // The score itself. NULL when it must not be shown — callers render the
    // "tag your trades to unlock" state rather than a number, and Phase 2's share button
    // keys off this being null to hide itself entirely.
    score: showScore ? tags.score : null,
    scorePct: showScore && tags.score !== null ? Math.round(tags.score * 100) : null,

    // Leaks. Only meaningful alongside a score, for the same reason.
    biggestLeak: showScore ? tags.biggestLeak : null,

    // The month's shape, for the card's day strip. Win/loss only — see dayResults.
    days: dayResults(month, yearMonth),
    negatives: tags.negatives,

    // Performance. A PERCENTAGE — never money by default. `netResultPct` is null when
    // there's no starting balance to measure against, which is honest; inventing one
    // would silently produce a wrong number on something built to be shared.
    // NOTE: these take the RAW month trades, not `closed`. closedTrades() returns
    // {closedAt, openedAt, net} — a different shape — and these helpers call it again
    // internally. Feeding them the transformed array makes both silently return null,
    // which would have printed a blank net result on every card.
    netResultPct: totalReturnPct(month, startingBalance),
    winRatePct: winRate(month),
  };
}

/**
 * What the card should say instead of a score, when it can't show one.
 * Returns null when the score is fine to render.
 */
export function blockedReason(stats) {
  if (!stats) return 'no-data';
  if (!stats.eligible) return 'not-enough-trades';
  if (!stats.showScore) return 'not-enough-tagged';
  return null;
}

/**
 * The footer, fixed by the guardrails. Never "verified", never "audited".
 * Kept here so the card, the PNG and any future surface share one string.
 */
export function cardFooter(stats) {
  const n = stats?.journaled ?? 0;
  return `Computed from ${n} journaled trade${n === 1 ? '' : 's'}. `
    + `Porfilr doesn't audit results — your numbers, computed honestly.`;
}

/**
 * The execution score for a trader's WHOLE journal, for the published page.
 *
 * Lifetime, not monthly, because it sits beside lifetime metrics — total return, win rate,
 * drawdown. A monthly figure in that row would look like it covered the same period and
 * quietly mean something else.
 *
 * Same 50% gate as the card: returns null when too little is tagged, and the template
 * drops an absent metric rather than printing a dash. A score from a handful of tagged
 * trades is the screenshot problem wearing a percentage sign.
 *
 * @returns {number|null} whole percent, or null when it must not be shown
 */
export function publicExecutionScore(trades) {
  const all = Array.isArray(trades) ? trades : [];
  if (!all.length) return null;
  const tags = tagStats(all);
  if (!tags.tagged) return null;
  const ratio = tags.taggedRatio ?? 0;
  if (ratio < MIN_TAGGED_RATIO) return null;
  if (tags.score === null) return null;
  return Math.round(tags.score * 100);
}

export default reportCardStats;
