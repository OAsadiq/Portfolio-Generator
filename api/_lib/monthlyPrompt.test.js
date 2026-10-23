import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  promptState, promptCopy, promptMonth, PROMPT_READY, PROMPT_TAG, PROMPT_NONE,
} from './monthlyPrompt.js';

const stats = (over = {}) => ({
  yearMonth: '2026-09',
  label: 'September 2026',
  journaled: 30,
  untagged: 12,
  eligible: true,
  showScore: true,
  ...over,
});

// ── When it speaks ────────────────────────────────────────────────────────
test('a complete month prompts to generate', () => {
  const s = promptState(stats());
  assert.equal(s.variant, PROMPT_READY);
  assert.equal(s.label, 'September 2026');
});

test('enough trades but too few tagged gets the tag prompt, not silence', () => {
  // This trader is one action away from a card and doesn't know it. Saying nothing is
  // the worst option: they journaled the whole month and get no acknowledgement.
  const s = promptState(stats({ showScore: false, untagged: 25 }));
  assert.equal(s.variant, PROMPT_TAG);
  assert.equal(s.untagged, 25);
});

test('under 15 trades says nothing at all', () => {
  // Nagging someone about a threshold they never opted into. The panel already shows
  // their progress for anyone who looks.
  assert.equal(promptState(stats({ eligible: false })).variant, PROMPT_NONE);
});

// ── Dismissal ─────────────────────────────────────────────────────────────
test('a dismissed month stays dismissed', () => {
  assert.equal(promptState(stats(), ['2026-09']).variant, PROMPT_NONE);
});

test('dismissing one month does not silence the next', () => {
  // The whole point is a monthly ritual — a single dismissal must not end it forever.
  assert.equal(promptState(stats({ yearMonth: '2026-10', label: 'October 2026' }), ['2026-09']).variant, PROMPT_READY);
});

test('dismissal applies to the tag variant too', () => {
  assert.equal(promptState(stats({ showScore: false }), ['2026-09']).variant, PROMPT_NONE);
});

test('a malformed dismissal list is ignored rather than crashing', () => {
  for (const d of [null, undefined, 'nope', 42]) {
    assert.equal(promptState(stats(), d).variant, PROMPT_READY);
  }
});

// ── Guards ────────────────────────────────────────────────────────────────
test('no stats, no prompt', () => {
  assert.equal(promptState(null).variant, PROMPT_NONE);
  assert.equal(promptState({}).variant, PROMPT_NONE);
});

// ── Month ─────────────────────────────────────────────────────────────────
test('the prompt is about the month that just ended', () => {
  assert.equal(promptMonth(new Date('2026-11-01T00:00:00Z')), '2026-10');
  assert.equal(promptMonth(new Date('2026-11-20T00:00:00Z')), '2026-10',
    'still October all through November — the card never covers a running month');
  assert.equal(promptMonth(new Date('2027-01-03T00:00:00Z')), '2026-12');
});

// ── Copy ──────────────────────────────────────────────────────────────────
test('ready copy names the month and offers one action', () => {
  const c = promptCopy(promptState(stats()));
  assert.match(c.title, /September 2026 report card is ready/);
  assert.equal(c.action, 'Generate it');
});

test('tag copy counts what is left, and reads correctly for one', () => {
  const many = promptCopy(promptState(stats({ showScore: false, untagged: 12 })));
  assert.match(many.body, /12 are untagged/);
  assert.equal(many.action, 'Tag 12 trades');

  const one = promptCopy(promptState(stats({ showScore: false, untagged: 1 })));
  assert.match(one.body, /1 is untagged/);
  assert.equal(one.action, 'Tag 1 trade');
});

test('silence has no copy', () => {
  assert.equal(promptCopy(promptState(stats({ eligible: false }))), null);
  assert.equal(promptCopy(null), null);
});
