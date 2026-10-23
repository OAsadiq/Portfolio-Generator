import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShareText, shareIntentUrl, canShare, SHARE_URL, SHARE_REF } from './shareCard.js';

const ready = (over = {}) => ({
  label: 'September 2026',
  journaled: 30,
  eligible: true,
  showScore: true,
  scorePct: 80,
  biggestLeak: 'Moved stop',
  ...over,
});

// ── When sharing is allowed ───────────────────────────────────────────────
test('a complete card can be shared', () => {
  assert.equal(canShare(ready()), true);
});

test('a card with no score cannot be shared', () => {
  // Posting a blank score is a screenshot with no substance — the exact thing Porfilr
  // exists to replace. The button must not exist, not merely be disabled.
  assert.equal(canShare(ready({ showScore: false, scorePct: null })), false);
  assert.equal(canShare(ready({ eligible: false })), false);
  assert.equal(canShare(null), false);
  assert.equal(canShare(undefined), false);
});

test('an unshareable card produces no text and no intent url', () => {
  const blocked = ready({ showScore: false, scorePct: null });
  assert.equal(buildShareText(blocked), '');
  assert.equal(shareIntentUrl(blocked), '');
});

// ── The text ──────────────────────────────────────────────────────────────
test('the post carries the card\'s own numbers', () => {
  const t = buildShareText(ready());
  assert.match(t, /September 2026 execution report/);
  assert.match(t, /30 trades journaled/);
  assert.match(t, /execution score 80%/);
  assert.match(t, /Biggest leak: Moved stop\./);
  assert.match(t, /What's yours\?/);
});

test('a clean month says so instead of naming a leak', () => {
  const t = buildShareText(ready({ biggestLeak: null }));
  assert.match(t, /No leaks detected — clean month\./);
  assert.ok(!/Biggest leak/.test(t));
});

test('the tracked link is always present and carries the ref', () => {
  const t = buildShareText(ready());
  assert.ok(t.includes(SHARE_URL));
  assert.ok(t.includes(`ref=${SHARE_REF}`), 'without this we cannot tell if sharing works');
});

test('the post never claims verification', () => {
  const t = buildShareText(ready());
  for (const banned of ['verified', 'audited', 'verifiable']) {
    assert.ok(!new RegExp(banned, 'i').test(t), `share text must never say "${banned}"`);
  }
});

test('no money figure reaches the post, even when the card shows one', () => {
  // The money toggle governs the IMAGE the trader chooses to attach. The text is public
  // the moment they click, before they've seen it — it must never volunteer an amount.
  const t = buildShareText(ready({ showMoney: true, netResultValue: 125000 }));
  assert.ok(!t.includes('125,000') && !t.includes('125000'));
});

// ── Length ────────────────────────────────────────────────────────────────
test('the post leaves room to edit before hitting X\'s limit', () => {
  // X counts a URL as 23 characters regardless of length.
  const t = buildShareText(ready({ label: 'September 2026', biggestLeak: 'Revenge trade' }));
  const weighted = t.replace(SHARE_URL, 'x'.repeat(23)).length;
  assert.ok(weighted < 240, `prefilled post is ${weighted} weighted chars — too little room to edit`);
});

// ── The intent URL ────────────────────────────────────────────────────────
test('the intent url is a well formed X composer link', () => {
  const u = shareIntentUrl(ready());
  assert.ok(u.startsWith('https://twitter.com/intent/tweet?text='));
  const text = decodeURIComponent(u.split('text=')[1]);
  assert.equal(text, buildShareText(ready()), 'what opens must equal what we built');
});

test('special characters survive encoding', () => {
  const u = shareIntentUrl(ready({ biggestLeak: 'FOMO entry' }));
  assert.ok(!u.includes(' '), 'spaces must be encoded');
  assert.ok(decodeURIComponent(u.split('text=')[1]).includes("What's yours?"));
});
