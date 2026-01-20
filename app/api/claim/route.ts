import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateStripeCustomer, createCheckoutSession } from '@/lib/stripe'
import { sendWelcomeEmail } from '@/lib/resend'

export const runtime = 'edge'

// POST - Process restaurant claim submission
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role for admin operations
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
    const {
      // User info (user must be authenticated)
      email,
      ownerName,
      phone,
      userId: providedUserId, // User ID from authenticated session
      // Restaurant info
      restaurantId, // If claiming existing restaurant
      restaurantName,
      address,
      city,
      country,
      website,
      cuisineTypes,
      bookingPlatforms,
      // Plan selection
      selectedPlan, // 'free', 'pro', or 'business'
      billingCycle, // 'monthly' or 'annual' (only for paid plans)
      // Optional
      howDidYouHear,
      notes
    } = body

    // Validate required fields (minimal for initial claim)
    if (!email || !ownerName || !restaurantName || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurant name, city, country, owner name, and email are required' },
        { status: 400 }
      )
    }

    // User must be authenticated - userId is required
    if (!providedUserId) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to claim a restaurant.' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', providedUserId)
      .single()

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found. Please log in with a valid account.' },
        { status: 404 }
      )
    }

    // Verify email matches (security check)
    if (existingUser.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return NextResponse.json(
        { error: 'Email mismatch. Please use the email address associated with your account.' },
        { status: 403 }
      )
    }

    const userId = providedUserId

    // Update user name if provided and different
    if (ownerName && ownerName !== existingUser.name) {
      await supabase
        .from('users')
        .update({ name: ownerName })
        .eq('id', userId)
    }

    // Handle restaurant claim/creation
    let restaurantIdToLink: string

    if (restaurantId) {
      // Claiming existing restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, is_claimed, user_id')
        .eq('id', restaurantId)
        .single()

      if (restaurantError || !restaurant) {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        )
      }

      if (restaurant.is_claimed && restaurant.user_id !== userId) {
        return NextResponse.json(
          { error: 'This restaurant is already claimed by another user' },
          { status: 409 }
        )
      }

      // Update restaurant with user info
      // Set to pending status - requires manual review before approval
      const updateData: any = {
        user_id: userId,
        is_claimed: false, // Will be set to true when approved
        claim_status: 'pending' // Awaiting manual review
      }

      // Update restaurant name (minimal data for now, full details come after payment)
      if (restaurantName) updateData.name = restaurantName

      const { error: updateError } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', restaurantId)

      if (updateError) {
        console.error('Restaurant update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to claim restaurant' },
          { status: 500 }
        )
      }

      restaurantIdToLink = restaurantId
    } else {
      // Creating new restaurant (not from existing database)
      // Generate slug from restaurant name and city
      const slugBase = `${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      
      // Check for slug conflicts and add number if needed
      let slug = slugBase
      let counter = 1
      while (true) {
        const { data: existing } = await supabase
          .from('restaurants')
          .select('id')
          .eq('slug', slug)
          .single()

        if (!existing) break
        slug = `${slugBase}-${counter}`
        counter++
      }

      // Infer country code from country name (basic mapping)
      const countryCodeMap: Record<string, string> = {
        'united states': 'us', 'usa': 'us', 'us': 'us',
        'united kingdom': 'uk', 'uk': 'uk', 'england': 'uk',
        'spain': 'es', 'españa': 'es',
        'france': 'fr',
        'italy': 'it', 'italia': 'it',
        'germany': 'de', 'deutschland': 'de',
        'netherlands': 'nl', 'holland': 'nl',
        'belgium': 'be', 'belgië': 'be', 'belgique': 'be',
        'portugal': 'pt',
        'greece': 'gr',
        'turkey': 'tr', 'türkiye': 'tr',
        'mexico': 'mx', 'méxico': 'mx',
        'canada': 'ca',
        'australia': 'au',
        // Add more as needed
      }
      
      const countryLower = country.toLowerCase().trim()
      const countryCode = countryCodeMap[countryLower] || 'us' // Default to US if not found

      // Get next restaurant number for this country
      const { data: nextNumberData, error: numberError } = await supabase
        .rpc('get_next_restaurant_number', { p_country_code: countryCode })

      const restaurantNumber = numberError ? '00001' : nextNumberData

      const { data: newRestaurant, error: createError } = await supabase
        .from('restaurants')
        .insert({
          user_id: userId,
          slug,
          name: restaurantName,
          country_code: countryCode,
          restaurant_number: restaurantNumber,
          is_claimed: false, // Will be set to true when approved
          is_active: true,
          claim_status: 'pending' // Awaiting manual review
          // Address, website, cuisine, etc. will be added in completion form
        })
        .select('id')
        .single()

      if (createError || !newRestaurant) {
        console.error('Restaurant creation error:', createError)
        return NextResponse.json(
          { error: 'Failed to create restaurant' },
          { status: 500 }
        )
      }

      restaurantIdToLink = newRestaurant.id
    }

    // Create or update subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    // Determine initial status based on plan
    // For Pro/Business: set to "pending" until restaurant is verified (trial starts after verification)
    // For Free: set to "active" immediately
    const initialStatus = (selectedPlan === 'pro' || selectedPlan === 'business') ? 'pending' : 'active'

    let subscriptionData: any = {
      user_id: userId,
      plan: selectedPlan === 'pro' ? 'pro' : selectedPlan === 'business' ? 'business' : 'free',
      status: initialStatus
    }

    // Set plan limits based on plan type
    if (selectedPlan === 'business') {
      // Business plan: up to 15 restaurants, unlimited everything else, 365 days analytics
      subscriptionData.max_restaurants = 15
      subscriptionData.max_campaign_links = null // Unlimited
      subscriptionData.max_actions_per_month = null // Unlimited
      subscriptionData.analytics_retention_days = 365
      subscriptionData.remove_branding = true
      subscriptionData.weekly_email_reports = true
      
      // Don't set trial_ends_at yet - trial starts after verification
      // This will be set when the restaurant is approved
    } else if (selectedPlan === 'pro') {
      // Pro plan: up to 3 restaurants, unlimited actions, unlimited links, 90 days analytics
      subscriptionData.max_restaurants = 3
      subscriptionData.max_campaign_links = null // Unlimited
      subscriptionData.max_actions_per_month = null // Unlimited
      subscriptionData.analytics_retention_days = 90
      subscriptionData.remove_branding = true
      subscriptionData.weekly_email_reports = true
      
      // Don't set trial_ends_at yet - trial starts after verification
      // This will be set when the restaurant is approved
    } else {
      // Free plan: 25 actions, 3 links, 14 days analytics
      subscriptionData.max_restaurants = 1
      subscriptionData.max_campaign_links = 3
      subscriptionData.max_actions_per_month = 25
      subscriptionData.analytics_retention_days = 14
      subscriptionData.remove_branding = false
      subscriptionData.weekly_email_reports = false
    }

    if (existingSubscription) {
      // Update existing subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id)

      if (subError) {
        console.error('Subscription update error:', subError)
        // Don't fail the claim if subscription update fails
      }
    } else {
      // Create new subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)

      if (subError) {
        console.error('Subscription creation error:', subError)
        // Don't fail the claim if subscription creation fails
      }
    }

    // Stripe Integration for Pro and Business plans
    // For paid plans, create Stripe Checkout Session and redirect to payment
    if ((selectedPlan === 'pro' || selectedPlan === 'business') && process.env.STRIPE_SECRET_KEY) {
      try {
        // Get Stripe price ID based on plan and billing cycle
        const isAnnual = billingCycle === 'annual'
        const priceId = selectedPlan === 'business'
          ? (isAnnual 
              ? process.env.STRIPE_PRICE_ID_BUSINESS_ANNUAL 
              : process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY)
          : (isAnnual
              ? process.env.STRIPE_PRICE_ID_PRO_ANNUAL
              : process.env.STRIPE_PRICE_ID_PRO_MONTHLY)

        if (priceId) {
          // Create or get Stripe customer
          const customerId = await getOrCreateStripeCustomer(
            email.toLowerCase().trim(),
            ownerName,
            userId
          )

          // Update subscription with Stripe customer ID BEFORE creating checkout session
          // This ensures we can link the subscription when webhook arrives
          const { error: customerUpdateError } = await supabase
            .from('subscriptions')
            .update({
              stripe_customer_id: customerId,
            })
            .eq('user_id', userId)

          if (customerUpdateError) {
            console.error('Error updating subscription with Stripe customer ID:', customerUpdateError)
          }

          // Build success and cancel URLs
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
          const successUrl = `${baseUrl}/claim/complete?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&restaurant_id=${restaurantIdToLink}`
          const cancelUrl = `${baseUrl}/claim?canceled=true`

          // Create Stripe Checkout Session (redirects to payment)
          // Subscription status remains "pending" until webhook confirms payment
          // Set 30-day trial in Stripe to account for verification time
          // Actual 14-day trial starts when restaurant is approved (handled in approve endpoint)
          const checkoutSession = await createCheckoutSession(
            customerId,
            priceId,
            userId,
            successUrl,
            cancelUrl,
            30 // 30-day buffer in Stripe, actual 14-day trial starts after approval
          )

          // Return checkout URL to redirect user to Stripe
          // Webhook will update subscription status from "pending" to "trialing" when checkout completes
          return NextResponse.json({
            success: true,
            checkoutUrl: checkoutSession.url,
            userId,
            restaurantId: restaurantIdToLink,
            plan: selectedPlan,
            requiresPayment: true,
            message: 'Please complete payment to start your trial'
          })
        } else {
          console.warn('STRIPE_PRICE_ID_PRO_MONTHLY not set - skipping Stripe checkout creation')
        }
      } catch (stripeError) {
        // Log error but don't fail the claim - subscription is created in DB with "pending" status
        console.error('Stripe integration error (claim still succeeded):', stripeError)
      }
    } else if ((selectedPlan === 'pro' || selectedPlan === 'business') && !process.env.STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured - Pro plan subscription created in DB only (no Stripe)')
    }

    // Send welcome email (only for Free plan, Pro/Business will get email after checkout)
    if (selectedPlan === 'free') {
      try {
        await sendWelcomeEmail(email, ownerName, restaurantName, selectedPlan)
      } catch (emailError) {
        // Don't fail the claim if email fails
        console.error('Error sending welcome email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      restaurantId: restaurantIdToLink,
      plan: selectedPlan,
      requiresPayment: false,
      message: 'Your restaurant has been claimed successfully!'
    })
  } catch (error) {
    console.error('Claim submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process claim submission', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
