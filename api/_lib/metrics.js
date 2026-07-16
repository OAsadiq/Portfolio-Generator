// Porfilr — Trade Journal metric computation.
//
// Pure functions: (trades, startingBalance) -> the numbers a trader publishes.
// These numbers go on an investor-facing page, so every edge case here resolves to
// "show nothing" rather than "show something wrong". A missing metric is honest; a
// wrong one is a false claim about someone's money.
//
// Two deliberate decisions:
//
// 1. Metrics use CLOSED trades only. Open positions carry unrealised P&L, which is
//    how traders flatter themselves. A trade counts once it's actually realised.
//
// 2. Every metric uses NET P&L (pnl - fees), consistently. Mixing gross and net
//    produces numbers that don't reconcile with each other — a profit factor above 1
//    sitting next to a negative return. Note this can differ slightly from MyFXBook,
//    which computes profit factor gross; the two agree whenever fees are 0 (the
//    default), and where they differ, net is the more truthful number.

/** Coerce Supabase numerics (which can arrive as strings) to a finite number, else null. */
function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function round(n, dp = 2) {
  if (n === null || !Number.isFinite(n)) return null;
  const f = 10 ** dp;
  // + Number.EPSILON steadies values like 1.005 that float representation nudges down.
  return Math.round((n + Number.EPSILON) * f) / f;
}

/**
 * Closed trades only, chronological, with net P&L resolved.
 * A trade counts as closed when it has BOTH a close time and a P&L — the DB enforces
 * this pairing, but data can predate a constraint or arrive via import, so re-check.
 */
export function closedTrades(trades) {
  return (Array.isArray(trades) ? trades : [])
    .filter((t) => t && t.closed_at && num(t.pnl) !== null)
    .map((t) => ({
      closedAt: new Date(t.closed_at),
      openedAt: t.opened_at ? new Date(t.opened_at) : null,
      net: num(t.pnl) - (num(t.fees) ?? 0),
    }))
    .filter((t) => !Number.isNaN(t.closedAt.getTime()))
    .sort((a, b) => a.closedAt - b.closedAt);
}

/**
 * Equity curve: running balance after each closed trade, chronologically.
 * Returns [{ t: ISO string, equity: number }], seeded with the starting balance so
 * the curve begins where the account began.
 */
export function equityCurve(trades, startingBalance) {
  const start = num(startingBalance);
  if (start === null || start <= 0) return [];
  const closed = closedTrades(trades);
  if (!closed.length) return [];

  const points = [{ t: (closed[0].openedAt ?? closed[0].closedAt).toISOString(), equity: round(start) }];
  let equity = start;
  for (const t of closed) {
    equity += t.net;
    points.push({ t: t.closedAt.toISOString(), equity: round(equity) });
  }
  return points;
}

/**
 * Largest peak-to-trough decline of the equity curve, as a positive percentage.
 * Walks chronologically tracking the running high-water mark — the peak must be the
 * highest point SO FAR, not the highest overall, or a later peak would wrongly deepen
 * an earlier drawdown.
 */
export function maxDrawdownPct(trades, startingBalance) {
  const start = num(startingBalance);
  if (start === null || start <= 0) return null;
  const closed = closedTrades(trades);
  if (!closed.length) return null;

  let equity = start;
  let peak = start;
  let worst = 0;
  for (const t of closed) {
    equity += t.net;
    if (equity > peak) peak = equity;
    // A non-positive peak makes the ratio meaningless (and divides by zero).
    if (peak > 0) {
      const dd = ((peak - equity) / peak) * 100;
      if (dd > worst) worst = dd;
    }
  }
  return round(worst);
}

/**
 * Gross profit / gross loss over net-of-fees trade results.
 * Returns null when undefined (no losses) rather than Infinity — "∞ profit factor"
 * reads as a bug or a lie, and a metric we can't state honestly shouldn't render.
 */
export function profitFactor(trades) {
  const closed = closedTrades(trades);
  let profit = 0;
  let loss = 0;
  for (const t of closed) {
    if (t.net > 0) profit += t.net;
    else if (t.net < 0) loss += Math.abs(t.net);
  }
  if (loss === 0) return null;
  return round(profit / loss);
}

/** Percentage of closed trades that made money. Breakeven trades count as neither. */
export function winRate(trades) {
  const closed = closedTrades(trades);
  const decided = closed.filter((t) => t.net !== 0);
  if (!decided.length) return null;
  const wins = decided.filter((t) => t.net > 0).length;
  return round((wins / decided.length) * 100);
}

/** Total net return as a percentage of the starting balance. */
export function totalReturnPct(trades, startingBalance) {
  const start = num(startingBalance);
  if (start === null || start <= 0) return null;
  const closed = closedTrades(trades);
  if (!closed.length) return null;
  const net = closed.reduce((sum, t) => sum + t.net, 0);
  return round((net / start) * 100);
}

/** Human label for a span of time, e.g. "3 years", "8 months", "3 weeks". */
export function durationLabel(fromDate, toDate = new Date()) {
  if (!fromDate) return null;
  const from = fromDate instanceof Date ? fromDate : new Date(fromDate);
  if (Number.isNaN(from.getTime())) return null;
  const days = Math.floor((toDate - from) / 86400000);
  if (days < 0) return null;
  if (days < 14) return days <= 1 ? '1 day' : `${days} days`;
  if (days < 60) {
    const w = Math.floor(days / 7);
    return w === 1 ? '1 week' : `${w} weeks`;
  }
  if (days < 730) {
    const m = Math.floor(days / 30);
    return m === 1 ? '1 month' : `${m} months`;
  }
  const y = Math.floor(days / 365);
  return y === 1 ? '1 year' : `${y} years`;
}

/**
 * The full aggregate — this is what gets cached on the portfolio and published.
 * Contains ONLY derived numbers: no trade rows, no notes, nothing private.
 *
 * `totalTrades` is included on purpose. Win rate and profit factor over 6 trades are
 * noise, and an investor deserves to see the sample size rather than be told a
 * flattering percentage with no denominator.
 */
export function computeMetrics(trades, startingBalance, now = new Date()) {
  const closed = closedTrades(trades);
  const start = num(startingBalance);

  const firstOpen = closed.reduce((min, t) => {
    const d = t.openedAt ?? t.closedAt;
    return !min || d < min ? d : min;
  }, null);

  return {
    totalReturnPct: totalReturnPct(trades, start),
    winRate: winRate(trades),
    profitFactor: profitFactor(trades),
    maxDrawdownPct: maxDrawdownPct(trades, start),
    totalTrades: closed.length,
    trackRecordStart: firstOpen ? firstOpen.toISOString() : null,
    trackRecordLabel: durationLabel(firstOpen, now),
    curve: equityCurve(trades, start),
    computedAt: now.toISOString(),
  };
}

export default computeMetrics;
