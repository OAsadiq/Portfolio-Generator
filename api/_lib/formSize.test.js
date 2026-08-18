// Porfilr — publish payload limits.  Run: npm test
//
// These guard against the Jan 2026 incident (a 683 KB base64 JPEG in a text field → a
// 2.8 MB page with broken link previews) WITHOUT blocking someone who legitimately writes
// a long case study. Both directions are tested: the real-world sizes must pass.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateFormData, MAX_FIELD_BYTES, MAX_TOTAL_BYTES } from './formSize.js';

const realistic = {
  fullName: 'Jordan Rivera',
  headline: 'Senior Product Designer',
  bio: 'x'.repeat(600),
  sample1Description: 'y'.repeat(930),   // the largest real field observed
  profileImage: 'https://xyz.supabase.co/storage/v1/object/public/images/a/b/1.jpg',
  email: 'jordan@example.com',
};

test('a realistic portfolio passes', () => {
  assert.deepEqual(validateFormData(realistic, [{ id: 'about', visible: true, order: 0 }]), { ok: true });
});

test('a long case study still publishes', () => {
  // Headroom is deliberate: the caps sit far above the largest real page so that writing
  // a lot of prose is never the thing that blocks a publish.
  const wordy = { ...realistic, sample1Description: 'z'.repeat(20000) };
  assert.equal(validateFormData(wordy, []).ok, true);
});

test('an inlined base64 image is rejected at any size', () => {
  // The original incident. Note it is refused even though it is well under the size caps —
  // a small data: URI still breaks og:image, which is the expensive half of the bug.
  const r = validateFormData({ ...realistic, profileImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' }, []);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'INLINE_IMAGE_REJECTED');
  assert.equal(r.status, 400);
  assert.match(r.error, /profileImage/, 'names the offending field');
  assert.match(r.error, /upload/i, 'tells the user what to do instead');
});

test('the actual 683 KB payload that caused this is rejected', () => {
  const huge = { ...realistic, profileImage: 'data:image/jpeg;base64,' + 'A'.repeat(932255) };
  assert.equal(validateFormData(huge, []).ok, false);
});

test('leading whitespace does not sneak a data URI past the check', () => {
  const r = validateFormData({ ...realistic, profileImage: '  \n data:image/png;base64,iVBOR' }, []);
  assert.equal(r.code, 'INLINE_IMAGE_REJECTED');
});

test('a data URI is caught whatever the case', () => {
  const r = validateFormData({ ...realistic, profileImage: 'DATA:image/png;base64,iVBOR' }, []);
  assert.equal(r.code, 'INLINE_IMAGE_REJECTED');
});

test('an oversized single field is refused and named', () => {
  const r = validateFormData({ bio: 'x'.repeat(MAX_FIELD_BYTES + 1) }, []);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'FIELD_TOO_LARGE');
  assert.equal(r.status, 413);
  assert.match(r.error, /bio/);
});

test('many medium fields still trip the total cap', () => {
  // Each field is legal on its own — only the sum is not. Without a total cap, the
  // per-field limit could be worked around by splitting a payload across fields.
  const many = {};
  for (let i = 0; i < 40; i++) many[`f${i}`] = 'x'.repeat(20 * 1024);
  const r = validateFormData(many, []);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'FORM_DATA_TOO_LARGE');
});

test('size is measured in BYTES, not characters', () => {
  // A multi-byte character counts for what it actually costs to store and serve.
  const emoji = '🎯';                       // 4 bytes, length 2
  const field = emoji.repeat(MAX_FIELD_BYTES / 4);
  assert.equal(field.length < MAX_FIELD_BYTES, true, 'passes a naive .length check');
  assert.equal(validateFormData({ bio: field }, []).ok, false, 'but is caught by byte length');
});

test('non-string values are measured too', () => {
  const r = validateFormData({ blob: { nested: 'x'.repeat(MAX_FIELD_BYTES) } }, []);
  assert.equal(r.code, 'FIELD_TOO_LARGE');
});

test('an oversized sections array is refused', () => {
  const r = validateFormData(realistic, [{ id: 'x'.repeat(70 * 1024) }]);
  assert.equal(r.code, 'SECTIONS_TOO_LARGE');
});

test('missing or malformed form_data is refused', () => {
  assert.equal(validateFormData(null, []).code, 'INVALID_FORM_DATA');
  assert.equal(validateFormData('a string', []).code, 'INVALID_FORM_DATA');
  assert.equal(validateFormData([], []).code, 'INVALID_FORM_DATA');
});

test('absent sections is fine', () => {
  assert.equal(validateFormData(realistic, undefined).ok, true);
  assert.equal(validateFormData(realistic, null).ok, true);
});

test('empty values and empty form_data do not crash', () => {
  assert.equal(validateFormData({}, []).ok, true);
  assert.equal(validateFormData({ a: undefined, b: null, c: '' }, []).ok, true);
});

test('the caps leave real portfolios a wide margin', () => {
  // Largest real portfolio at the time of writing was 4,664 bytes.
  assert.ok(MAX_TOTAL_BYTES > 4664 * 20, 'total cap has >20x headroom over the biggest real page');
});
