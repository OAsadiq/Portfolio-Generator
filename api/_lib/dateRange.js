/**
 * Timeline ranges for the trade list.
 *
 * A trader asking "what did I do this week?" is asking a different question from
 * "show me September". The month dropdown this replaces could only answer the second,
 * which left the most common review window — the week just gone — unreachable.
 *
 * Everything here compares on the DATE PART of a timestamp ('YYYY-MM-DD'), never on
 * parsed Date objects. Trade rows carry a mix of plain dates and full ISO timestamps,
 * and parsing 'YYYY-MM-DD' as UTC while the trader lives in UTC-5 silently files their
 * Monday trades under Sunday. String comparison on a zero-padded date is exact, sorts
 * correctly, and has no timezone to get wrong.
 *
 * Weeks start Monday: the trading week does, and a Sunday-start "this week" would split
 * a normal week of trades across two buckets.
 */

/** Local 'YYYY-MM-DD' for a Date. Local, not UTC — "today" means the trader's today. */
export function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** A new Date n days from `date`. Month and year roll over on their own. */
export function shiftDays(date, n) {
  const out = new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  return out;
}

/** Monday of the week containing `date`. */
export function weekStart(date) {
  const dow = date.getDay();            // 0 = Sunday
  const back = dow === 0 ? 6 : dow - 1; // Sunday belongs to the week that just ended
  return shiftDays(date, -back);
}

/** Last day of a 'YYYY-MM' month, as 'YYYY-MM-DD'. Day 0 of the next month. */
export function monthEnd(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  return dayKey(new Date(y, m, 0));
}

/** Readable month name for a 'YYYY-MM' key. */
export function monthLabel(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * The date a trade belongs to: when it closed, else when it opened.
 *
 * An open position has no close date but is still part of the week you're reviewing, so
 * falling back to the open date keeps it visible rather than hiding it from every range.
 */
export function tradeDayKey(trade) {
  return String(trade?.closed_at || trade?.opened_at || '').slice(0, 10);
}

/**
 * Resolve a range key into inclusive 'YYYY-MM-DD' bounds.
 *
 * Returns null for "all time" and for a custom range with nothing filled in — null means
 * "don't filter", which keeps the caller from having to special-case the empty state.
 *
 * @param key      one of the PERIOD_KEYS, `m:YYYY-MM` for a specific month, or 'custom'
 * @param today    the reference date (injected so this is testable)
 * @param custom   { start, end } 'YYYY-MM-DD' strings, for key === 'custom'
 */
export function resolveRange(key, today = new Date(), custom = {}) {
  const t = dayKey(today);

  if (key === 'custom') {
    let { start, end } = custom;
    start = (start || '').slice(0, 10) || null;
    end = (end || '').slice(0, 10) || null;
    if (!start && !end) return null;
    // Backwards range: swap rather than show nothing. Picking the end date first is a
    // normal way to use two date inputs, and an empty list looks like a bug.
    if (start && end && start > end) [start, end] = [end, start];
    return { start, end, label: customLabel(start, end) };
  }

  if (key && key.startsWith('m:')) {
    const ym = key.slice(2);
    return { start: `${ym}-01`, end: monthEnd(ym), label: monthLabel(ym) };
  }

  switch (key) {
    case 'today':
      return { start: t, end: t, label: 'today' };
    case 'yesterday': {
      const y = dayKey(shiftDays(today, -1));
      return { start: y, end: y, label: 'yesterday' };
    }
    case 'week': {
      const s = weekStart(today);
      // Ends today, not Sunday: a range reaching into the future reads as though there
      // might be trades in it.
      return { start: dayKey(s), end: t, label: 'this week' };
    }
    case 'lastWeek': {
      const s = shiftDays(weekStart(today), -7);
      return { start: dayKey(s), end: dayKey(shiftDays(s, 6)), label: 'last week' };
    }
    case '7d':
      return { start: dayKey(shiftDays(today, -6)), end: t, label: 'the last 7 days' };
    case '30d':
      return { start: dayKey(shiftDays(today, -29)), end: t, label: 'the last 30 days' };
    case 'month':
      return { start: t.slice(0, 7) + '-01', end: t, label: 'this month' };
    case 'lastMonth': {
      const prev = dayKey(new Date(today.getFullYear(), today.getMonth(), 0)).slice(0, 7);
      return { start: `${prev}-01`, end: monthEnd(prev), label: monthLabel(prev) };
    }
    case 'year':
      return { start: `${t.slice(0, 4)}-01-01`, end: t, label: 'this year' };
    default:
      return null;
  }
}

function customLabel(start, end) {
  const nice = (d) => {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  if (start && end) return start === end ? nice(start) : `${nice(start)} – ${nice(end)}`;
  if (start) return `since ${nice(start)}`;
  return `up to ${nice(end)}`;
}

/** Is this trade inside the range? A null range means no filtering, so everything is. */
export function inRange(trade, range) {
  if (!range) return true;
  const d = tradeDayKey(trade);
  if (!d) return false; // undated trades can't be placed in a window
  if (range.start && d < range.start) return false;
  if (range.end && d > range.end) return false;
  return true;
}

/** The fixed presets, in menu order, grouped the way they're reached for. */
/** @type {Array<[string, Array<[string, string]>]>} */
export const PERIOD_GROUPS = [
  ['Day', [['today', 'Today'], ['yesterday', 'Yesterday']]],
  ['Week', [['week', 'This week'], ['lastWeek', 'Last week'], ['7d', 'Last 7 days']]],
  ['Month', [['month', 'This month'], ['lastMonth', 'Last month'], ['30d', 'Last 30 days']]],
];

export const PERIOD_KEYS = PERIOD_GROUPS.flatMap(([, opts]) => opts.map(([k]) => k)).concat('year', 'custom');

/**
 * Months that actually contain trades, newest first, as `m:YYYY-MM` options.
 *
 * Only months with something in them: an empty August in the dropdown is not a choice,
 * it's a dead end that makes the filter look broken.
 */
export function monthsWithTrades(trades) {
  const seen = new Set();
  for (const t of trades || []) {
    const d = tradeDayKey(t);
    if (d) seen.add(d.slice(0, 7));
  }
  return [...seen].sort().reverse().map((ym) => [`m:${ym}`, monthLabel(ym)]);
}
