import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// GET - Get subscription status for a user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Get subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          plan: 'free',
          status: 'active',
          hasSubscription: false,
        })
      }
      console.error('Error fetching subscription:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        hasSubscription: false,
      })
    }

    // Check if trial has ended
    const now = new Date()
    const trialEnd = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null
    const isTrialExpired = trialEnd && now > trialEnd

    // If trial expired and status is still 'trialing', update to 'active' (paid) or 'canceled' (downgraded)
    if (isTrialExpired && subscription.status === 'trialing') {
      // If they have a Stripe subscription, it should be active (paid)
      // If not, they were downgraded to Free
      if (subscription.stripe_subscription_id) {
        // Stripe webhook should have updated this, but handle edge case
        return NextResponse.json({
          plan: subscription.plan,
          status: 'active', // Assumed paid if Stripe subscription exists
          hasSubscription: true,
          trialEnded: true,
          ...subscription,
        })
      } else {
        // No Stripe subscription = downgraded to Free
        return NextResponse.json({
          plan: 'free',
          status: 'active',
          hasSubscription: false,
          trialEnded: true,
        })
      }
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      hasSubscription: true,
      trialEnd: subscription.trial_ends_at,
      currentPeriodEnd: subscription.current_period_end,
      ...subscription,
    }, {
      headers: {
        // Cache for 2 minutes - subscriptions don't change frequently
        'Cache-Control': 's-maxage=120, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
