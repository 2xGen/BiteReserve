import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createCustomerPortalSession } from '@/lib/stripe'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Get user's subscription to find Stripe customer ID
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (error || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Create Customer Portal session
    // Get base URL from environment variable, request origin, or default to production
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!baseUrl) {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      if (origin) {
        baseUrl = origin
      } else if (host) {
        // Use https for production, http for localhost
        baseUrl = host.includes('localhost') ? `http://${host}` : `https://${host}`
      } else {
        // Fallback to production URL
        baseUrl = 'https://bitereserve.com'
      }
    }
    const returnUrl = `${baseUrl}/dashboard/subscription`

    const session = await createCustomerPortalSession(
      subscription.stripe_customer_id,
      returnUrl
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Customer Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create Customer Portal session' },
      { status: 500 }
    )
  }
}
