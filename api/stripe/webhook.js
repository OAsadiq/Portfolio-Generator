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
  console.log('🔔 Webhook received');
  
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
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
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  try {
    console.log('📦 Processing event:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Checkout completed');
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        console.log('🔄 Subscription updated');
        await handleSubscriptionUpdate(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        console.log('🗑️ Subscription deleted');
        await handleSubscriptionUpdate(event.data.object);
        break;
        
      case 'invoice.paid':
        console.log('💰 Invoice paid');
        await handleInvoicePaid(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        console.log('⚠️ Payment failed');
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log('✅ Event processed successfully');
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      event: event.type
    });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

// Helper function to calculate period end based on interval
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
  console.log('📝 Processing checkout session:', session.id);
  const { customer, subscription, metadata, mode } = session;

  if (mode === 'subscription') {
    console.log('💳 Handling subscription checkout');
    console.log('Customer ID:', customer);
    console.log('Subscription ID:', subscription);
    console.log('Metadata:', metadata);

    try {
      // Get full subscription details from Stripe
      const subscriptionData = await stripe.subscriptions.retrieve(subscription, {
        expand: ['latest_invoice', 'default_payment_method']
      });
      
      console.log('📊 Raw subscription data fields:', {
        id: subscriptionData.id,
        status: subscriptionData.status,
        start_date: subscriptionData.start_date,
        billing_cycle_anchor: subscriptionData.billing_cycle_anchor,
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        plan_interval: subscriptionData.plan?.interval,
        plan_interval_count: subscriptionData.plan?.interval_count
      });

      // Determine period start and end
      let periodStart, periodEnd;
      
      if (subscriptionData.current_period_start && subscriptionData.current_period_end) {
        // Use the fields if they exist
        periodStart = subscriptionData.current_period_start;
        periodEnd = subscriptionData.current_period_end;
      } else if (subscriptionData.start_date && subscriptionData.plan) {
        // Calculate from start_date and plan interval
        periodStart = subscriptionData.start_date;
        const endDate = calculatePeriodEnd(
          subscriptionData.start_date,
          subscriptionData.plan.interval,
          subscriptionData.plan.interval_count
        );
        periodEnd = Math.floor(endDate.getTime() / 1000);
      } else if (subscriptionData.billing_cycle_anchor && subscriptionData.plan) {
        // Fallback to billing_cycle_anchor
        periodStart = subscriptionData.billing_cycle_anchor;
        const endDate = calculatePeriodEnd(
          subscriptionData.billing_cycle_anchor,
          subscriptionData.plan.interval,
          subscriptionData.plan.interval_count
        );
        periodEnd = Math.floor(endDate.getTime() / 1000);
      } else {
        console.error('❌ Cannot determine period dates from subscription data');
        throw new Error('Invalid subscription data: cannot determine period dates');
      }

      console.log('📅 Calculated period dates:', {
        periodStart,
        periodEnd,
        periodStartDate: new Date(periodStart * 1000).toISOString(),
        periodEndDate: new Date(periodEnd * 1000).toISOString()
      });

      // Prepare data for Supabase
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

      console.log('💾 Upserting to Supabase:', subscriptionRecord);

      // Upsert to Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionRecord, {
          onConflict: 'stripe_subscription_id'
        })
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Subscription saved to Supabase:', data);
    } catch (err) {
      console.error('❌ Error in handleCheckoutCompleted:', err);
      throw err;
    }
  } else if (metadata?.type === 'premium_template') {
    console.log('🎨 Handling template purchase');
    
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
        console.error('❌ Template purchase error:', error);
        throw error;
      }

      console.log('✅ Template purchase saved:', data);
    } catch (err) {
      console.error('❌ Error saving template purchase:', err);
      throw err;
    }
  }
}

async function handleSubscriptionUpdate(subscription) {
  console.log('🔄 Updating subscription:', subscription.id);
  
  try {
    // Determine period start and end
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
      console.error('❌ Cannot determine period dates');
      throw new Error('Invalid subscription data: cannot determine period dates');
    }

    const updateData = {
      status: subscription.status,
      current_period_start: new Date(periodStart * 1000).toISOString(),
      current_period_end: new Date(periodEnd * 1000).toISOString(),
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    };

    console.log('💾 Updating with data:', updateData);

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id)
      .select();

    if (error) {
      console.error('❌ Update error:', error);
      throw error;
    }

    console.log('✅ Subscription updated:', data);
  } catch (err) {
    console.error('❌ Error in handleSubscriptionUpdate:', err);
    throw err;
  }
}

async function handleInvoicePaid(invoice) {
  console.log('💰 Processing paid invoice:', invoice.id);
  
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
      console.error('❌ Invoice update error:', error);
      throw error;
    }

    console.log('✅ Invoice processed:', data);
  } catch (err) {
    console.error('❌ Error in handleInvoicePaid:', err);
    throw err;
  }
}

async function handlePaymentFailed(invoice) {
  console.log('⚠️ Processing failed payment:', invoice.id);
  
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
      console.error('❌ Payment failed update error:', error);
      throw error;
    }

    console.log('⚠️ Subscription marked past_due:', data);
    
    // TODO: Send email notification to user
  } catch (err) {
    console.error('❌ Error in handlePaymentFailed:', err);
    throw err;
  }
}