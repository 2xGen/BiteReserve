import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// GET - Fetch pending claims for admin review
// TODO: Add proper admin authentication in production
export async function GET(request: NextRequest) {
  try {
    // For MVP, we'll allow any authenticated user to access
    // In production, add proper admin role checking

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
    const status = searchParams.get('status') || 'pending'

    // Build query - try to include claim_status if column exists
    // Only show restaurants that have been claimed by users (have user_id)
    let query = supabase
      .from('restaurants')
      .select(`
        id,
        name,
        tagline,
        address,
        website,
        phone,
        cuisine,
        features,
        description,
        price_level,
        hours,
        booking_platform,
        created_at,
        user_id,
        country_code,
        restaurant_number,
        claim_status
      `)
      .not('user_id', 'is', null) // Only restaurants claimed by users
      .order('created_at', { ascending: false })

    // Filter by status if needed
    if (status === 'pending') {
      query = query.or('claim_status.eq.pending,claim_status.is.null')
    }

    let { data: restaurantsData, error } = await query
    
    // If error is due to claim_status column not existing, retry without it
    if (error && error.message && (error.message.includes('claim_status') || error.message.includes('column') || error.code === '42703')) {
      console.log('claim_status column may not exist, fetching without it')
      const fallbackQuery = supabase
        .from('restaurants')
        .select(`
          id,
          name,
          tagline,
          address,
          website,
          phone,
          cuisine,
          features,
          description,
          price_level,
          hours,
          booking_platform,
          created_at,
          user_id,
          country_code,
          restaurant_number
        `)
        .not('user_id', 'is', null)
        .order('created_at', { ascending: false })
      
      const fallbackResult = await fallbackQuery
      if (fallbackResult.error) {
        console.error('Error fetching claims (fallback):', fallbackResult.error)
        return NextResponse.json(
          { error: 'Failed to fetch claims' },
          { status: 500 }
        )
      }
      // Set claim_status to null for all if column doesn't exist
      restaurantsData = (fallbackResult.data || []).map((r: any) => ({
        ...r,
        claim_status: null
      }))
      error = null
    }
    
    if (error) {
      console.error('Error fetching claims:', error)
      return NextResponse.json(
        { error: 'Failed to fetch claims' },
        { status: 500 }
      )
    }
    
    // Add google_business_profile as null (column may not exist)
    const restaurantsWithStatus = (restaurantsData || []).map((r: any) => ({
      ...r,
      google_business_profile: r.google_business_profile || null
    }))
    
    // Filter by status if needed (for pending, show null or 'pending')
    const filteredRestaurants = status === 'pending' 
      ? restaurantsWithStatus.filter((r: any) => r.claim_status === 'pending' || r.claim_status === null)
      : restaurantsWithStatus

    // Fetch user info for each restaurant
    const claimsWithUsers = await Promise.all(
      (filteredRestaurants || []).map(async (restaurant: any) => {
        let userEmail = null
        let userName = null

        if (restaurant.user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('email, name')
            .eq('id', restaurant.user_id)
            .single()

          if (userData) {
            userEmail = userData.email
            userName = userData.name
          }
        }

        // Get user's subscription plan
        let userPlan = 'free'
        if (restaurant.user_id) {
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('plan')
            .eq('user_id', restaurant.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          if (subscriptionData) {
            userPlan = subscriptionData.plan
          }
        }

        return {
          id: restaurant.id,
          name: restaurant.name,
          tagline: restaurant.tagline,
          address: restaurant.address,
          website: restaurant.website,
          phone: restaurant.phone,
          cuisine: restaurant.cuisine,
          features: restaurant.features,
          description: restaurant.description,
          price_level: restaurant.price_level,
          hours: restaurant.hours,
          google_business_profile: restaurant.google_business_profile,
          booking_platform: restaurant.booking_platform,
          claim_status: restaurant.claim_status,
          created_at: restaurant.created_at,
          user_id: restaurant.user_id,
          user_email: userEmail,
          user_name: userName,
          user_plan: userPlan,
          country_code: restaurant.country_code,
        }
      })
    )

    const claims = claimsWithUsers

    return NextResponse.json({ claims })
  } catch (error) {
    console.error('Admin claims GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    )
  }
}
