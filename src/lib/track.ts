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

// Capture campaign source (utm_* + external referrer) EAGERLY on first page load,
// before the URL params are lost to navigation. Call this once at app startup.
// First meaningful touch wins — we only persist when there's actual attribution data,
// so a later ad visit can still be captured if the first visit was a bare URL.
export function captureAttribution(): void {
  try {
    if (localStorage.getItem('porfilr_attr')) return; // already captured — first touch wins

    const params = new URLSearchParams(window.location.search);
    const attr: Record<string, any> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = params.get(k);
      if (v) attr[k] = v;
    }
    const ref = document.referrer;
    if (ref && !ref.includes(window.location.hostname)) attr.referrer = ref;

    // Only store if we actually found a source, so a bare visit doesn't lock in "{}"
    // and block a later ad click from being captured.
    if (Object.keys(attr).length) localStorage.setItem('porfilr_attr', JSON.stringify(attr));
  } catch { /* ignore */ }
}

function attribution(): Record<string, any> {
  try {
    const stored = localStorage.getItem('porfilr_attr');
    return stored ? JSON.parse(stored) : {};
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
