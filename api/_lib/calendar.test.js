// Porfilr — trading calendar tests.  Run: npm test
//
// Calendar code is full of off-by-one and timezone traps: wrong leading blanks shift every
// day by one, and a naive local-date key moves a trade to the wrong day for anyone outside
// UTC. Each test below targets one of those.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyPnl, monthGrid, activeMonths, intensity, calendarHtml } from './calendar.js';

const t = (closed_at, pnl, extra = {}) => ({
  closed_at, pnl, opened_at: extra.opened_at ?? closed_at, ...extra,
});

test('groups closed trades into days and nets fees', () => {
  const map = dailyPnl([
    t('2026-03-10T12:00:00Z', 100, { fees: 10 }),
    t('2026-03-10T18:00:00Z', -40),
    t('2026-03-11T09:00:00Z', 200),
  ]);
  assert.equal(map.get('2026-03-10').pnl, 50);   // (100-10) + (-40)
  assert.equal(map.get('2026-03-10').trades, 2);
  assert.equal(map.get('2026-03-10').wins, 1);
  assert.equal(map.get('2026-03-10').losses, 1);
  assert.equal(map.get('2026-03-11').pnl, 200);
});

test('open trades never appear on the calendar', () => {
  const map = dailyPnl([
    t('2026-03-10T12:00:00Z', 100),
    { opened_at: '2026-03-10T12:00:00Z', closed_at: null, pnl: null },
  ]);
  assert.equal(map.get('2026-03-10').trades, 1);
});

test('a trade lands on the day it CLOSED, not opened', () => {
  const map = dailyPnl([t('2026-03-12T09:00:00Z', 75, { opened_at: '2026-03-09T09:00:00Z' })]);
  assert.equal(map.get('2026-03-12').pnl, 75);
  assert.equal(map.get('2026-03-09'), undefined);
});

test('day keys use UTC so a trade cannot drift to the wrong day', () => {
  // 23:30 UTC would be "tomorrow" in some local zones and "yesterday" in others.
  const map = dailyPnl([t('2026-03-10T23:30:00Z', 50)]);
  assert.ok(map.has('2026-03-10'), 'late-UTC trade stays on its own day');
  assert.equal(map.size, 1);
});

test('month grid is Monday-first with correct leading blanks', () => {
  // 1 March 2026 is a Sunday -> Monday-first means 6 leading blanks.
  const g = monthGrid([], 2026, 3);
  const firstWeek = g.weeks[0];
  assert.equal(firstWeek.length, 7);
  assert.equal(firstWeek.slice(0, 6).every((c) => c === null), true);
  assert.equal(firstWeek[6].day, 1, 'the 1st sits in the Sunday slot');
});

test('every week row has exactly 7 cells and days are complete + in order', () => {
  const g = monthGrid([], 2026, 2); // Feb 2026, 28 days
  assert.ok(g.weeks.every((w) => w.length === 7));
  const days = g.weeks.flat().filter(Boolean).map((c) => c.day);
  assert.equal(days.length, 28);
  assert.deepEqual(days, [...Array(28)].map((_, i) => i + 1));
});

test('leap year February has 29 days', () => {
  const g = monthGrid([], 2028, 2);
  assert.equal(g.weeks.flat().filter(Boolean).length, 29);
});

test('a no-trade day is null P&L, not zero', () => {
  // Zero would render as a "breakeven" colour; null means "didn't trade".
  const g = monthGrid([t('2026-03-10T12:00:00Z', 100)], 2026, 3);
  const cells = g.weeks.flat().filter(Boolean);
  assert.equal(cells.find((c) => c.day === 10).pnl, 100);
  assert.equal(cells.find((c) => c.day === 11).pnl, null);
  assert.equal(cells.find((c) => c.day === 11).trades, 0);
});

test('month summary counts only days that traded', () => {
  const g = monthGrid([
    t('2026-03-02T12:00:00Z', 300),
    t('2026-03-05T12:00:00Z', -100),
    t('2026-03-05T15:00:00Z', -50),
    t('2026-03-09T12:00:00Z', 250),
  ], 2026, 3);
  assert.equal(g.summary.pnl, 400);        // 300 - 150 + 250
  assert.equal(g.summary.tradingDays, 3);
  assert.equal(g.summary.greenDays, 2);
  assert.equal(g.summary.redDays, 1);
  assert.equal(g.summary.trades, 4);
});

test('trades from other months are excluded from the grid', () => {
  const g = monthGrid([
    t('2026-02-20T12:00:00Z', 999),
    t('2026-03-03T12:00:00Z', 100),
  ], 2026, 3);
  assert.equal(g.summary.pnl, 100);
  assert.equal(g.summary.tradingDays, 1);
});

test('an empty month renders a valid, empty grid', () => {
  const g = monthGrid([], 2026, 3);
  assert.equal(g.summary.pnl, 0);
  assert.equal(g.summary.tradingDays, 0);
  assert.ok(g.weeks.length >= 5);
  assert.equal(g.label, 'March 2026');
});

test('floating-point pennies do not leak into a day total', () => {
  const g = monthGrid([
    t('2026-03-04T10:00:00Z', 0.1),
    t('2026-03-04T11:00:00Z', 0.2),
  ], 2026, 3);
  assert.equal(g.weeks.flat().filter(Boolean).find((c) => c.day === 4).pnl, 0.3);
});

test('activeMonths lists months with trades, newest first', () => {
  const months = activeMonths([
    t('2026-01-15T12:00:00Z', 10),
    t('2026-01-20T12:00:00Z', 10),
    t('2026-03-02T12:00:00Z', 10),
  ]);
  assert.equal(months.length, 2);
  assert.deepEqual([months[0].year, months[0].month], [2026, 3]);
  assert.deepEqual([months[1].year, months[1].month], [2026, 1]);
});

test('public calendar renders the latest trading month', () => {
  const html = calendarHtml([
    t('2026-01-10T12:00:00Z', 100),
    t('2026-03-02T12:00:00Z', 420),
    t('2026-03-03T12:00:00Z', -180),
  ]);
  assert.ok(html.includes('March 2026'), 'defaults to the most recent month');
  assert.equal((html.match(/cal-dow/g) || []).length, 7);
  assert.ok(html.includes('rgba(34,197,94'), 'green day rendered');
  assert.ok(html.includes('rgba(248,113,113'), 'red day rendered');
});

test('the PUBLIC calendar never leaks exact P&L amounts', () => {
  // It proves consistency by shape/colour only. Printing daily figures would publish a
  // money trail the trader didn't agree to — this is the privacy line for an opt-in feature.
  const html = calendarHtml([
    t('2026-03-02T12:00:00Z', 4213.77),
    t('2026-03-05T12:00:00Z', -1888.5),
  ]);
  assert.ok(!html.includes('4213'), 'no profit figure in the markup');
  assert.ok(!html.includes('1888'), 'no loss figure in the markup');
  assert.ok(html.includes('days traded'), 'summary counts are fine — amounts are not');
});

test('public calendar returns empty when there is nothing to show', () => {
  assert.equal(calendarHtml([]), '');
  assert.equal(calendarHtml([{ closed_at: null, pnl: null }]), '');
  assert.equal(calendarHtml(null), '');
});

test('intensity scales 0..1 and is 0 for no-trade days', () => {
  assert.equal(intensity(500, 500), 1);
  assert.equal(intensity(-250, 500), 0.5);
  assert.equal(intensity(null, 500), 0);
  assert.equal(intensity(100, 0), 0);      // no max -> no divide-by-zero
});
