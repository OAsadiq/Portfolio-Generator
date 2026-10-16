import { track } from './track';

/**
 * Start a NOWPayments invoice.
 *
 * Mirrors startKitCheckout: the client sends only WHAT is being bought, never the price —
 * the server resolves that from the product id, so a tampered request can't buy a $35 kit
 * for $1.
 */
export type CryptoCheckoutResult =
  | { kind: 'alreadyOwned' }
  | { kind: 'checkout'; url: string };

export async function startCryptoCheckout(
  product: string,
  user: { id: string; email?: string | null },
): Promise<CryptoCheckoutResult> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/nowpayments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-invoice',
      product,
      userId: user.id,
      email: user.email,
    }),
  });

  if (!res.ok) {
    let msg = 'Could not start crypto checkout.';
    try { msg = (await res.json()).error || msg; } catch { /* keep the default */ }
    throw new Error(msg);
  }

  const data = await res.json();
  if (data.alreadyOwned) return { kind: 'alreadyOwned' };
  if (!data.url) throw new Error('No checkout URL returned.');

  track('crypto_checkout_started', { product });
  return { kind: 'checkout', url: data.url };
}

export default startCryptoCheckout;
