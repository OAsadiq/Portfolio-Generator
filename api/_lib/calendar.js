// Porfilr — trading performance calendar.
//
// Groups a trader's closed trades into calendar days, so a month can be rendered with each
// day coloured by that day's P&L. Standard in serious trading journals (Tradezella etc.) —
// it shows CONSISTENCY at a glance, which is what an investor actually wants to know:
// steady green, or one huge day carrying a wall of red?
//
// Pure functions, unit-tested. Built on closedTrades() from metrics.js so the calendar can
// never disagree with the headline numbers (same closed-only rule, same net-of-fees maths).

import { closedTrades } from './metrics.js';

/** Local-date key (YYYY-MM-DD) for a Date. Uses UTC so a day never shifts by timezone. */
function dayKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Aggregate closed trades by day.
 * Returns a Map of 'YYYY-MM-DD' -> { pnl, trades, wins, losses }.
 * A trade counts on the day it CLOSED — that's when the money is real.
 */
export function dailyPnl(trades) {
  const byDay = new Map();
  for (const t of closedTrades(trades)) {
    const key = dayKey(t.closedAt);
    const cell = byDay.get(key) || { pnl: 0, trades: 0, wins: 0, losses: 0 };
    cell.pnl += t.net;
    cell.trades += 1;
    if (t.net > 0) cell.wins += 1;
    else if (t.net < 0) cell.losses += 1;
    byDay.set(key, cell);
  }
  // Round once at the end so floating-point noise doesn't accumulate per trade.
  for (const [k, v] of byDay) byDay.set(k, { ...v, pnl: round2(v.pnl) });
  return byDay;
}

/**
 * Build a month grid ready to render.
 * `year` is full (2026), `month` is 1-12.
 * Returns { year, month, label, weeks, summary } where weeks is an array of 7-day rows
 * (leading/trailing nulls pad to whole weeks, Monday-first).
 */
export function monthGrid(trades, year, month) {
  const byDay = dailyPnl(trades);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  // Monday-first: JS getUTCDay() is 0=Sun..6=Sat, so shift Sunday to the end.
  const leadingBlanks = (first.getUTCDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const data = byDay.get(key) || null;
    cells.push({
      day: d,
      date: key,
      pnl: data ? data.pnl : null,      // null = no trades that day (not zero)
      trades: data ? data.trades : 0,
      wins: data ? data.wins : 0,
      losses: data ? data.losses : 0,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // Month summary — only from days that actually traded.
  const traded = cells.filter((c) => c && c.pnl !== null);
  const pnl = round2(traded.reduce((s, c) => s + c.pnl, 0));
  const greenDays = traded.filter((c) => c.pnl > 0).length;
  const redDays = traded.filter((c) => c.pnl < 0).length;

  return {
    year,
    month,
    label: first.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    weeks,
    summary: {
      pnl,
      tradingDays: traded.length,
      greenDays,
      redDays,
      trades: traded.reduce((s, c) => s + c.trades, 0),
    },
  };
}

/**
 * Which months have any activity, newest first — for a month picker.
 * Returns [{ year, month, label }].
 */
export function activeMonths(trades) {
  const seen = new Set();
  const out = [];
  for (const t of closedTrades(trades)) {
    const y = t.closedAt.getUTCFullYear();
    const m = t.closedAt.getUTCMonth() + 1;
    const key = `${y}-${m}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      year: y,
      month: m,
      label: t.closedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
    });
  }
  return out.reverse(); // closedTrades is chronological; newest first is what a picker wants
}

/**
 * Colour intensity for a day cell, 0..1, scaled against the biggest absolute day in view.
 * Lets a heatmap show *degree* — a huge green day reads differently from a scrape.
 * Returns 0 for no-trade days.
 */
export function intensity(pnl, maxAbs) {
  if (pnl === null || pnl === undefined || !maxAbs) return 0;
  const v = Math.abs(pnl) / Math.abs(maxAbs);
  return Math.max(0, Math.min(1, v));
}

/**
 * Render the most recent trading month as HTML for the PUBLISHED page (dark theme).
 * Opt-in only — the trader chooses to show this.
 *
 * Deliberately shows shape, not exact amounts: each day is a coloured cell scaled by size,
 * with no P&L figure printed. It proves consistency (steady green vs one lucky day) without
 * publishing a day-by-day money trail. Returns '' when there's nothing to show.
 */
export function calendarHtml(trades, opts = {}) {
  const months = activeMonths(trades);
  if (!months.length) return '';
  const { year, month } = opts.year && opts.month ? opts : months[0];
  const g = monthGrid(trades, year, month);
  if (!g.summary.tradingDays) return '';

  const cells = g.weeks.flat();
  const maxAbs = Math.max(...cells.filter((c) => c && c.pnl !== null).map((c) => Math.abs(c.pnl)), 0);

  const dayCells = cells
    .map((c) => {
      if (!c) return '<span class="cal-cell cal-blank"></span>';
      if (c.pnl === null) return '<span class="cal-cell"></span>';
      const up = c.pnl > 0;
      const strength = maxAbs ? 0.3 + 0.7 * (Math.abs(c.pnl) / maxAbs) : 0.3;
      const bg = up
        ? `rgba(34,197,94,${(0.16 + 0.5 * strength).toFixed(2)})`
        : c.pnl < 0
          ? `rgba(248,113,113,${(0.16 + 0.5 * strength).toFixed(2)})`
          : 'rgba(255,255,255,.05)';
      return `<span class="cal-cell cal-on" style="background:${bg}"></span>`;
    })
    .join('');

  const dows = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    .map((d) => `<span class="cal-dow">${d}</span>`).join('');

  return `
      <div class="cal-card">
        <div class="cal-head">
          <span class="cal-title">${esc(g.label)}</span>
          <span class="cal-legend">
            <i class="cal-key cal-key-up"></i> profit
            <i class="cal-key cal-key-down"></i> loss
          </span>
        </div>
        <div class="cal-grid">${dows}${dayCells}</div>
        <p class="cal-note">${g.summary.tradingDays} days traded · ${g.summary.greenDays} green · ${g.summary.redDays} red</p>
      </div>`;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default monthGrid;
