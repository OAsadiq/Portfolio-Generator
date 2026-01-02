import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Disable body parsing, need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdate(event.data.object);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutCompleted(session) {
  const { customer, subscription, metadata } = session;

  if (session.mode === 'subscription') {
    // Handle Pro subscription
    const { data: subscriptionData } = await stripe.subscriptions.retrieve(subscription);

    await supabase.from('subscriptions').upsert({
      user_id: metadata.userId,
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      status: subscriptionData.status,
      plan: 'pro',
      current_period_start: new Date(subscriptionData.current_period_start * 1000),
      current_period_end: new Date(subscriptionData.current_period_end * 1000),
      updated_at: new Date()
    });
  } else if (metadata.type === 'premium_template') {
    // Handle premium template purchase
    await supabase.from('template_purchases').insert({
      user_id: metadata.userId,
      template_id: metadata.templateId,
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total
    });
  }
}

async function handleSubscriptionUpdate(subscription) {
  await supabase.from('subscriptions').update({
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    updated_at: new Date()
  }).eq('stripe_subscription_id', subscription.id);
}

async function handleInvoicePaid(invoice) {
  // Subscription renewed successfully
  await supabase.from('subscriptions').update({
    status: 'active',
    updated_at: new Date()
  }).eq('stripe_customer_id', invoice.customer);
}

async function handlePaymentFailed(invoice) {
  // Payment failed - handle gracefully
  await supabase.from('subscriptions').update({
    status: 'past_due',
    updated_at: new Date()
  }).eq('stripe_customer_id', invoice.customer);
  
  // TODO: Send email notification to user
}