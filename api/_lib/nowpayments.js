// NOWPayments — pure helpers. No network, no Supabase, so the fiddly parts are testable.
//
// WHY NOWPAYMENTS AND NOT PAYSTACK/FLUTTERWAVE
// Both of those require a registered Nigerian business, which we don't have. NOWPayments
// settles in crypto and needs no local entity — and our audience are traders who already
// hold USDT, so it isn't a workaround for them, it's the rail they use anyway.

import crypto from 'crypto';

/**
 * NOWPayments signs the IPN body with HMAC-SHA512 over the JSON **sorted by key**, not
 * over the raw bytes we received. Re-serialising is therefore required, and the sort has
 * to recurse into nested objects or the digest won't match.
 *
 * Arrays keep their order — only object keys are sorted.
 */
export function sortedStringify(value) {
  if (Array.isArray(value)) return `[${value.map(sortedStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${sortedStringify(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

/**
 * Verify an IPN callback.
 *
 * Returns false rather than throwing: a bad signature is an untrusted caller, not an
 * error in our code, and it must never be allowed to look like a failed-but-genuine
 * payment.
 */
export function verifyIpnSignature(body, signature, secret) {
  if (!signature || !secret || !body) return false;
  const expected = crypto
    .createHmac('sha512', secret)
    .update(sortedStringify(body))
    .digest('hex');

  // Both sides are hex of fixed length, but compare in constant time anyway — a plain ===
  // leaks timing information about how much of the digest matched.
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * We get one free text field back from NOWPayments (`order_id`), so it has to carry
 * everything fulfilment needs: who bought, and what.
 *
 * Format: `porfilr:<userId>:<product>`. The product may itself contain hyphens
 * ('trader-template'), so split on the FIRST two colons only.
 */
export function buildOrderId(userId, product) {
  if (!userId || !product) throw new Error('buildOrderId: userId and product are required');
  if (String(userId).includes(':') || String(product).includes(':')) {
    throw new Error('buildOrderId: userId/product must not contain ":"');
  }
  return `porfilr:${userId}:${product}`;
}

/** Parse an order_id back out. Returns null for anything we didn't create. */
export function parseOrderId(orderId) {
  const s = String(orderId || '');
  if (!s.startsWith('porfilr:')) return null;
  const rest = s.slice('porfilr:'.length);
  const i = rest.indexOf(':');
  if (i <= 0) return null;
  const userId = rest.slice(0, i);
  const product = rest.slice(i + 1);
  if (!userId || !product) return null;
  return { userId, product };
}

/**
 * Which payment statuses mean "the money is ours".
 *
 * Deliberately NOT 'confirming' or 'sending' — those can still fail. 'partially_paid'
 * means they underpaid, which needs a human, not an automatic grant.
 */
const PAID = new Set(['finished', 'confirmed']);

export function isPaid(status) {
  return PAID.has(String(status || '').toLowerCase());
}

/** Statuses worth recording but not acting on, so a human can see what happened. */
export function isNoticeable(status) {
  return ['partially_paid', 'failed', 'expired', 'refunded'].includes(
    String(status || '').toLowerCase(),
  );
}

export default verifyIpnSignature;
