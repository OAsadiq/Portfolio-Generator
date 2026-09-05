import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Where a "Back" control should actually go.
 *
 * Every back link in the app used to be hardcoded to one destination, which is wrong the
 * moment a page has more than one entrance. /edit/:slug has five (dashboard, create,
 * templates, the builder's mobile fallback, and deep links) and sent all of them to
 * /templates — a page most of those people never saw.
 *
 * We pass the origin forward as route state instead of reading browser history.
 * `navigate(-1)` looks like the obvious fix and breaks in the three cases this app hits
 * most:
 *
 *   - Deep links (email, bookmark). No history to go back to, so -1 leaves the site.
 *   - Redirects. Post-login, journal draft creation and the /edit <-> /builder mobile
 *     bounce all push entries; -1 walks into the redirect and it fires forward again.
 *   - Post-publish. -1 returns to the form for a page that is already live, which reads
 *     as "it didn't save" and invites a duplicate.
 *
 * History records where the BROWSER went. `from` records where the USER was. Those differ
 * every time we redirect, which is why the fallback is a deliberate per-route answer to
 * "where does this land when we genuinely don't know" rather than an accident.
 */

/** Route state we attach when navigating somewhere that has a Back control. */
export type BackState = { from?: string };

/**
 * Only same-origin in-app paths are allowed through.
 *
 * `from` arrives via history state, which a page can write to. Rejecting anything that
 * isn't a single leading slash blocks both `https://evil.com` and the protocol-relative
 * `//evil.com` — the latter being the one that looks like a path at a glance.
 */
function safePath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

/**
 * The current location as a `from` value, search string included so filters and tabs
 * survive the round trip. Hand this to `backTo()` when navigating away.
 */
export function useHere(): string {
  const { pathname, search } = useLocation();
  return `${pathname}${search}`;
}

/**
 * Props for a navigation that should be able to come back here.
 *
 *   <Link to={`/edit/${slug}`} {...backTo(here)}>
 *   navigate(`/edit/${slug}`, backTo(here));
 */
export function backTo(from: string): { state: BackState } {
  return { state: { from } };
}

/**
 * Resolve this page's Back destination. `fallback` is used for deep links and for anyone
 * who arrived through a redirect that didn't carry state.
 *
 * Pass `force` to ignore `from` entirely — the publish success screen does this, because
 * returning someone to the form they just completed is worse than merely wrong.
 */
export function useBackTarget(fallback: string, force?: string) {
  const location = useLocation();
  const navigate = useNavigate();

  const to = force ?? safePath((location.state as BackState | null)?.from) ?? fallback;

  // `replace` so Back doesn't stack: tapping it repeatedly should walk out of the app,
  // not build a pile of entries between the editor and the dashboard.
  const goBack = useCallback(() => navigate(to, { replace: true }), [navigate, to]);

  return { to, goBack };
}

export default useBackTarget;
