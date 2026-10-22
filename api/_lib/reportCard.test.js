import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  reportCardStats, blockedReason, cardFooter, monthLabel, previousMonth,
  CARD_MIN_TRADES, MIN_TAGGED_RATIO,
} from './reportCard.js';

// A closed trade in October 2026.
const t = (tags = [], pnl = 100, day = 5) => ({
  tags,
  pnl,
  fees: 0,
  opened_at: `2026-10-${String(day).padStart(2, '0')}T08:00:00Z`,
  closed_at: `2026-10-${String(day).padStart(2, '0')}T12:00:00Z`,
});

/** n trades, `taggedCount` of which carry a preset tag. */
const month = (n, taggedCount, tag = 'On plan') =>
  Array.from({ length: n }, (_, i) => t(i < taggedCount ? [tag] : [], 100, (i % 28) + 1));

// ── Month helpers ─────────────────────────────────────────────────────────
test('month labels', () => {
  assert.equal(monthLabel('2026-10'), 'October 2026');
  assert.equal(monthLabel('2026-01'), 'January 2026');
  assert.equal(monthLabel('garbage'), '');
  assert.equal(monthLabel('2026-13'), '');
});

test('previous month, including across a year boundary', () => {
  assert.equal(previousMonth(new Date('2026-11-01T00:00:00Z')), '2026-10');
  assert.equal(previousMonth(new Date('2026-01-15T00:00:00Z')), '2025-12');
});

// ── Eligibility ───────────────────────────────────────────────────────────
test('15 trades is the bar, and 14 is not', () => {
  assert.equal(reportCardStats(month(14, 14), '2026-10').eligible, false);
  assert.equal(reportCardStats(month(15, 15), '2026-10').eligible, true);
  assert.equal(CARD_MIN_TRADES, 15);
});

test('only the requested month counts toward it', () => {
  const mixed = [...month(10, 10), { tags: ['On plan'], pnl: 50, closed_at: '2026-09-20T12:00:00Z' }];
  assert.equal(reportCardStats(mixed, '2026-10').journaled, 10);
  assert.equal(reportCardStats(mixed, '2026-09').journaled, 1);
});

// ── The 50% tagging rule ──────────────────────────────────────────────────
test('a score needs at least half the month tagged', () => {
  const under = reportCardStats(month(20, 9), '2026-10');   // 45%
  assert.equal(under.showScore, false);
  assert.equal(under.score, null, 'the number must not leak through');
  assert.equal(under.scorePct, null);

  const at = reportCardStats(month(20, 10), '2026-10');     // exactly 50%
  assert.equal(at.showScore, true, '50% is enough — the rule is "at least half"');
  assert.equal(at.scorePct, 100);
});

test('the leak is withheld with the score, not shown alongside a blank', () => {
  const s = reportCardStats(month(20, 4, 'FOMO entry'), '2026-10');
  assert.equal(s.showScore, false);
  assert.equal(s.biggestLeak, null, 'naming a leak implies a score we are refusing to show');
});

test('a month with no tags at all shows no score and does not divide by zero', () => {
  const s = reportCardStats(month(20, 0), '2026-10');
  assert.equal(s.tagged, 0);
  assert.equal(s.showScore, false);
  assert.equal(s.score, null);
  assert.equal(s.untagged, 20);
});

test('an empty month is inert, not a pass', () => {
  const s = reportCardStats([], '2026-10');
  assert.equal(s.journaled, 0);
  assert.equal(s.eligible, false);
  assert.equal(s.showScore, false, 'taggedRatio of 0 must not satisfy the rule');
  assert.equal(s.score, null);
});

