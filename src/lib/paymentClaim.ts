import { supabase } from './supabase';
import { track } from './track';

/**
 * File an "I've paid" claim for a payment we took by hand.
 *
 * This grants NOTHING. It records that someone says they sent money, so the handoff stops
 * living in DMs and becomes a queue that can be cleared twice a day. The money is still
 * checked against the bank statement, and access is still granted deliberately with
 * scripts/grant-kit.mjs.
 *
 * Why manual at all: Paystack and Flutterwave both require a Nigerian entity we don't
 * have, so naira has no automated rail available to us.
 */

export type PaymentMethod = 'bank_transfer' | 'usdt';

export interface ClaimInput {
  email: string;
  method: PaymentMethod;
  amountMajor?: number | null;
  currency: string;
  reference: string;
  note?: string;
  /** Kit template id ('trader-template', and whatever kits come next) or 'pro'. */
  product: string;
  userId?: string | null;
}

/** Mirrors the bounds in the RLS policy (sql/017), so a rejection is caught here first. */
export function validateClaim(input: Partial<ClaimInput>): string | null {
  const email = (input.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter the email address on your Porfilr account.';
  if (email.length > 200) return 'That email is too long.';
  if (!input.method) return 'Pick how you paid.';
  // The reference is the only thing that lets a payment be found on a statement or a block
  // explorer. Without it a claim can't be checked, so it isn't worth filing.
  const ref = (input.reference || '').trim();
  if (ref.length < 3) return 'Add the transfer reference or transaction hash so we can find your payment.';
  if (ref.length > 200) return 'That reference is too long.';
  if ((input.note || '').length > 500) return 'Please keep the note under 500 characters.';
  // No default. A claim that doesn't say what was bought can't be fulfilled, and quietly
  // assuming 'trader-template' would misfile the first sale of every future kit.
  if (!(input.product || '').trim()) return 'Missing product.';
  return null;
}

export async function submitPaymentClaim(input: ClaimInput): Promise<void> {
  const problem = validateClaim(input);
  if (problem) throw new Error(problem);

  const { error } = await supabase.from('payment_claims').insert({
    user_id: input.userId ?? null,
    email: input.email.trim().toLowerCase(),
    product: input.product.trim(),
    method: input.method,
    amount_major: input.amountMajor ?? null,
    currency: input.currency,
    reference: input.reference.trim(),
    note: (input.note || '').trim() || null,
    status: 'pending',
  });
  if (error) throw new Error(error.message);

  // Analytics is best-effort and must never make a successful claim look failed.
  try {
    track('payment_claim_filed', { method: input.method, currency: input.currency, product: input.product });
  } catch { /* ignore */ }
}

export default submitPaymentClaim;
