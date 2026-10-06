// Granting lifetime Pro, in one place.
//
// Pro is not a kit: it lives in `subscriptions`, not `template_purchases`, so the kit
// grant path cannot produce it. This was written when manual payments arrived — Paystack
// and Flutterwave both need a Nigerian entity we don't have, so naira sales are fulfilled
// by hand, and a Nigerian buyer previously could not get Pro at all.
//
// The record shape must match what the Stripe webhook writes for a `pro_lifetime`
// purchase, or the two paths would produce subtly different accounts.

/** Far-future end date — "lifetime" expressed in a column that wants a timestamp. */
export const LIFETIME_END = '2099-12-31T00:00:00Z';

/**
 * Give a user lifetime Pro. Idempotent: updates the existing row if there is one, inserts
 * otherwise, so running it twice doesn't create a second subscription.
 *
 * @param supabase a service-role client
 * @param userId
 * @param extra    provider-specific fields, e.g. { stripe_customer_id }
 * @returns {Promise<{ created: boolean }>}
 */
export async function grantLifetimePro(supabase, userId, extra = {}) {
  if (!userId) throw new Error('grantLifetimePro: userId is required');

  const record = {
    user_id: userId,
    status: 'active',
    plan: 'pro',
    current_period_start: new Date().toISOString(),
    current_period_end: LIFETIME_END,
    updated_at: new Date().toISOString(),
    ...extra,
  };

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from('subscriptions').update(record).eq('user_id', userId)
    : await supabase.from('subscriptions').insert(record);

  if (error) throw new Error(error.message);
  return { created: !existing };
}

/** Does this user already have active Pro? Lets a caller avoid a pointless write. */
export async function hasActivePro(supabase, userId) {
  const { data } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  const sub = data && data[0];
  return sub?.status === 'active' && sub?.plan === 'pro';
}

export default grantLifetimePro;
