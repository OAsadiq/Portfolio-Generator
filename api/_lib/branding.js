// Porfilr — who gets the "Made with Porfilr" badge removed.
//
// Two different kinds of entitlement, deliberately:
//
//   • Pro is an ACCOUNT perk — a Pro member's pages are unbranded, all of them.
//   • A kit is a PRODUCT — it de-brands its own page and nothing else.
//
// This used to be `isPro || ownsAnyKit`, evaluated once for the whole user. The Pro half
// was right; the kit half wasn't. It was harmless while everyone had exactly one
// portfolio, but typed slots let a user hold two — so buying the $35 Trader Kit silently
// stripped the badge from their unrelated free portfolio too. The kit is a trader page,
// not an account-wide de-branding upgrade.
//
// Pure function so both create-portfolio and update-portfolio answer identically. If they
// disagree, a page's footer flips on the next save, which is the worst kind of bug: the
// user sees it, you don't.

/**
 * @param template  the template being published ({ isPro, kit } flags)
 * @param entitlements
 *   isPro    - the user has an active Pro plan
 *   ownsKit  - the user owns THIS template's kit (not "a kit" — this one)
 * @returns true when the badge should be omitted
 */
export function removeBrandingFor(template, entitlements = {}) {
  if (!template) return false;
  const { isPro = false, ownsKit = false } = entitlements;

  // Kit templates are their own product. Pro does not unlock them, and owning a
  // different kit does not either. (A Pro member can't reach this branch without owning
  // the kit anyway — the entitlement gate stops them — so this is a fail-closed guard.)
  if (template.kit) return !!ownsKit;

  // Everything else — Pro templates AND free ones — follows the account. Pro is sold as
  // "your portfolio, unbranded", so a Pro member who happens to prefer the free Minimal
  // template still gets what they paid for. Scoping this to Pro templates only would
  // quietly put the badge back on an existing member's page at their next save.
  return !!isPro;
}

export default removeBrandingFor;
