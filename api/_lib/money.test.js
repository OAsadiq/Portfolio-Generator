import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, compactMoney, currencyOf, isValidCurrency, CURRENCIES } from './money.js';

// ── The rule that matters ─────────────────────────────────────────────────
test('an unset currency prints a BARE number, never a dollar sign', () => {
  // Defaulting to "$" is the exact misreading this module exists to prevent: a Lagos
  // trader's 450,000 would read as $450k to every stranger who saw the card.
  assert.equal(formatMoney(450000, null), '450,000');
  assert.equal(formatMoney(450000, ''), '450,000');
  assert.equal(formatMoney(450000, 'NOPE'), '450,000', 'an unknown code is treated as unset');
  for (const v of [null, '', undefined, 'XYZ']) {
    assert.ok(!formatMoney(1234, v).includes('$'), `"${v}" must not produce a $`);
  }
});

test('a set currency prints its symbol', () => {
  assert.equal(formatMoney(450000, 'NGN'), '₦450,000');
  assert.equal(formatMoney(1234.5, 'USD'), '$1,234.5');
  assert.equal(formatMoney(99, 'GBP'), '£99');
});

test('codes without a symbol trail the code instead', () => {
  // "USDT1,000" would read as nonsense; "1,000 USDT" reads as money.
  assert.equal(formatMoney(1000, 'USDT'), '1,000 USDT');
});

test('case does not matter', () => {
  assert.equal(formatMoney(5, 'ngn'), '₦5');
  assert.equal(isValidCurrency('usd'), true);
});

// ── Signs ─────────────────────────────────────────────────────────────────
test('negatives keep their sign, in front of the symbol', () => {
  assert.equal(formatMoney(-250, 'NGN'), '-₦250');
  assert.equal(formatMoney(-250, null), '-250');
});

test('a plus sign only appears when asked for', () => {
  assert.equal(formatMoney(250, 'USD'), '$250');
  assert.equal(formatMoney(250, 'USD', { signed: true }), '+$250');
  assert.equal(formatMoney(-250, 'USD', { signed: true }), '-$250');
  assert.equal(formatMoney(0, 'USD', { signed: true }), '$0', 'zero is not positive');
});

// ── Compact ───────────────────────────────────────────────────────────────
test('compact form scales and keeps the currency rule', () => {
  assert.equal(compactMoney(1_250_000, 'NGN'), '₦1.3M');
  assert.equal(compactMoney(31_240, 'USD'), '$31k');
  assert.equal(compactMoney(1500, 'GBP'), '£1.5k');
  assert.equal(compactMoney(450, 'USD'), '$450');
  assert.equal(compactMoney(31_240, null), '31k', 'no currency, no symbol');
  assert.equal(compactMoney(1000, 'USDT'), '1k USDT');
});

// ── Guards ────────────────────────────────────────────────────────────────
test('non-numbers produce a dash, not NaN', () => {
  for (const v of [null, undefined, 'abc', NaN]) {
    assert.equal(formatMoney(v, 'USD'), '—');
    assert.equal(compactMoney(v, 'USD'), '—');
  }
});

test('the currency list is well formed', () => {
  assert.ok(CURRENCIES.length >= 5);
  for (const c of CURRENCIES) {
    assert.equal(typeof c.code, 'string');
    assert.equal(c.code, c.code.toUpperCase());
    assert.equal(typeof c.label, 'string');
    assert.equal(typeof c.symbol, 'string');
  }
  assert.equal(currencyOf('NGN').label, 'Nigerian Naira');
  assert.equal(currencyOf('nope'), null);
});
