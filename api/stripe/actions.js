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
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.VITE_REDIRECT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.VITE_REDIRECT_URL}`,
            metadata: { userId }
        });

        console.log('Checkout session created:', session.id);
        return res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Checkout session error:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleCreateTemplateCheckout({ priceId, templateId, userId, userEmail }, res) {
    try {
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

        if (!subscription?.stripe_customer_id) {
            return res.status(404).json({ error: 'No subscription found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${process.env.VITE_REDIRECT_URL}/settings`,
        });

        return res.json({ url: session.url });
    } catch (error) {
        console.error('Portal session error:', error);
        return res.status(500).json({ error: error.message });
    }
}