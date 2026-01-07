import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

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
  console.log('🔔 Webhook received');

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
    console.log(event.type);
  } catch (err) {
    console.error(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

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
        console.log(`${event.type}`);
    }

    console.log('✅ Event processed successfully');
    res.json({ received: true });
  } catch (error) {
    console.error(error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      event: event.type
    });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

function calculatePeriodEnd(startTimestamp, interval, intervalCount) {
  const startDate = new Date(startTimestamp * 1000);
  const endDate = new Date(startDate);

  switch (interval) {
    case 'day':
      endDate.setDate(endDate.getDate() + intervalCount);
      break;
    case 'week':
      endDate.setDate(endDate.getDate() + (intervalCount * 7));
      break;
    case 'month':
      endDate.setMonth(endDate.getMonth() + intervalCount);
      break;
    case 'year':
      endDate.setFullYear(endDate.getFullYear() + intervalCount);
      break;
  }

  return endDate;
}

async function handleCheckoutCompleted(session) {
  const { customer, subscription, metadata, mode } = session;

  if (mode === 'subscription') {

    try {
      const subscriptionData = await stripe.subscriptions.retrieve(subscription, {
        expand: ['latest_invoice', 'default_payment_method']
      });

      let periodStart, periodEnd;

      if (subscriptionData.current_period_start && subscriptionData.current_period_end) {
        periodStart = subscriptionData.current_period_start;
        periodEnd = subscriptionData.current_period_end;
      } else if (subscriptionData.start_date && subscriptionData.plan) {
        periodStart = subscriptionData.start_date;
        const endDate = calculatePeriodEnd(
          subscriptionData.start_date,
          subscriptionData.plan.interval,
          subscriptionData.plan.interval_count
        );
        periodEnd = Math.floor(endDate.getTime() / 1000);
      } else if (subscriptionData.billing_cycle_anchor && subscriptionData.plan) {
        periodStart = subscriptionData.billing_cycle_anchor;
        const endDate = calculatePeriodEnd(
          subscriptionData.billing_cycle_anchor,
          subscriptionData.plan.interval,
          subscriptionData.plan.interval_count
        );
        periodEnd = Math.floor(endDate.getTime() / 1000);
      } else {
        throw new Error('Invalid subscription data: cannot determine period dates');
      }

      const subscriptionRecord = {
        user_id: metadata.userId,
        stripe_customer_id: customer,
        stripe_subscription_id: subscription,
        status: subscriptionData.status,
        plan: 'pro',
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionRecord, {
          onConflict: 'stripe_subscription_id'
        })
        .select();

      if (error) {
        throw error;
      }

    } catch (err) {
      throw err;
    }
  } else if (metadata?.type === 'premium_template') {

    try {
      const { data, error } = await supabase
        .from('template_purchases')
        .insert({
          user_id: metadata.userId,
          template_id: metadata.templateId,
          stripe_payment_intent_id: session.payment_intent,
          amount: session.amount_total
        })
        .select();

      if (error) {
        throw error;
      }

    } catch (err) {
      throw err;
    }
  }
}

async function handleSubscriptionUpdate(subscription) {

  try {
    let periodStart, periodEnd;

    if (subscription.current_period_start && subscription.current_period_end) {
      periodStart = subscription.current_period_start;
      periodEnd = subscription.current_period_end;
    } else if (subscription.start_date && subscription.plan) {
      periodStart = subscription.start_date;
      const endDate = calculatePeriodEnd(
        subscription.start_date,
        subscription.plan.interval,
        subscription.plan.interval_count
      );
      periodEnd = Math.floor(endDate.getTime() / 1000);
    } else {
      throw new Error('Invalid subscription data: cannot determine period dates');
    }

    const updateData = {
      status: subscription.status,
      current_period_start: new Date(periodStart * 1000).toISOString(),
      current_period_end: new Date(periodEnd * 1000).toISOString(),
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id)
      .select();

    if (error) {
      throw error;
    }

  } catch (err) {
    throw err;
  }
}

async function handleInvoicePaid(invoice) {

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', invoice.customer)
      .select();

    if (error) {
      throw error;
    }

  } catch (err) {
    throw err;
  }
}

async function handlePaymentFailed(invoice) {

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', invoice.customer)
      .select();

    if (error) {
      throw error;
    }

    // TODO: Send email notification to user
  } catch (err) {
    throw err;
  }
}