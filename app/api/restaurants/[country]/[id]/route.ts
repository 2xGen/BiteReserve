import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// GET - Fetch restaurant by country_code and restaurant_number (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string; id: string }> }
) {
  try {
    // Create Supabase client inside function to avoid build-time evaluation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { country, id } = await params
    
    // Ensure id is padded to 5 digits
    const restaurantNumber = id.padStart(5, '0')
    const countryCode = country.toLowerCase()

    console.log(`[API] Fetching restaurant: country=${countryCode}, number=${restaurantNumber}`)

    // Select only needed fields for better performance
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name, tagline, description, address, phone, website, google_maps_url, rating, review_count, price_level, cuisine, features, hours, booking_url, booking_platform, is_claimed, country_code, restaurant_number, reservation_form_enabled, reservation_email_verified, reservation_whatsapp_verified, reservation_min_advance_hours, reservation_delivery_method')
      .eq('country_code', countryCode)
      .eq('restaurant_number', restaurantNumber)
      .single()

    if (error) {
      console.error(`[API] Supabase error:`, error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Restaurant not found', details: `No restaurant found with country_code=${countryCode} and restaurant_number=${restaurantNumber}` },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    if (!restaurant) {
      console.error(`[API] No restaurant data returned`)
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    console.log(`[API] Restaurant found: ${restaurant.name}`)
    return NextResponse.json({ restaurant }, {
      headers: {
        // Cache for 5 minutes, revalidate in background
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('[API] Restaurant GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
