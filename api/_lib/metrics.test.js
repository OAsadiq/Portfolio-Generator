// Porfilr — trade metric tests.  Run: node --test api/_lib/
//
// These numbers go on a page an investor reads before handing over money, so the bar
// here is higher than "it returns a number". Each test below is written to FAIL on a
// specific plausible implementation mistake, not just to confirm the happy path.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeMetrics, closedTrades, equityCurve, maxDrawdownPct,
  profitFactor, winRate, totalReturnPct, durationLabel,
} from './metrics.js';

const t = (closed_at, pnl, extra = {}) => ({
  closed_at, pnl, opened_at: extra.opened_at ?? '2024-01-01T00:00:00Z', ...extra,
});

// A sequence with two separate drawdowns; the FIRST is the deeper one in %.
//   start 1000 → +500 (1500) → -300 (1200) → +800 (2000) → -200 (1800)
const SEQ = [
  t('2024-01-02T00:00:00Z', 500),
  t('2024-01-03T00:00:00Z', -300),
  t('2024-01-04T00:00:00Z', 800),
  t('2024-01-05T00:00:00Z', -200),
];

test('empty input yields nulls, not zeros or NaN', () => {
  const m = computeMetrics([], 1000);
  assert.equal(m.totalTrades, 0);
  assert.equal(m.totalReturnPct, null);
  assert.equal(m.winRate, null);
  assert.equal(m.profitFactor, null);
  assert.equal(m.maxDrawdownPct, null);
  assert.deepEqual(m.curve, []);
});

test('handles null/undefined trades without throwing', () => {
  assert.equal(computeMetrics(null, 1000).totalTrades, 0);
  assert.equal(computeMetrics(undefined, 1000).totalTrades, 0);
});

test('open trades are excluded (no unrealised P&L)', () => {
  const trades = [t('2024-01-02T00:00:00Z', 500), { opened_at: '2024-01-03T00:00:00Z', closed_at: null, pnl: null }];
  assert.equal(closedTrades(trades).length, 1);
  assert.equal(computeMetrics(trades, 1000).totalTrades, 1);
});

test('a closed trade with no P&L is excluded rather than counted as zero', () => {
  // Counting it would inflate totalTrades and silently drag win rate down.
  const trades = [t('2024-01-02T00:00:00Z', 500), { closed_at: '2024-01-03T00:00:00Z', pnl: null }];
  assert.equal(computeMetrics(trades, 1000).totalTrades, 1);
  assert.equal(computeMetrics(trades, 1000).winRate, 100);
});

test('total return is net P&L over starting balance', () => {
  // 500 - 300 + 800 - 200 = 800 on 1000 = 80%
  assert.equal(totalReturnPct(SEQ, 1000), 80);
});

test('fees reduce net P&L', () => {
  const trades = [t('2024-01-02T00:00:00Z', 100, { fees: 20 })];
  assert.equal(totalReturnPct(trades, 1000), 8); // (100-20)/1000
});

test('a trade whose fees exceed its profit counts as a loss', () => {
  // Classifying on gross pnl would call this a win. It lost money.
  const trades = [t('2024-01-02T00:00:00Z', 10, { fees: 20 })];
  assert.equal(winRate(trades), 0);
  assert.equal(totalReturnPct(trades, 1000), -1);
});

test('win rate ignores breakeven trades', () => {
  const trades = [t('2024-01-02T00:00:00Z', 100), t('2024-01-03T00:00:00Z', -50), t('2024-01-04T00:00:00Z', 0)];
  assert.equal(winRate(trades), 50); // 1 of 2 decided, not 1 of 3
});

test('win rate of all-breakeven trades is null, not NaN', () => {
  assert.equal(winRate([t('2024-01-02T00:00:00Z', 0)]), null);
});

test('profit factor = gross profit / gross loss', () => {
  // profits 500+800=1300, losses 300+200=500 → 2.6
  assert.equal(profitFactor(SEQ), 2.6);
});

test('profit factor with no losing trades is null, never Infinity', () => {
  const trades = [t('2024-01-02T00:00:00Z', 500), t('2024-01-03T00:00:00Z', 200)];
  assert.equal(profitFactor(trades), null);
  assert.ok(Number.isFinite(profitFactor(trades)) === false);
});

test('max drawdown uses the RUNNING peak, not the all-time peak', () => {
  // The trap: the deepest drawdown (-300 from 1500) happens BEFORE the highest peak
  // (2000). An implementation that takes the global max as the peak computes
  // (2000-1200)/2000 = 40%. The correct answer is (1500-1200)/1500 = 20%.
  assert.equal(maxDrawdownPct(SEQ, 1000), 20);
});

test('max drawdown is 0 when equity only rises', () => {
  const trades = [t('2024-01-02T00:00:00Z', 100), t('2024-01-03T00:00:00Z', 200)];
  assert.equal(maxDrawdownPct(trades, 1000), 0);
});

test('max drawdown measures from the starting balance, not the first trade', () => {
  // A trader whose very first trade loses has drawn down from day one.
  const trades = [t('2024-01-02T00:00:00Z', -100)];
  assert.equal(maxDrawdownPct(trades, 1000), 10);
});

