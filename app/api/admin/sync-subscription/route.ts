import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const runtime = 'edge'

/**
 * Admin endpoint to manually sync a subscription from Stripe
 * This is useful when webhooks fail or subscriptions get stuck in "pending"
 * 
 * Usage: POST /api/admin/sync-subscription
 * Body: { customerId: string } or { subscriptionId: string } or { userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Basic auth check - in production, add proper authentication
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY || 'dev-key'}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

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
    const { customerId, subscriptionId, userId } = body

    let stripeSubscription: any = null
    let customerIdToUse: string | null = null

    // Find the Stripe subscription
    if (subscriptionId) {
      // Direct lookup by subscription ID
      stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
      customerIdToUse = typeof stripeSubscription.customer === 'string' 
        ? stripeSubscription.customer 
        : stripeSubscription.customer.id
    } else if (customerId) {
      // Look up by customer ID
      customerIdToUse = customerId
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: 'all',
      })
      if (subscriptions.data.length > 0) {
        stripeSubscription = subscriptions.data[0]
      }
    } else if (userId) {
      // Look up by user ID - get customer ID from database first
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (subscription?.stripe_customer_id) {
        customerIdToUse = subscription.stripe_customer_id
        const subscriptions = await stripe.subscriptions.list({
          customer: customerIdToUse || undefined,
          limit: 1,
          status: 'all',
        })
        if (subscriptions.data.length > 0) {
          stripeSubscription = subscriptions.data[0]
        }
      }
    }

    if (!stripeSubscription) {
      return NextResponse.json(
        { error: 'No Stripe subscription found' },
        { status: 404 }
      )
    }

    // Find the database subscription
    const { data: dbSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_customer_id', customerIdToUse)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!dbSubscription) {
      return NextResponse.json(
        { error: 'No pending subscription found in database' },
        { status: 404 }
      )
    }

    // Map Stripe status to our status
    let status = 'active'
    if (stripeSubscription.status === 'trialing') {
      status = 'trialing'
    } else if (stripeSubscription.status === 'past_due' || stripeSubscription.status === 'unpaid') {
      status = 'past_due'
    } else if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'incomplete_expired') {
      status = 'canceled'
    } else if (stripeSubscription.status === 'active') {
      status = 'active'
    }

    // Determine plan from price ID
    const priceId = stripeSubscription.items.data[0]?.price?.id
    const proMonthlyPriceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY
    const proAnnualPriceId = process.env.STRIPE_PRICE_ID_PRO_ANNUAL
    const businessMonthlyPriceId = process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY
    const businessAnnualPriceId = process.env.STRIPE_PRICE_ID_BUSINESS_ANNUAL

    const updateData: any = {
      status,
      stripe_subscription_id: stripeSubscription.id,
    }

    if (priceId === businessMonthlyPriceId || priceId === businessAnnualPriceId) {
      updateData.plan = 'business'
      updateData.max_restaurants = 15
      updateData.max_campaign_links = null
      updateData.max_actions_per_month = null
      updateData.analytics_retention_days = 365
      updateData.remove_branding = true
      updateData.weekly_email_reports = true
    } else if (priceId === proMonthlyPriceId || priceId === proAnnualPriceId) {
      updateData.plan = 'pro'
      updateData.max_restaurants = 3
      updateData.max_campaign_links = null
      updateData.max_actions_per_month = null
      updateData.analytics_retention_days = 90
      updateData.remove_branding = true
      updateData.weekly_email_reports = true
    }

    // Update dates
    if (stripeSubscription.current_period_start) {
      updateData.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString()
    }
    if (stripeSubscription.current_period_end) {
      updateData.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString()
    }
    if (stripeSubscription.trial_end) {
      updateData.trial_ends_at = new Date(stripeSubscription.trial_end * 1000).toISOString()
    }
    if (stripeSubscription.canceled_at) {
      updateData.canceled_at = new Date(stripeSubscription.canceled_at * 1000).toISOString()
    }

    // Update the subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', dbSubscription.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update subscription', details: updateError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      subscription: {
        id: dbSubscription.id,
        status: updateData.status,
        plan: updateData.plan,
        stripe_subscription_id: updateData.stripe_subscription_id,
      }
    })
  } catch (error) {
    console.error('Sync subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
