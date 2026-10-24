import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShareText, shareIntentUrl, canShare, SHARE_URL, SHARE_REF , cardFileName, canAttachFiles, shareDoneHint, shareLabels, ATTACH_HINT,
} from './shareCard.js';

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

test('cardFileName names the month, and survives a card without one', () => {
  assert.equal(cardFileName({ yearMonth: '2026-09' }), 'porfilr-2026-09-execution-report.png');
  assert.equal(cardFileName({}), 'porfilr-card-execution-report.png');
  assert.equal(cardFileName(null), 'porfilr-card-execution-report.png');
});

test('canAttachFiles needs BOTH share and canShare', () => {
  assert.equal(canAttachFiles({ share: () => {}, canShare: () => true }), true);
  assert.equal(canAttachFiles({ share: () => {} }), false);            // no canShare: Safari 14
  assert.equal(canAttachFiles({ canShare: () => true }), false);       // canShare without share
  assert.equal(canAttachFiles(null), false);
  assert.equal(canAttachFiles(undefined), false);
});

test('canAttachFiles believes a browser that says no to files', () => {
  // Desktop Chrome: navigator.share exists, file sharing does not.
  assert.equal(canAttachFiles({ share: () => {}, canShare: () => false }), false);
});

test('canAttachFiles treats a throwing canShare as unsupported', () => {
  // Must not bubble out of a click handler and kill the whole share.
  const nav = { share: () => {}, canShare: () => { throw new Error('nope'); } };
  assert.equal(canAttachFiles(nav), false);
});

test('canAttachFiles probes with a real image File, not a bare object', () => {
  // A browser that validates the file type must see a genuine PNG File.
  let seen = null;
  canAttachFiles({ share: () => {}, canShare: (d) => { seen = d; return true; } });
  assert.ok(seen.files[0] instanceof File);
  assert.equal(seen.files[0].type, 'image/png');
});

test('the two share paths end on different messages', () => {
  assert.match(shareDoneHint('native'), /attached/);
  // The fallback must still tell them to attach it — nothing has yet.
  assert.match(shareDoneHint('fallback'), /attach the image/);
  assert.notEqual(shareDoneHint('native'), shareDoneHint('fallback'));
});

test('share copy matches the path the browser will take', () => {
  const nat = shareLabels(true);
  const web = shareLabels(false);
  assert.equal(web.hint, ATTACH_HINT);
  assert.equal(web.button, 'Share to X');
  // The sheet offers every app, so naming X would be wrong, as would warning about a
  // download that never happens.
  assert.doesNotMatch(nat.button, /X/);
  assert.doesNotMatch(nat.hint, /download/i);
});
