import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// GET - Fetch restaurants with their emails, filtered by country
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
    const countryCode = searchParams.get('country')

    // Build query for restaurants
    let restaurantsQuery = supabase
      .from('restaurants')
      .select('id, name, address, country_code, restaurant_number')
      .order('name', { ascending: true })

    if (countryCode) {
      restaurantsQuery = restaurantsQuery.eq('country_code', countryCode.toUpperCase())
    }

    const { data: restaurants, error: restaurantsError } = await restaurantsQuery

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError)
      return NextResponse.json(
        { error: 'Failed to fetch restaurants' },
        { status: 500 }
      )
    }

    // Fetch emails for all restaurants
    const restaurantIds = restaurants?.map(r => r.id) || []
    let emails: any[] = []
    
    // Only query emails if we have restaurant IDs and the table exists
    if (restaurantIds.length > 0) {
      try {
        const { data: emailsData, error: emailsError } = await supabase
          .from('restaurant_emails')
          .select('restaurant_id, email')
          .in('restaurant_id', restaurantIds)

        if (emailsError) {
          // If table doesn't exist yet, that's okay - just continue without emails
          if (emailsError.code === '42P01' || emailsError.message?.includes('does not exist')) {
            console.log('restaurant_emails table does not exist yet - skipping email fetch')
          } else {
            console.error('Error fetching emails:', emailsError)
          }
        } else {
          emails = emailsData || []
        }
      } catch (error) {
        // Table might not exist - that's okay
        console.log('Could not fetch emails (table may not exist):', error)
      }
    }

    // Map emails to restaurants (take the first email if multiple exist)
    const emailMap = new Map<string, string>()
    emails?.forEach((e: any) => {
      if (e.email && !emailMap.has(e.restaurant_id)) {
        emailMap.set(e.restaurant_id, e.email)
      }
    })

    // Combine restaurants with their emails
    const restaurantsWithEmails = restaurants?.map((r: any) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      country_code: r.country_code,
      restaurant_number: r.restaurant_number,
      email: emailMap.get(r.id) || null
    })) || []

    // Get unique country codes for filter
    const { data: countriesData } = await supabase
      .from('restaurants')
      .select('country_code')
      .not('country_code', 'is', null)

    const uniqueCountries = Array.from(
      new Set((countriesData || []).map((r: any) => r.country_code).filter(Boolean))
    ).sort()

    return NextResponse.json({
      restaurants: restaurantsWithEmails,
      countries: uniqueCountries
    })
  } catch (error) {
    console.error('Admin restaurants emails GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

// POST - Save or update restaurant email
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
    const { restaurantId, email } = body

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // If email is empty/null, delete existing emails for this restaurant
    if (!email || email.trim() === '') {
      try {
        const { error: deleteError } = await supabase
          .from('restaurant_emails')
          .delete()
          .eq('restaurant_id', restaurantId)

        if (deleteError) {
          // If table doesn't exist, that's okay - nothing to delete
          if (deleteError.code === '42P01' || deleteError.message?.includes('does not exist')) {
            return NextResponse.json({ success: true, email: null })
          }
          console.error('Error deleting email:', deleteError)
          return NextResponse.json(
            { error: 'Failed to remove email', details: deleteError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, email: null })
      } catch (error) {
        // Table might not exist - that's okay
        return NextResponse.json({ success: true, email: null })
      }
    }

    // Check if email already exists for this restaurant
    try {
      const { data: existing, error: checkError } = await supabase
        .from('restaurant_emails')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('email', email.trim())
        .single()

      // If table doesn't exist, we'll create it by inserting
      if (checkError && (checkError.code === '42P01' || checkError.message?.includes('does not exist'))) {
        // Table doesn't exist - we'll try to create it by inserting
      } else if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is fine, but other errors are not
        console.error('Error checking existing email:', checkError)
        return NextResponse.json(
          { error: 'Failed to check email', details: checkError.message },
          { status: 500 }
        )
      } else if (existing) {
        // Email already exists, no need to update
        return NextResponse.json({ success: true, email: email.trim() })
      }
    } catch (error) {
      // Continue - table might not exist yet
    }

    // Delete any existing emails for this restaurant (we only keep one email per restaurant)
    try {
      await supabase
        .from('restaurant_emails')
        .delete()
        .eq('restaurant_id', restaurantId)
    } catch (error) {
      // Ignore - table might not exist
    }

    // Insert new email
    try {
      const { data, error } = await supabase
        .from('restaurant_emails')
        .insert({
          restaurant_id: restaurantId,
          email: email.trim()
        })
        .select()
        .single()

      if (error) {
        // If table doesn't exist, provide helpful error message
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return NextResponse.json(
            { error: 'restaurant_emails table does not exist. Please run the database migration first.', details: error.message },
            { status: 400 }
          )
        }
        console.error('Error saving email:', error)
        return NextResponse.json(
          { error: 'Failed to save email', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, email: data.email })
    } catch (error) {
      console.error('Error in email insert:', error)
      return NextResponse.json(
        { error: 'Failed to save email', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Admin restaurants emails POST error:', error)
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 }
    )
  }
}
