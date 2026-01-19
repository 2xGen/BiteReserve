import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

// Note: Webhooks need Node.js runtime for proper body parsing
export const runtime = 'nodejs'

// POST - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(supabase, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await handleSubscriptionUpdate(supabase, subscription)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await handlePaymentFailed(supabase, subscription)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle subscription created/updated events
 */
async function handleSubscriptionUpdate(
  supabase: any, // Supabase client type
  subscription: Stripe.Subscription
) {
  try {
    // Find subscription by stripe_subscription_id
    const { data: existingSub, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding subscription:', findError)
      return
    }

    // Map Stripe status to our status
    let status = 'active'
    if (subscription.status === 'trialing') {
      status = 'trialing'
    } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      status = 'past_due'
    } else if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      status = 'canceled'
    } else if (subscription.status === 'active') {
      status = 'active'
    }

    const updateData: any = {
      status,
    }

    // Safely access Stripe subscription properties
    if ('current_period_start' in subscription && typeof subscription.current_period_start === 'number') {
      updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString()
    }
    if ('current_period_end' in subscription && typeof subscription.current_period_end === 'number') {
      updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString()
    }
    if ('trial_end' in subscription && typeof subscription.trial_end === 'number') {
      updateData.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString()
    }
    if ('canceled_at' in subscription && typeof subscription.canceled_at === 'number') {
      updateData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString()
    }

    // If trial ended and subscription is now active, ensure Pro plan limits
    if (subscription.status === 'active' && !subscription.trial_end) {
      updateData.max_campaign_links = null // Unlimited
      updateData.max_actions_per_month = null // Unlimited
      updateData.analytics_retention_days = 90
      updateData.remove_branding = true
      updateData.weekly_email_reports = true
    }

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', subscription.id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
      }
    } else {
      // Try to find by customer ID
      const { data: customerSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', subscription.customer as string)
        .single()

      if (customerSub) {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            ...updateData,
            stripe_subscription_id: subscription.id,
          })
          .eq('id', customerSub.id)

        if (updateError) {
          console.error('Error updating subscription by customer:', updateError)
        }
      }
    }
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(
  supabase: any, // Supabase client type
  subscription: Stripe.Subscription
) {
  try {
    // Downgrade to Free plan
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (existingSub) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          // Free plan limits
          max_restaurants: 1,
          max_campaign_links: 3,
          max_actions_per_month: 25,
          analytics_retention_days: 14,
          remove_branding: false,
          weekly_email_reports: false,
        })
        .eq('stripe_subscription_id', subscription.id)

      if (updateError) {
        console.error('Error downgrading subscription:', updateError)
      }
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(
  supabase: any, // Supabase client type
  subscription: Stripe.Subscription
) {
  try {
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('stripe_subscription_id', subscription.id)

    if (updateError) {
      console.error('Error updating subscription status to past_due:', updateError)
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}
