import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isJournalTemplate, shouldEmailOwner, ownerEmailFor, FREE_TRADE_CAP,
} from './liveEmail.js';

// ── Who counts as a journal ───────────────────────────────────────────────
test('trader-template is the journal; ordinary templates are not', () => {
  assert.equal(isJournalTemplate('trader-template'), true);
  assert.equal(isJournalTemplate('minimal-template'), false);
  assert.equal(isJournalTemplate('professional-writer-template'), false);
  assert.equal(isJournalTemplate(undefined), false);
  assert.equal(isJournalTemplate(null), false);
});

// ── Drafts must not be congratulated ──────────────────────────────────────
// The bug this guards: /journal creates a draft row so the journal has a home. That
// INSERT fired the webhook and told people their page was live, linking to a slug that
// 404s.
test('a draft earns no owner email', () => {
  assert.equal(
    shouldEmailOwner({ status: 'draft', user_email: 'a@b.com', slug: 'x' }),
    false,
  );
});

test('a published page with an email and slug earns one', () => {
  assert.equal(
    shouldEmailOwner({ status: 'active', user_email: 'a@b.com', slug: 'x' }),
    true,
  );
});

test('published but missing an email or slug earns nothing', () => {
  assert.equal(shouldEmailOwner({ status: 'active', slug: 'x' }), false);
  assert.equal(shouldEmailOwner({ status: 'active', user_email: 'a@b.com' }), false);
  assert.equal(shouldEmailOwner({}), false);
});

// ── The two emails actually differ ────────────────────────────────────────
test('journal and portfolio emails differ in subject and body', () => {
  const j = ownerEmailFor({ templateId: 'trader-template', name: 'Ada L', slug: 'ada' });
  const p = ownerEmailFor({ templateId: 'minimal-template', name: 'Ada L', slug: 'ada' });
  assert.notEqual(j.subject, p.subject);
  assert.notEqual(j.html, p.html);
});

test('the journal email points at the journal and skips portfolio-marketing advice', () => {
  const { subject, html } = ownerEmailFor({
    templateId: 'trader-template', name: 'Ada Lovelace', slug: 'ada-fx',
  });
  assert.match(subject, /Journal/);
  assert.ok(html.includes('https://porfilr.com/journal/ada-fx'), 'links to the journal');
  assert.match(html, /starting balance/i);
  assert.match(html, /track record/i);
  // The exact copy that made a trader feel like they'd been sent someone else's email.
  assert.ok(!/Instagram bio/i.test(html));
  assert.ok(!/Google Doc/i.test(html));
  assert.ok(!/contact form/i.test(html));
});

test('the portfolio email is unchanged in intent and never mentions trades', () => {
  const { subject, html } = ownerEmailFor({
    templateId: 'minimal-template', name: 'Ada Lovelace', slug: 'ada',
  });
  assert.match(subject, /portfolio is live/);
  assert.ok(html.includes('https://porfilr.com/p/ada'));
  assert.match(html, /Instagram bio/);
  assert.ok(!/starting balance/i.test(html));
  assert.ok(!/track record/i.test(html));
});

// ── The free cap is stated to free users only ─────────────────────────────
test('free journal users are told the cap; kit owners are not', () => {
  const free = ownerEmailFor({ templateId: 'trader-template', slug: 's', ownsKit: false });
  const paid = ownerEmailFor({ templateId: 'trader-template', slug: 's', ownsKit: true });
  assert.ok(free.html.includes(String(FREE_TRADE_CAP)), 'free user sees the number');
  assert.ok(!/free plan/i.test(paid.html), 'a paying owner is not pitched their own product');
});

test('the stated cap is the one we enforce', () => {
  // If this fails, sql/014_trade_cap_15.sql and the copy have drifted apart again.
  assert.equal(FREE_TRADE_CAP, 15);
});

// ── Names ─────────────────────────────────────────────────────────────────
test('first name only, with a safe fallback', () => {
  assert.match(ownerEmailFor({ templateId: 'minimal-template', name: 'Ada Lovelace', slug: 's' }).html, /It's live, Ada /);
  assert.match(ownerEmailFor({ templateId: 'minimal-template', name: '', slug: 's' }).html, /It's live, there /);
  assert.match(ownerEmailFor({ templateId: 'minimal-template', slug: 's' }).html, /It's live, there /);
});

test('a name cannot inject markup', () => {
  const { html } = ownerEmailFor({
    templateId: 'trader-template', name: '<script>alert(1)</script>', slug: 's',
  });
  assert.ok(!html.includes('<script>'), 'the tag is escaped, not rendered');
  assert.ok(html.includes('&lt;script&gt;'));
});

test('a slug cannot break out of the href', () => {
  const { html } = ownerEmailFor({
    templateId: 'trader-template', name: 'Ada', slug: 'a"onmouseover="x',
  });
  assert.ok(!html.includes('onmouseover="x"'), 'no attribute injection');
});
