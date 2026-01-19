import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateStripeCustomer, createProSubscription } from '@/lib/stripe'

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
      // User info
      email,
      ownerName,
      phone,
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
      selectedPlan, // 'free' or 'pro'
      // Optional
      howDidYouHear,
      notes
    } = body

    // Validate required fields
    if (!email || !ownerName || !restaurantName || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists (by email)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    let userId: string

    if (existingUser) {
      // User exists, use their ID
      userId = existingUser.id
      
      // Update user name if provided
      if (ownerName) {
        await supabase
          .from('users')
          .update({ name: ownerName })
          .eq('id', userId)
      }
    } else {
      // Create new user in Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        email_confirm: true, // Auto-confirm email for now
        user_metadata: {
          name: ownerName
        }
      })

      if (authError || !authData.user) {
        console.error('Auth user creation error:', authError)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }

      // Create user record in public.users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase().trim(),
          name: ownerName
        })

      if (userError) {
        console.error('User creation error:', userError)
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        )
      }

      userId = authData.user.id
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
      const updateData: any = {
        user_id: userId,
        is_claimed: true
      }

      // Update restaurant details if provided
      if (restaurantName) updateData.name = restaurantName
      if (address) updateData.address = address
      if (website) updateData.website = website
      if (cuisineTypes && cuisineTypes.length > 0) updateData.cuisine = cuisineTypes
      if (bookingPlatforms && bookingPlatforms.length > 0) {
        // Store first booking platform
        updateData.booking_platform = bookingPlatforms[0]
      }

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
          address: address || null,
          website: website || null,
          cuisine: cuisineTypes && cuisineTypes.length > 0 ? cuisineTypes : null,
          booking_platform: bookingPlatforms && bookingPlatforms.length > 0 ? bookingPlatforms[0] : null,
          country_code: countryCode,
          restaurant_number: restaurantNumber,
          is_claimed: true,
          is_active: true
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

    let subscriptionData: any = {
      user_id: userId,
      plan: selectedPlan === 'pro' ? 'pro' : 'free',
      status: selectedPlan === 'pro' ? 'trialing' : 'active'
    }

    // Set plan limits based on plan type
    if (selectedPlan === 'pro') {
      // Pro plan: unlimited actions, unlimited links, 90 days analytics
      subscriptionData.max_restaurants = 1 // Can be increased for business plan later
      subscriptionData.max_campaign_links = null // Unlimited
      subscriptionData.max_actions_per_month = null // Unlimited
      subscriptionData.analytics_retention_days = 90
      subscriptionData.remove_branding = true
      subscriptionData.weekly_email_reports = true
      
      // Set trial end date (14 days from now)
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 14)
      subscriptionData.trial_ends_at = trialEndDate.toISOString()
      subscriptionData.current_period_end = trialEndDate.toISOString()
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

    // Stripe Integration for Pro plan
    if (selectedPlan === 'pro' && process.env.STRIPE_SECRET_KEY) {
      try {
        // Get Stripe price ID (monthly by default)
        const priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY

        if (priceId) {
          // Create or get Stripe customer
          const customerId = await getOrCreateStripeCustomer(
            email.toLowerCase().trim(),
            ownerName,
            userId
          )

          // Create subscription with 14-day trial
          const stripeSubscription = await createProSubscription(customerId, priceId, 14)

          // Update subscription with Stripe IDs
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

          const { error: stripeUpdateError } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('user_id', userId)

          if (stripeUpdateError) {
            console.error('Error updating subscription with Stripe IDs:', stripeUpdateError)
            // Don't fail - subscription is created in Stripe
          }
        } else {
          console.warn('STRIPE_PRICE_ID_PRO_MONTHLY not set - skipping Stripe subscription creation')
        }
      } catch (stripeError) {
        // Log error but don't fail the claim - subscription is created in DB
        console.error('Stripe integration error (claim still succeeded):', stripeError)
      }
    } else if (selectedPlan === 'pro' && !process.env.STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured - Pro plan subscription created in DB only (no Stripe)')
    }

    // TODO: Send confirmation email via Resend
    // This will be implemented when Resend is set up
    // await sendClaimConfirmationEmail(email, ownerName, restaurantName, selectedPlan)

    return NextResponse.json({
      success: true,
      userId,
      restaurantId: restaurantIdToLink,
      plan: selectedPlan,
      message: selectedPlan === 'pro' 
        ? 'Your restaurant has been claimed and your 14-day Pro trial has started!'
        : 'Your restaurant has been claimed successfully!'
    })
  } catch (error) {
    console.error('Claim submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process claim submission', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
