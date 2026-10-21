import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESET_TAGS, POSITIVE_TAG, NEGATIVE_TAGS,
  normalizeTag, normalizeTags, isTagged, isClean, tagStats, biggestLeak,
  inMonth, customTagsIn, MAX_CUSTOM_TAG_LENGTH,
} from './tags.js';

const trade = (tags, over = {}) => ({ tags, closed_at: '2026-10-05T12:00:00Z', ...over });

// ── Presets ───────────────────────────────────────────────────────────────
test('one positive tag, six negatives, positive first', () => {
  assert.equal(POSITIVE_TAG, 'On plan');
  assert.equal(NEGATIVE_TAGS.length, 6);
  assert.equal(PRESET_TAGS[0], 'On plan');
  assert.equal(PRESET_TAGS.length, 7);
});

// ── Normalisation ─────────────────────────────────────────────────────────
test('whitespace is trimmed and collapsed', () => {
  assert.equal(normalizeTag('  Breakout  '), 'Breakout');
  assert.equal(normalizeTag('news   fade'), 'news fade');
});

test('a typed preset is recognised whatever the case', () => {
  // Otherwise "fomo entry" is stored as a CUSTOM tag, counts as neutral, and silently
  // vanishes from the score — hiding the exact leak the feature exists to surface.
  assert.equal(normalizeTag('fomo entry'), 'FOMO entry');
  assert.equal(normalizeTag('ON PLAN'), 'On plan');
  assert.equal(normalizeTag('  moved stop '), 'Moved stop');
});

test('custom tags are capped at 24 characters', () => {
  const long = 'a'.repeat(60);
  assert.equal(normalizeTag(long).length, MAX_CUSTOM_TAG_LENGTH);
});

test('blank input yields null, not an empty tag', () => {
  for (const v of ['', '   ', null, undefined]) assert.equal(normalizeTag(v), null);
});

test('lists dedupe case-insensitively and keep first-seen order', () => {
  assert.deepEqual(normalizeTags(['Breakout', 'breakout', 'On plan']), ['Breakout', 'On plan']);
  assert.deepEqual(normalizeTags(['On plan', 'on plan']), ['On plan']);
  assert.deepEqual(normalizeTags(['  ', null, 'FOMO entry']), ['FOMO entry']);
  assert.deepEqual(normalizeTags(null), []);
});

// ── Tagged / clean ────────────────────────────────────────────────────────
test('tagged requires a PRESET — custom-only does not count', () => {
  assert.equal(isTagged(trade(['On plan'])), true);
  assert.equal(isTagged(trade(['Oversized'])), true);
  assert.equal(isTagged(trade(['Breakout'])), false, 'custom-only is untagged');
  assert.equal(isTagged(trade([])), false);
  assert.equal(isTagged({}), false);
});

test('THE RULE: a negative beats On plan on the same trade', () => {
  assert.equal(isClean(trade(['On plan'])), true);
  assert.equal(isClean(trade(['On plan', 'Moved stop'])), false);
  assert.equal(isClean(trade(['On plan', 'Breakout'])), true, 'a custom tag is neutral');
  assert.equal(isClean(trade(['Moved stop'])), false);
  assert.equal(isClean(trade([])), false, 'untagged is never clean');
});

// ── Aggregation ───────────────────────────────────────────────────────────
test('score is clean over TAGGED, not over total', () => {
  const stats = tagStats([
    trade(['On plan']),
    trade(['On plan']),
    trade(['FOMO entry']),
    trade([]),              // untagged — invisible to the score
    trade(['Breakout']),    // custom-only — also invisible
  ]);
  assert.equal(stats.total, 5);
  assert.equal(stats.tagged, 3);
  assert.equal(stats.clean, 2);
  assert.equal(stats.score, 2 / 3);
  assert.equal(stats.taggedRatio, 3 / 5);
});

test('a mixed trade counts as tagged but not clean', () => {
  const stats = tagStats([trade(['On plan', 'Revenge trade'])]);
  assert.equal(stats.tagged, 1);
  assert.equal(stats.clean, 0);
  assert.equal(stats.score, 0);
  assert.equal(stats.negatives['Revenge trade'], 1);
});

test('no trades and no tags produce null scores rather than NaN', () => {
  assert.equal(tagStats([]).score, null);
  assert.equal(tagStats([]).taggedRatio, null);
  assert.equal(tagStats([trade([])]).score, null, '0/0 must not be NaN');
  assert.equal(tagStats([trade([])]).taggedRatio, 0);
});

test('negatives are counted per tag, zero counts omitted', () => {
  const stats = tagStats([
    trade(['FOMO entry']),
    trade(['FOMO entry', 'Oversized']),
    trade(['On plan']),
  ]);
  assert.deepEqual(stats.negatives, { 'FOMO entry': 2, Oversized: 1 });
});

// ── Biggest leak ──────────────────────────────────────────────────────────
test('biggest leak is the most frequent negative', () => {
  const stats = tagStats([
    trade(['Moved stop']), trade(['Moved stop']), trade(['Chased price']),
  ]);
  assert.equal(stats.biggestLeak, 'Moved stop');
});

test('a tie breaks toward the one still happening', () => {
  const stats = tagStats([
    trade(['Oversized'],    { closed_at: '2026-10-01T00:00:00Z' }),
    trade(['Chased price'], { closed_at: '2026-10-20T00:00:00Z' }),
  ]);
  assert.equal(stats.biggestLeak, 'Chased price', 'later occurrence wins the tie');
});

test('a total tie is still deterministic', () => {
  const same = '2026-10-10T00:00:00Z';
  const a = tagStats([trade(['Oversized'], { closed_at: same }), trade(['Chased price'], { closed_at: same })]);
  const b = tagStats([trade(['Chased price'], { closed_at: same }), trade(['Oversized'], { closed_at: same })]);
  assert.equal(a.biggestLeak, b.biggestLeak, 'input order must not change the answer');
});

test('no negatives means no leak', () => {
  assert.equal(tagStats([trade(['On plan'])]).biggestLeak, null);
  assert.equal(biggestLeak({}), null);
});

// ── Month slicing ─────────────────────────────────────────────────────────
test('trades are bucketed by close date, falling back to open', () => {
  const list = [
    trade(['On plan'], { closed_at: '2026-10-31T23:00:00Z' }),
    trade(['On plan'], { closed_at: '2026-11-01T01:00:00Z' }),
    trade(['On plan'], { closed_at: null, opened_at: '2026-10-15T00:00:00Z' }),
  ];
  assert.equal(inMonth(list, '2026-10').length, 2);
  assert.equal(inMonth(list, '2026-11').length, 1);
});

// ── Filter list ───────────────────────────────────────────────────────────
test('custom tags are collected for the filter, presets excluded', () => {
  const list = [trade(['On plan', 'Breakout']), trade(['breakout']), trade(['News fade'])];
  // Case-insensitive dedupe, first spelling seen wins — so the filter offers one
  // "Breakout" chip rather than two that look identical and match different trades.
  assert.deepEqual(customTagsIn(list), ['Breakout', 'News fade']);
});

test('a trade with no tags array does not crash anything', () => {
  const odd = [{ id: 1 }, { id: 2, tags: null }, { id: 3, tags: 'nope' }];
  const stats = tagStats(odd);
  assert.equal(stats.total, 3);
  assert.equal(stats.tagged, 0);
  assert.deepEqual(customTagsIn(odd), []);
});
