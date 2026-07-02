/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';

// Stable per-browser id so events can be grouped into sessions without cookies.
function sessionId(): string {
  try {
    let id = localStorage.getItem('porfilr_sid');
    if (!id) {
      id = (crypto as any).randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
      localStorage.setItem('porfilr_sid', id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}

// Capture the campaign source ONCE per session, on first landing, and persist it.
// This way a signup/publish that happens minutes later still carries the utm/referrer
// that first brought the visitor in (e.g. the X ad), so we can attribute conversions.
function attribution(): Record<string, any> {
  try {
    const stored = localStorage.getItem('porfilr_attr');
    if (stored) return JSON.parse(stored);

    const params = new URLSearchParams(window.location.search);
    const attr: Record<string, any> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = params.get(k);
      if (v) attr[k] = v;
    }
    // Only record a referrer if it's external (not our own site).
    const ref = document.referrer;
    if (ref && !ref.includes(window.location.hostname)) attr.referrer = ref;

    // Persist even if empty, so we capture the FIRST touch and don't overwrite it later.
    localStorage.setItem('porfilr_attr', JSON.stringify(attr));
    return attr;
  } catch {
    return {};
  }
}

/**
 * Fire-and-forget activity event → Supabase `events` table.
 * Analytics must NEVER break the UX, so every failure is swallowed.
 * Visits/pageviews are handled separately by Cloudflare Web Analytics.
 */
export async function track(name: string, props: Record<string, any> = {}) {
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from('events').insert({
      name,
      props: { ...attribution(), ...props },
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      user_id: data.session?.user?.id ?? null,
      session_id: sessionId(),
    });
  } catch {
    /* ignore — never surface analytics errors to the user */
  }
}
