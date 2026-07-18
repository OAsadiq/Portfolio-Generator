import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        console.error('Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, ...data } = req.body;

        console.log('Stripe action received:', action);

        switch (action) {
            case 'create-checkout-session':
                return await handleCreateCheckoutSession(data, res);
            case 'create-template-checkout':
                return await handleCreateTemplateCheckout(data, res);
            case 'create-portal-session':
                return await handleCreatePortalSession(data, res);
            default:
                console.error('Invalid action:', action);
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Stripe handler error:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleCreateCheckoutSession({ priceId, userId, userEmail }, res) {
    console.log('Creating checkout session for:', userEmail);
    
    if (!userId || !userEmail) {
        console.error('Missing userId or userEmail');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!priceId) {
        console.error('Missing priceId');
        return res.status(400).json({ error: 'Price ID is required' });
    }

    try {
        let customerId;
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single();

        if (existingSub?.stripe_customer_id) {
            customerId = existingSub.stripe_customer_id;
            console.log('Using existing customer:', customerId);
        } else {
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: { userId }
            });
            customerId = customer.id;
            console.log('Created new customer:', customerId);
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment', // one-time Pro purchase — lifetime access (requires a ONE-TIME price in Stripe)
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.VITE_REDIRECT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.VITE_REDIRECT_URL}/pricing`,
            metadata: { userId, type: 'pro_lifetime' }
        });

        console.log('Checkout session created:', session.id);
        return res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Checkout session error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// Server owns the price for each kit. NEVER trust a client-sent priceId: price IDs are
// public (they ship in the browser bundle), so a client could otherwise substitute the
// cheaper $19 Pro price and buy a $35 kit for $19. The client sends only templateId.
const KIT_PRICE_ENV = {
    'trader-template': 'STRIPE_TRADER_KIT_PRICE_ID',
};

async function handleCreateTemplateCheckout({ templateId, userId, userEmail }, res) {
    if (!userId || !templateId) {
        return res.status(400).json({ error: 'Missing user or template' });
    }

    const priceEnv = KIT_PRICE_ENV[templateId];
    const priceId = priceEnv ? process.env[priceEnv] : null;
    if (!priceId) {
        // A kit with no configured price must never fall through to a free grant path.
        return res.status(400).json({ error: 'This kit is not available for purchase yet.' });
    }

    try {
        // ── Already owns it? ──
        // Don't charge twice, and never burn a referral credit on something they have.
        const { data: owned } = await supabase
            .from('template_purchases')
            .select('id')
            .eq('user_id', userId)
            .eq('template_id', templateId)
            .maybeSingle();
        if (owned) {
            return res.json({ alreadyOwned: true });
        }

        // ── Referral kit credit ──
        // Earned by referring someone who bought Pro (see rewardReferrerForProPurchase).
        // The claim is a compare-and-swap: `set kit_credit = 0 where kit_credit > 0`
        // returns a row only for the caller that actually won it. A read-then-write would
        // let a double-click spend one credit twice.
        const { data: claimed, error: claimErr } = await supabase
            .from('referrals')
            .update({ kit_credit: 0 })
            .eq('user_id', userId)
            .gt('kit_credit', 0)
            .select('user_id');

        if (claimErr) {
            // A broken credit lookup must not block a paying customer — fall through to checkout.
            console.error('kit_credit claim failed, falling back to paid checkout:', claimErr.message);
        } else if (claimed && claimed.length > 0) {
            const { error: grantErr } = await supabase
                .from('template_purchases')
                .insert({
                    user_id: userId,
                    template_id: templateId,
                    stripe_payment_intent_id: null,
                    amount: 0,
                });

            if (grantErr) {
                // The credit is already spent but the kit didn't land. Put it back —
                // silently swallowing someone's earned reward is the worst outcome here.
                await supabase.from('referrals').update({ kit_credit: 1 }).eq('user_id', userId);
                console.error('kit grant failed, credit restored:', grantErr.message);
                return res.status(500).json({ error: 'Could not unlock your kit. Your referral credit is safe — please try again.' });
            }

            return res.json({ granted: true, reason: 'referral_credit' });
        }

        // ── Normal paid checkout ── (priceId already resolved and validated above)
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: userEmail,
            success_url: `${process.env.VITE_REDIRECT_URL}/template-success?template_id=${templateId}`,
            cancel_url: `${process.env.VITE_REDIRECT_URL}/templates`,
            metadata: { userId, templateId, type: 'premium_template' }
        });

        return res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Template checkout error:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleCreatePortalSession({ userId }, res) {
    try {
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single();

        let customerId = subscription?.stripe_customer_id;

        // Fallback: look up customer by userId metadata if stripe_customer_id wasn't stored
        if (!customerId) {
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            const email = userData?.user?.email;
            if (!email) {
                return res.status(404).json({ error: 'No subscription found' });
            }
            const customers = await stripe.customers.list({ email, limit: 1 });
            if (customers.data.length === 0) {
                return res.status(404).json({ error: 'No Stripe customer found for this account' });
            }
            customerId = customers.data[0].id;

            // Backfill so future calls work
            await supabase
                .from('subscriptions')
                .update({ stripe_customer_id: customerId })
                .eq('user_id', userId);
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.VITE_REDIRECT_URL}/dashboard`,
        });

        return res.json({ url: session.url });
    } catch (error) {
        console.error('Portal session error:', error);
        return res.status(500).json({ error: error.message });
    }
}