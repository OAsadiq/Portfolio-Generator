import { attributionSource } from './track';

export type KitCheckoutResult =
  | { kind: 'granted'; reason?: string | null }
  | { kind: 'alreadyOwned' }
  | { kind: 'checkout'; url: string };

/**
 * Start a kit purchase.
 *
 * Shared by the create page and the journal's free-limit dialog so the two can't drift —
 * the same mistake the branding rule made when it lived in three places.
 *
 * Note what is NOT sent: the price. It's resolved server-side from templateId, or a client
 * could substitute a cheaper one. See KIT_PRICE_ENV in api/stripe/actions.js.
 */
export async function startKitCheckout(
  templateId: string,
  user: { id: string; email?: string | null },
  /**
   * Where Stripe's "back" link returns to. Defaults to the page they're on, so abandoning
   * checkout puts them back where they were — the journal, usually — instead of on the
   * template grid, which is where the old fixed cancel_url sent everyone.
   *
   * The server only accepts a same-site path and falls back to /templates otherwise; a
   * full URL from here would make the Stripe session an open redirect.
   */
  cancelPath: string = typeof window !== 'undefined' ? window.location.pathname : '/templates'
): Promise<KitCheckoutResult> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-template-checkout',
      templateId,
      userId: user.id,
      userEmail: user.email,
      cancelPath,
      // Who drove this visitor here (first-touch). Recorded on the purchase so growth
      // commission is provable from data rather than memory.
      attribution: attributionSource(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = 'Failed to start checkout';
    try { msg = JSON.parse(text).error || msg; } catch { /* keep the default */ }
    throw new Error(msg);
  }

  const data = await res.json();

  // A referral credit (or an existing purchase) unlocks the kit without Stripe. There's no
  // checkout URL in that case, and treating it as an error would tell someone their free
  // kit had failed.
  if (data.granted) return { kind: 'granted', reason: data.reason ?? null };
  if (data.alreadyOwned) return { kind: 'alreadyOwned' };
  if (data.url) return { kind: 'checkout', url: data.url };

  throw new Error('No checkout URL returned');
}
