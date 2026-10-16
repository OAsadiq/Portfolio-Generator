import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  sortedStringify, verifyIpnSignature, buildOrderId, parseOrderId, isPaid, isNoticeable,
} from './nowpayments.js';

const SECRET = 'test-ipn-secret';
const sign = (body, secret = SECRET) =>
  crypto.createHmac('sha512', secret).update(sortedStringify(body)).digest('hex');

// ── Signing ───────────────────────────────────────────────────────────────
test('keys are sorted, including nested ones', () => {
  assert.equal(sortedStringify({ b: 1, a: 2 }), '{"a":2,"b":1}');
  assert.equal(sortedStringify({ z: { d: 1, c: 2 } }), '{"z":{"c":2,"d":1}}');
});

test('array order is preserved — only object keys sort', () => {
  assert.equal(sortedStringify({ a: [3, 1, 2] }), '{"a":[3,1,2]}');
});

test('key order in the received body does not change the digest', () => {
  const a = { payment_id: 1, payment_status: 'finished', order_id: 'porfilr:u1:pro' };
  const b = { order_id: 'porfilr:u1:pro', payment_status: 'finished', payment_id: 1 };
  assert.equal(sign(a), sign(b));
});

test('a valid signature verifies', () => {
  const body = { payment_id: 99, payment_status: 'finished', order_id: 'porfilr:u1:pro' };
  assert.equal(verifyIpnSignature(body, sign(body), SECRET), true);
});

test('a tampered body is rejected', () => {
  const body = { payment_id: 99, payment_status: 'waiting', order_id: 'porfilr:u1:pro' };
  const sig = sign(body);
  body.payment_status = 'finished';            // attacker upgrades the status
  assert.equal(verifyIpnSignature(body, sig, SECRET), false);
});

test('the wrong secret is rejected', () => {
  const body = { payment_id: 1 };
  assert.equal(verifyIpnSignature(body, sign(body, 'other-secret'), SECRET), false);
});

test('missing signature, secret or body is rejected rather than throwing', () => {
  const body = { payment_id: 1 };
  assert.equal(verifyIpnSignature(body, null, SECRET), false);
  assert.equal(verifyIpnSignature(body, sign(body), null), false);
  assert.equal(verifyIpnSignature(null, sign(body), SECRET), false);
});

test('a signature of the wrong length is rejected, not crashed on', () => {
  // timingSafeEqual throws on length mismatch — this must be handled before it is called.
  assert.doesNotThrow(() => verifyIpnSignature({ a: 1 }, 'deadbeef', SECRET));
  assert.equal(verifyIpnSignature({ a: 1 }, 'deadbeef', SECRET), false);
});

// ── order_id round trip ───────────────────────────────────────────────────
test('order_id survives a product containing hyphens', () => {
  const id = buildOrderId('user-123', 'trader-template');
  assert.deepEqual(parseOrderId(id), { userId: 'user-123', product: 'trader-template' });
});

test('order_id round-trips for pro', () => {
  assert.deepEqual(parseOrderId(buildOrderId('u1', 'pro')), { userId: 'u1', product: 'pro' });
});

test('foreign or malformed order ids parse to null', () => {
  assert.equal(parseOrderId('someone-elses-order'), null);
  assert.equal(parseOrderId('porfilr:'), null);
  assert.equal(parseOrderId('porfilr:u1'), null);
  assert.equal(parseOrderId(''), null);
  assert.equal(parseOrderId(null), null);
});

test('a colon in the input is refused rather than silently corrupting the id', () => {
  assert.throws(() => buildOrderId('u:1', 'pro'));
  assert.throws(() => buildOrderId('u1', 'pro:x'));
  assert.throws(() => buildOrderId('', 'pro'));
});

// ── Status handling ───────────────────────────────────────────────────────
test('only settled statuses grant access', () => {
  assert.equal(isPaid('finished'), true);
  assert.equal(isPaid('confirmed'), true);
  // These can all still fail — granting on them would give away the product.
  for (const s of ['waiting', 'confirming', 'sending', 'partially_paid', 'failed', 'expired', 'refunded']) {
    assert.equal(isPaid(s), false, `${s} must not grant`);
  }
});

test('underpayment is flagged for a human, never auto-granted', () => {
  assert.equal(isPaid('partially_paid'), false);
  assert.equal(isNoticeable('partially_paid'), true);
});
