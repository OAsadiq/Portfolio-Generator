import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayKey, shiftDays, weekStart, monthEnd, tradeDayKey,
  resolveRange, inRange, monthsWithTrades, PERIOD_KEYS,
} from './dateRange.js';

// Thursday 2026-10-22. Mid-week and mid-month, so week and month bounds are both visible.
const THU = new Date(2026, 9, 22);

test('dayKey zero-pads', () => {
  assert.equal(dayKey(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(dayKey(THU), '2026-10-22');
});

test('shiftDays rolls over months and years', () => {
  assert.equal(dayKey(shiftDays(new Date(2026, 0, 1), -1)), '2025-12-31');
  assert.equal(dayKey(shiftDays(new Date(2026, 1, 28), 1)), '2026-03-01');
});

test('weekStart is Monday, and Sunday belongs to the week that just ended', () => {
  assert.equal(dayKey(weekStart(THU)), '2026-10-19');
  assert.equal(dayKey(weekStart(new Date(2026, 9, 19))), '2026-10-19');
  assert.equal(dayKey(weekStart(new Date(2026, 9, 25))), '2026-10-19');
  assert.equal(dayKey(weekStart(new Date(2026, 9, 26))), '2026-10-26');
});

test('monthEnd handles 30/31 and February', () => {
  assert.equal(monthEnd('2026-10'), '2026-10-31');
  assert.equal(monthEnd('2026-09'), '2026-09-30');
  assert.equal(monthEnd('2026-02'), '2026-02-28');
  assert.equal(monthEnd('2024-02'), '2024-02-29');
});

test('tradeDayKey prefers close, falls back to open, tolerates neither', () => {
  assert.equal(tradeDayKey({ closed_at: '2026-10-22T14:05:00Z', opened_at: '2026-10-21' }), '2026-10-22');
  assert.equal(tradeDayKey({ opened_at: '2026-10-21' }), '2026-10-21');
  assert.equal(tradeDayKey({}), '');
});

test('day ranges', () => {
  assert.deepEqual(resolveRange('today', THU), { start: '2026-10-22', end: '2026-10-22', label: 'today' });
  assert.deepEqual(resolveRange('yesterday', THU), { start: '2026-10-21', end: '2026-10-21', label: 'yesterday' });
});

test('this week starts Monday and stops today, never in the future', () => {
  const r = resolveRange('week', THU);
  assert.equal(r.start, '2026-10-19');
  assert.equal(r.end, '2026-10-22');
});

test('last week is a full Monday-to-Sunday block', () => {
  const r = resolveRange('lastWeek', THU);
  assert.equal(r.start, '2026-10-12');
  assert.equal(r.end, '2026-10-18');
});

test('rolling windows are inclusive of today', () => {
  assert.deepEqual(resolveRange('7d', THU), { start: '2026-10-16', end: '2026-10-22', label: 'the last 7 days' });
  assert.deepEqual(resolveRange('30d', THU), { start: '2026-09-23', end: '2026-10-22', label: 'the last 30 days' });
});

test('this month runs to today; last month is the whole month', () => {
  assert.deepEqual(resolveRange('month', THU), { start: '2026-10-01', end: '2026-10-22', label: 'this month' });
  const last = resolveRange('lastMonth', THU);
  assert.equal(last.start, '2026-09-01');
  assert.equal(last.end, '2026-09-30');
  assert.equal(last.label, 'September 2026');
});

test('lastMonth crosses the year boundary', () => {
  const r = resolveRange('lastMonth', new Date(2026, 0, 9));
  assert.equal(r.start, '2025-12-01');
  assert.equal(r.end, '2025-12-31');
});

test('this year', () => {
  assert.equal(resolveRange('year', THU).start, '2026-01-01');
});

test('m: keys pin a specific month, which is what the card deep-link uses', () => {
  const r = resolveRange('m:2026-09', THU);
  assert.deepEqual(r, { start: '2026-09-01', end: '2026-09-30', label: 'September 2026' });
});

test('all time and unknown keys mean no filter', () => {
  assert.equal(resolveRange('', THU), null);
  assert.equal(resolveRange(null, THU), null);
  assert.equal(resolveRange('nonsense', THU), null);
});

test('custom range', () => {
  const r = resolveRange('custom', THU, { start: '2026-10-05', end: '2026-10-09' });
  assert.equal(r.start, '2026-10-05');
  assert.equal(r.end, '2026-10-09');
});

test('a backwards custom range is swapped, not emptied', () => {
  const r = resolveRange('custom', THU, { start: '2026-10-09', end: '2026-10-05' });
  assert.equal(r.start, '2026-10-05');
  assert.equal(r.end, '2026-10-09');
});

test('a half-filled custom range stays open-ended', () => {
  assert.equal(resolveRange('custom', THU, { start: '2026-10-05' }).end, null);
  assert.equal(resolveRange('custom', THU, { end: '2026-10-05' }).start, null);
});

test('an empty custom range filters nothing', () => {
  assert.equal(resolveRange('custom', THU, {}), null);
  assert.equal(resolveRange('custom', THU, { start: '', end: '' }), null);
});

test('custom labels read naturally', () => {
  assert.equal(resolveRange('custom', THU, { start: '2026-10-05', end: '2026-10-05' }).label, 'Oct 5, 2026');
  assert.equal(resolveRange('custom', THU, { start: '2026-10-05' }).label, 'since Oct 5, 2026');
  assert.equal(resolveRange('custom', THU, { end: '2026-10-05' }).label, 'up to Oct 5, 2026');
});

test('inRange is inclusive at both ends', () => {
  const r = resolveRange('lastWeek', THU);
  assert.equal(inRange({ closed_at: '2026-10-12' }, r), true);
  assert.equal(inRange({ closed_at: '2026-10-18T23:59:00Z' }, r), true);
  assert.equal(inRange({ closed_at: '2026-10-11' }, r), false);
  assert.equal(inRange({ closed_at: '2026-10-19' }, r), false);
});

test('a null range admits everything, including undated trades', () => {
  assert.equal(inRange({}, null), true);
  assert.equal(inRange({ closed_at: '1999-01-01' }, null), true);
});

test('an undated trade is excluded from any real window', () => {
  assert.equal(inRange({}, resolveRange('week', THU)), false);
});

test('open positions are matched on their open date', () => {
  assert.equal(inRange({ opened_at: '2026-10-20', closed_at: null }, resolveRange('week', THU)), true);
});

test('monthsWithTrades lists only months in use, newest first', () => {
  const trades = [
    { closed_at: '2026-09-14' },
    { closed_at: '2026-10-02' },
    { closed_at: '2026-09-28' },
    { opened_at: '2026-07-01' },
    {},
  ];
  assert.deepEqual(monthsWithTrades(trades).map(([k]) => k), ['m:2026-10', 'm:2026-09', 'm:2026-07']);
  assert.equal(monthsWithTrades(trades)[1][1], 'September 2026');
});

test('monthsWithTrades tolerates no trades', () => {
  assert.deepEqual(monthsWithTrades([]), []);
  assert.deepEqual(monthsWithTrades(undefined), []);
});

test('every advertised preset resolves to a usable range', () => {
  for (const k of PERIOD_KEYS) {
    if (k === 'custom') continue;
    const r = resolveRange(k, THU);
    assert.ok(r && r.start && r.end, k + ' should resolve');
    assert.ok(r.start <= r.end, k + ' should not be backwards');
  }
});
