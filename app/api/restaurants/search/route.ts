import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Search restaurants by name, city, or country
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const country = searchParams.get('country')?.trim()
    const id = searchParams.get('id')?.trim()

    // If country and id are provided, fetch specific restaurant
    if (country && id) {
      const restaurantNumber = id.padStart(5, '0')
      const countryCode = country.toLowerCase()

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('id, name, tagline, description, address, phone, website, cuisine, country_code, restaurant_number, is_claimed')
        .eq('country_code', countryCode)
        .eq('restaurant_number', restaurantNumber)
        .single()

      if (error || !restaurant) {
        return NextResponse.json({ restaurants: [] })
      }

      return NextResponse.json({ restaurants: [restaurant] })
    }

    // Otherwise, search by query
    if (!query || query.length < 2) {
      return NextResponse.json({ restaurants: [] })
    }

    // Search by name (case-insensitive, partial match)
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, tagline, description, address, phone, website, cuisine, country_code, restaurant_number, is_claimed')
      .ilike('name', `%${query}%`)
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ restaurants: [] })
    }

    return NextResponse.json({ restaurants: restaurants || [] })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    )
  }
}
