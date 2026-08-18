// Where a user lands after signing in.
//
// Both entry points into the app need the same answer — the OTP form (LoginPage) and the
// Google round-trip (AuthCallback) — and they used to disagree. Keeping the rule in one
// place is the only way they stay in step.

import { supabase } from './supabase';

/** Read and consume the explicit return path, if one was stashed before login. */
export function takeAfterLogin(): string | null {
  const stored = localStorage.getItem('porfilr_after_login');
  // Always clear it, even if we end up not using it — a leftover value would hijack a
  // later, unrelated login.
  if (stored) localStorage.removeItem('porfilr_after_login');
  return stored;
}

/**
 * Resolve the landing path for a freshly signed-in user.
 *
 * An explicit return path always wins (they were mid-flow: filling a portfolio, buying a
 * kit). Otherwise: anyone who has already built something goes to their dashboard —
 * dropping a returning user on the template grid asks them to re-pick a template they
 * chose months ago. Someone with nothing yet goes to /templates, which really is their
 * next step.
 *
 * Note this deliberately does NOT branch on Pro vs free. Pro is about what a user may
 * publish, not where they start; a Pro user with no portfolio still needs to pick a
 * template, and a free user with one still wants their dashboard.
 */
export async function postLoginPath(userId: string, explicit?: string | null): Promise<string> {
  const target = explicit !== undefined ? explicit : takeAfterLogin();
  if (target) return target;

  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    // On error fall through to /templates rather than guessing — a wrong /dashboard
    // redirect strands a brand-new user on an empty page.
    if (!error && data && data.length > 0) return '/dashboard';
  } catch (err) {
    console.error('postLoginPath lookup failed:', err);
  }

  return '/templates';
}
