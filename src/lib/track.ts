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
      props,
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      user_id: data.session?.user?.id ?? null,
      session_id: sessionId(),
    });
  } catch {
    /* ignore — never surface analytics errors to the user */
  }
}
