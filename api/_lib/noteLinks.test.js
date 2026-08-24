// Porfilr — note link extraction.  Run: npm test
//
// This turns user-typed text into clickable links, so it's both a formatting problem and a
// security one. Both are tested here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractLinks, displayLabel } from './noteLinks.js';

test('pulls a full URL out and leaves the sentence readable', () => {
  const { text, links } = extractLinks('Entered off the 4h level https://tradingview.com/x/abc123 looked clean');
  assert.equal(links.length, 1);
  assert.equal(links[0].href, 'https://tradingview.com/x/abc123');
  assert.equal(text, 'Entered off the 4h level looked clean');
});

test('a bare domain becomes a real link', () => {
  // How people actually type. Without this the most common case stays unclickable.
  const { links } = extractLinks('chart here tradingview.com/x/abc');
  assert.equal(links[0].href, 'https://tradingview.com/x/abc');
});

test('a trailing full stop is punctuation, not part of the link', () => {
  const { text, links } = extractLinks('See https://example.com/chart.');
  assert.equal(links[0].href, 'https://example.com/chart');
  assert.equal(text, 'See.', 'the full stop stays in the sentence');
});

test('a wrapping bracket is not swallowed into the URL', () => {
  const { links } = extractLinks('(https://example.com/a)');
  assert.equal(links[0].href, 'https://example.com/a');
});

test('the same link twice is listed once', () => {
  const { links } = extractLinks('https://example.com/a and again https://example.com/a');
  assert.equal(links.length, 1);
});

test('multiple different links are all kept, in order', () => {
  const { links } = extractLinks('before https://a.com/1 middle https://b.com/2 after');
  assert.deepEqual(links.map(l => l.href), ['https://a.com/1', 'https://b.com/2']);
});

test('javascript: is never turned into a link', () => {
  // The whole reason this is a tested function. A note is user input rendered back to the
  // user — turning "javascript:alert(1)" into an anchor would be an XSS vector.
  const { links } = extractLinks('click javascript:alert(1) now');
  assert.equal(links.length, 0);
});

test('data: URIs are not linked either', () => {
  const { links } = extractLinks('data:text/html;base64,PHNjcmlwdD4=');
  assert.equal(links.length, 0);
});

test('a note with no link is returned untouched', () => {
  const note = 'It was a buy setup but I entered from a liquidity zone.';
  const { text, links } = extractLinks(note);
  assert.equal(text, note);
  assert.deepEqual(links, []);
});

test('a note that is only a link leaves empty text', () => {
  const { text, links } = extractLinks('https://example.com/only');
  assert.equal(text, '');
  assert.equal(links.length, 1);
});

test('empty and null notes do not crash', () => {
  assert.deepEqual(extractLinks(''), { text: '', links: [] });
  assert.deepEqual(extractLinks(null), { text: '', links: [] });
  assert.deepEqual(extractLinks(undefined), { text: '', links: [] });
});

test('labels are shortened but still recognisable', () => {
  assert.equal(displayLabel('https://www.tradingview.com/chart/'), 'tradingview.com/chart');
  const long = displayLabel('https://example.com/' + 'a'.repeat(80));
  assert.ok(long.length <= 42, `got ${long.length}`);
  assert.ok(long.startsWith('example.com/'));
});

test('a decimal number is not mistaken for a domain', () => {
  // "risked 1.5% and took 2.5R" must not become links.
  const { links } = extractLinks('risked 1.5% and took 2.5R on 3.com');
  assert.deepEqual(links.map(l => l.href), ['https://3.com'], 'only the real domain');
});
