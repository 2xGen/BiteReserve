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

    // Build query
    let query = supabase
      .from('restaurants')
      .select(`
        id,
        name,
        address,
        website,
        phone,
        cuisine,
        booking_platform,
        claim_status,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })

    // Filter by status
    if (status === 'pending') {
      query = query.eq('claim_status', 'pending')
    }
    // If 'all', don't filter by status

    const { data: restaurants, error } = await query

    if (error) {
      console.error('Error fetching claims:', error)
      return NextResponse.json(
        { error: 'Failed to fetch claims' },
        { status: 500 }
      )
    }

    // Fetch user info for each restaurant
    const claimsWithUsers = await Promise.all(
      (restaurants || []).map(async (restaurant: any) => {
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

        return {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          website: restaurant.website,
          phone: restaurant.phone,
          cuisine: restaurant.cuisine,
          booking_platform: restaurant.booking_platform,
          claim_status: restaurant.claim_status,
          created_at: restaurant.created_at,
          user_id: restaurant.user_id,
          user_email: userEmail,
          user_name: userName,
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