test('trades are sorted chronologically before the curve is walked', () => {
  // Drawdown depends entirely on order. Fed backwards and left unsorted, this
  // sequence reports 30% instead of 20%.
  const shuffled = [SEQ[3], SEQ[1], SEQ[0], SEQ[2]];
  assert.equal(maxDrawdownPct(shuffled, 1000), 20);
  assert.equal(totalReturnPct(shuffled, 1000), 80);
});

test('Supabase numerics arriving as strings are coerced', () => {
  // PostgREST can serialise `numeric` as a string; "500" + "-300" would concatenate.
  const trades = [t('2024-01-02T00:00:00Z', '500'), t('2024-01-03T00:00:00Z', '-300', { fees: '10' })];
  assert.equal(totalReturnPct(trades, '1000'), 19); // (500 - 300 - 10)/1000
  assert.equal(computeMetrics(trades, '1000').totalTrades, 2);
});

test('missing or invalid starting balance nulls balance-dependent metrics only', () => {
  for (const bad of [null, undefined, 0, -100, 'abc']) {
    const m = computeMetrics(SEQ, bad);
    assert.equal(m.totalReturnPct, null, `return should be null for ${bad}`);
    assert.equal(m.maxDrawdownPct, null, `drawdown should be null for ${bad}`);
    assert.deepEqual(m.curve, [], `curve should be empty for ${bad}`);
    // These don't depend on the balance and must still compute.
    assert.equal(m.winRate, 50, `win rate should survive ${bad}`);
    assert.equal(m.profitFactor, 2.6, `profit factor should survive ${bad}`);
    assert.equal(m.totalTrades, 4);
  }
});

test('equity curve is seeded with the starting balance and runs chronologically', () => {
  const curve = equityCurve(SEQ, 1000);
  assert.equal(curve.length, 5); // seed + 4 trades
  assert.deepEqual(curve.map((p) => p.equity), [1000, 1500, 1200, 2000, 1800]);
  const times = curve.map((p) => new Date(p.t).getTime());
  assert.deepEqual(times, [...times].sort((a, b) => a - b), 'curve must be chronological');
});

test('floating-point money does not leak long decimals', () => {
  // 0.1 + 0.2 = 0.30000000000000004
  const trades = [t('2024-01-02T00:00:00Z', 0.1), t('2024-01-03T00:00:00Z', 0.2)];
  const curve = equityCurve(trades, 100);
  assert.equal(curve[2].equity, 100.3);
  assert.equal(totalReturnPct(trades, 100), 0.3);
});

test('totalTrades reports sample size so small samples are visible', () => {
  const trades = [t('2024-01-02T00:00:00Z', 100), t('2024-01-03T00:00:00Z', 50)];
  const m = computeMetrics(trades, 1000);
  assert.equal(m.totalTrades, 2);
  assert.equal(m.winRate, 100); // 100% — meaningless without the denominator beside it
});

test('duration labels read naturally', () => {
  const now = new Date('2024-01-01T00:00:00Z');
  const ago = (days) => new Date(now.getTime() - days * 86400000);
  assert.equal(durationLabel(ago(1), now), '1 day');
  assert.equal(durationLabel(ago(5), now), '5 days');
  assert.equal(durationLabel(ago(21), now), '3 weeks');
  assert.equal(durationLabel(ago(90), now), '3 months');
  assert.equal(durationLabel(ago(1100), now), '3 years');
  assert.equal(durationLabel(ago(400), now), '13 months');
});

test('duration label handles missing and invalid dates', () => {
  assert.equal(durationLabel(null), null);
  assert.equal(durationLabel('not-a-date'), null);
});

test('track record starts at the earliest OPEN, not the earliest close', () => {
  const trades = [
    t('2024-06-01T00:00:00Z', 100, { opened_at: '2024-03-01T00:00:00Z' }),
    t('2024-05-01T00:00:00Z', 50, { opened_at: '2024-01-15T00:00:00Z' }),
  ];
  const m = computeMetrics(trades, 1000, new Date('2024-07-15T00:00:00Z'));
  assert.equal(m.trackRecordStart, '2024-01-15T00:00:00.000Z');
  assert.equal(m.trackRecordLabel, '6 months');
});

test('invalid close dates are dropped rather than poisoning the curve', () => {
  const trades = [t('2024-01-02T00:00:00Z', 500), t('garbage', 100)];
  assert.equal(computeMetrics(trades, 1000).totalTrades, 1);
});

test('the published aggregate leaks no private trade data', () => {
  // notes/symbol/prices must never reach the page — only derived numbers.
  const trades = [t('2024-01-02T00:00:00Z', 500, {
    notes: 'SECRET private note', symbol: 'EURUSD', entry_price: 1.1, size: 2,
  })];
  const json = JSON.stringify(computeMetrics(trades, 1000));
  assert.ok(!json.includes('SECRET'), 'notes must not appear in the aggregate');
  assert.ok(!json.includes('EURUSD'), 'symbol must not appear in the aggregate');
  assert.equal(JSON.parse(json).curve.length, 2);
});