// ── Scoring ───────────────────────────────────────────────────────────────
test('score is clean over tagged, and a negative spoils On plan', () => {
  const trades = [
    ...Array.from({ length: 8 }, (_, i) => t(['On plan'], 100, i + 1)),
    ...Array.from({ length: 2 }, (_, i) => t(['On plan', 'Moved stop'], -50, i + 10)),
    ...Array.from({ length: 10 }, (_, i) => t([], 10, i + 12)),
  ];
  const s = reportCardStats(trades, '2026-10');
  assert.equal(s.tagged, 10);
  assert.equal(s.clean, 8, 'the two mixed trades are not clean');
  assert.equal(s.scorePct, 80);
  assert.equal(s.biggestLeak, 'Moved stop');
});

// ── Net result ────────────────────────────────────────────────────────────
test('net result is a percentage, and null without a starting balance', () => {
  const trades = month(20, 20).map((x) => ({ ...x, pnl: 50 }));
  assert.equal(reportCardStats(trades, '2026-10', null).netResultPct, null,
    'no balance means no honest percentage — do not invent one');
  const withBalance = reportCardStats(trades, '2026-10', 10000);
  assert.equal(withBalance.netResultPct, 10, '20 x 50 = 1000 on 10,000');
});

test('no money figure is produced by default', () => {
  const s = reportCardStats(month(20, 20), '2026-10', 10000);
  assert.equal(s.showMoney, false);
  // Absent, not null. This object is rendered into a PNG people post publicly; a null
  // property is still something a template can print, an absent one isn't.
  assert.ok(!('netResultValue' in s), 'the key must not exist when the toggle is off');
  assert.ok(!('pnl' in s));
  assert.equal(typeof s.netResultPct, 'number', 'the percentage is still there');
});

test('the money figure appears only when explicitly asked for', () => {
  const trades = month(20, 20).map((x) => ({ ...x, pnl: 50, fees: 2 }));
  const on = reportCardStats(trades, '2026-10', 10000, { showMoney: true });
  assert.equal(on.showMoney, true);
  assert.equal(on.netResultValue, 20 * 48, 'net of fees: (50 - 2) x 20');
  // Percentage stays regardless — the toggle adds a figure, it does not replace one.
  assert.equal(typeof on.netResultPct, 'number');
});

test('the money figure is a bare number, carrying no currency', () => {
  const trades = month(16, 16).map((x) => ({ ...x, pnl: 10, fees: 0 }));
  const on = reportCardStats(trades, '2026-10', 1000, { showMoney: true });
  assert.equal(typeof on.netResultValue, 'number');
  // There is no currency column on trades — a trader logging naira and one logging
  // dollars both just type numbers. Attaching a symbol here would be a guess.
  assert.ok(!('currency' in on));
});

test('a losing month reports a negative, not an absolute', () => {
  const trades = month(20, 20).map((x) => ({ ...x, pnl: -30, fees: 1 }));
  const on = reportCardStats(trades, '2026-10', 10000, { showMoney: true });
  assert.equal(on.netResultValue, 20 * -31);
  assert.ok(on.netResultPct < 0);
});

// ── Blocked reasons ───────────────────────────────────────────────────────
test('the reason a card is blocked is specific', () => {
  assert.equal(blockedReason(reportCardStats(month(10, 10), '2026-10')), 'not-enough-trades');
  assert.equal(blockedReason(reportCardStats(month(20, 4), '2026-10')), 'not-enough-tagged');
  assert.equal(blockedReason(reportCardStats(month(20, 20), '2026-10')), null);
  assert.equal(blockedReason(null), 'no-data');
});

// ── Footer guardrail ──────────────────────────────────────────────────────
test('the footer never claims verification, and counts correctly', () => {
  const f = cardFooter(reportCardStats(month(15, 15), '2026-10'));
  assert.match(f, /Computed from 15 journaled trades/);
  assert.match(f, /doesn't audit results/);
  for (const banned of ['verified', 'audited', 'verifiable']) {
    assert.ok(!new RegExp(banned, 'i').test(f), `footer must never say "${banned}"`);
  }
});

test('footer singularises one trade', () => {
  assert.match(cardFooter({ journaled: 1 }), /1 journaled trade\./);
});

test('the tagging threshold is the documented one', () => {
  assert.equal(MIN_TAGGED_RATIO, 0.5);
});
