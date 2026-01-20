import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// POST - Add a new restaurant for existing subscribers (no payment required)
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
    const {
      userId,
      restaurantId, // If claiming existing restaurant
      restaurantName,
      city,
      country,
    } = body

    // Validate required fields
    if (!userId || !restaurantName || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurant name, city, and country are required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single()

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found. Please log in with a valid account.' },
        { status: 404 }
      )
    }

    // Check user's subscription and restaurant count
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, plan, status, max_restaurants')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError)
    }

    const activeSubscription = subscriptions && subscriptions.length > 0 
      ? subscriptions[0] 
      : null

    // Check restaurant count
    const { data: userRestaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('user_id', userId)

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError)
    }

    const restaurantCount = userRestaurants?.length || 0
    const maxRestaurants = activeSubscription?.max_restaurants || 1

    if (restaurantCount >= maxRestaurants) {
      return NextResponse.json(
        { 
          error: `You have reached your plan limit of ${maxRestaurants} restaurant${maxRestaurants > 1 ? 's' : ''}. Please upgrade your plan to add more restaurants.` 
        },
        { status: 403 }
      )
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
        is_claimed: false, // Will be set to true when approved
        claim_status: 'pending' // Awaiting manual review
      }

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
      // Creating new restaurant
      const slugBase = `${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      
      // Check for slug conflicts
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

      // Infer country code from country name
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
      }
      
      const countryLower = country.toLowerCase().trim()
      const countryCode = countryCodeMap[countryLower] || 'us'

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

    // Send admin notification
    try {
      const { sendAdminNotification } = await import('@/lib/resend')
      await sendAdminNotification(
        'New Restaurant Claim (Additional)',
        `A user has added an additional restaurant:\n\nUser: ${existingUser.name || 'N/A'} (${existingUser.email})\nRestaurant: ${restaurantName}\nCity: ${city}\nCountry: ${country}\nPlan: ${activeSubscription?.plan || 'free'}\nStatus: Pending verification`,
        {
          userId,
          userEmail: existingUser.email,
          userName: existingUser.name,
          restaurantName,
          city,
          country,
          plan: activeSubscription?.plan || 'free',
          restaurantId: restaurantIdToLink,
          timestamp: new Date().toISOString(),
        }
      )
    } catch (adminEmailError) {
      // Don't fail if admin notification fails
      console.error('Error sending admin notification:', adminEmailError)
    }

    return NextResponse.json({
      success: true,
      restaurantId: restaurantIdToLink,
      message: 'Restaurant added successfully. Please complete the details form.'
    })
  } catch (error) {
    console.error('Add restaurant error:', error)
    return NextResponse.json(
      { error: 'Failed to add restaurant' },
      { status: 500 }
    )
  }
}
