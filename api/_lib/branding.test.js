// Porfilr — branding-removal rules.  Run: npm test
//
// These pin a MONEY rule: who gets the free tier's badge taken off. The failure mode is
// silent (a footer quietly appears or disappears on someone's live page), so each paid
// path and each leak gets its own case.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { removeBrandingFor } from './branding.js';

const FREE = { id: 'minimal-template' };
const PRO = { id: 'modern-writer-template', isPro: true };
const KIT = { id: 'trader-template', isPro: true, kit: 'trader' };

test('free template is branded for free users', () => {
  assert.equal(removeBrandingFor(FREE, {}), false);
  assert.equal(removeBrandingFor(FREE, { isPro: false }), false);
});

test('Pro is an account perk — even the free template is unbranded for a member', () => {
  // Pro is sold as "your portfolio, unbranded". Scoping it to Pro templates would put the
  // badge back on an existing member's Minimal page at their next save.
  assert.equal(removeBrandingFor(FREE, { isPro: true }), true);
});

test('owning a kit does NOT de-brand an unrelated free portfolio', () => {
  // The exact leak this module exists to close: typed slots let a kit buyer hold a second,
  // free portfolio, and the old account-wide rule stripped its badge for free.
  assert.equal(removeBrandingFor(FREE, { isPro: false, ownsKit: true }), false);
});

test('pro template is unbranded for Pro members only', () => {
  assert.equal(removeBrandingFor(PRO, { isPro: true }), true);
  assert.equal(removeBrandingFor(PRO, { isPro: false }), false);
});

test('owning a kit does not de-brand a Pro template', () => {
  // A kit is not a Pro subscription. Someone who bought only the kit and somehow reached
  // a Pro template must not get the Pro perk with it.
  assert.equal(removeBrandingFor(PRO, { isPro: false, ownsKit: true }), false);
});

test('kit template is unbranded for owners of THAT kit', () => {
  assert.equal(removeBrandingFor(KIT, { ownsKit: true }), true);
  assert.equal(removeBrandingFor(KIT, { ownsKit: false }), false);
});

test('Pro alone never unlocks a kit template', () => {
  // Kits are sold separately and deliberately do not come with Pro. The branding rule has
  // to agree with the entitlement gate, or a Pro user who slipped past it gets the perk.
  assert.equal(removeBrandingFor(KIT, { isPro: true, ownsKit: false }), false);
});

test('a missing template is never unbranded', () => {
  assert.equal(removeBrandingFor(null, { isPro: true, ownsKit: true }), false);
  assert.equal(removeBrandingFor(undefined, { isPro: true }), false);
});

test('missing entitlements default to branded', () => {
  // Fail closed: if a caller forgets to pass entitlements, the badge stays.
  assert.equal(removeBrandingFor(FREE), false);
  assert.equal(removeBrandingFor(PRO), false);
  assert.equal(removeBrandingFor(KIT), false);
});
