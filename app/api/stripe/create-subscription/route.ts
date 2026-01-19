import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateStripeCustomer, createProSubscription } from '@/lib/stripe'

export const runtime = 'edge'

// POST - Create a Stripe subscription (typically called from claim page for Pro trial)
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

    const body = await request.json()
    const { userId, email, name, plan = 'pro', billingCycle = 'monthly' } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and email' },
        { status: 400 }
      )
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    // If subscription already has Stripe IDs, don't create again
    if (subscription?.stripe_customer_id && subscription?.stripe_subscription_id) {
      return NextResponse.json({
        success: true,
        message: 'Subscription already exists',
        customerId: subscription.stripe_customer_id,
        subscriptionId: subscription.stripe_subscription_id,
      })
    }

    // Get Stripe price ID based on plan and billing cycle
    // For now, we'll need to create products in Stripe Dashboard first
    // Or use environment variables
    const priceId = billingCycle === 'annual' 
      ? process.env.STRIPE_PRICE_ID_PRO_ANNUAL 
      : process.env.STRIPE_PRICE_ID_PRO_MONTHLY

    if (!priceId) {
      console.error('Stripe price ID not configured')
      return NextResponse.json(
        { error: 'Stripe pricing not configured. Please set STRIPE_PRICE_ID_PRO_MONTHLY and STRIPE_PRICE_ID_PRO_ANNUAL in environment variables.' },
        { status: 500 }
      )
    }

    // Create or get Stripe customer
    const customerId = await getOrCreateStripeCustomer(email, name, userId)

    // Create subscription with 14-day trial
    const stripeSubscription = await createProSubscription(customerId, priceId, 14)

    // Update subscription in database
    const updateData: any = {
      stripe_customer_id: customerId,
      stripe_subscription_id: stripeSubscription.id,
    }

    // Safely access Stripe subscription properties
    if ('current_period_start' in stripeSubscription && typeof stripeSubscription.current_period_start === 'number') {
      updateData.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString()
    }
    if ('current_period_end' in stripeSubscription && typeof stripeSubscription.current_period_end === 'number') {
      updateData.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString()
    }
    if ('trial_end' in stripeSubscription && typeof stripeSubscription.trial_end === 'number') {
      updateData.trial_ends_at = new Date(stripeSubscription.trial_end * 1000).toISOString()
    }

    if (subscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        // Don't fail - Stripe subscription is created
      }
    } else {
      // Create new subscription record
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: 'pro',
          status: 'trialing',
          ...updateData,
          max_restaurants: 1,
          max_campaign_links: null, // Unlimited
          max_actions_per_month: null, // Unlimited
          analytics_retention_days: 90,
          remove_branding: true,
          weekly_email_reports: true,
        })

      if (insertError) {
        console.error('Error creating subscription record:', insertError)
        // Don't fail - Stripe subscription is created
      }
    }

    return NextResponse.json({
      success: true,
      customerId,
      subscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      trialEnd: stripeSubscription.trial_end 
        ? new Date(stripeSubscription.trial_end * 1000).toISOString()
        : null,
    })
  } catch (error) {
    console.error('Stripe subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
