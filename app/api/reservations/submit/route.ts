import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// POST - Submit a reservation request
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
      restaurantId,
      date,
      time,
      partySize,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      source,
      campaign,
    } = body

    // Validate required fields
    if (!restaurantId || !date || !time || !partySize || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if restaurant has reservation form enabled
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('reservation_form_enabled, reservation_email, reservation_whatsapp, reservation_email_verified, reservation_whatsapp_verified, reservation_min_advance_hours, reservation_delivery_method')
      .eq('id', restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    if (!restaurant.reservation_form_enabled) {
      return NextResponse.json(
        { error: 'Reservation form is not enabled for this restaurant' },
        { status: 403 }
      )
    }

    // Check minimum advance time
    const requestedDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const hoursInAdvance = (requestedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const minHours = restaurant.reservation_min_advance_hours || 24

    if (hoursInAdvance < minHours) {
      return NextResponse.json(
        { error: `Reservations must be made at least ${minHours} hours in advance` },
        { status: 400 }
      )
    }

    // Check if email/WhatsApp is verified (depending on delivery method)
    const deliveryMethod = restaurant.reservation_delivery_method || 'email'
    if (deliveryMethod === 'email' && !restaurant.reservation_email_verified) {
      return NextResponse.json(
        { error: 'Reservation form is not yet configured. Please contact the restaurant directly.' },
        { status: 503 }
      )
    }
    if (deliveryMethod === 'whatsapp' && !restaurant.reservation_whatsapp_verified) {
      return NextResponse.json(
        { error: 'Reservation form is not yet configured. Please contact the restaurant directly.' },
        { status: 503 }
      )
    }
    if (deliveryMethod === 'both' && !restaurant.reservation_email_verified && !restaurant.reservation_whatsapp_verified) {
      return NextResponse.json(
        { error: 'Reservation form is not yet configured. Please contact the restaurant directly.' },
        { status: 503 }
      )
    }

    // Create reservation request
    const { data: reservation, error: insertError } = await supabase
      .from('reservation_requests')
      .insert({
        restaurant_id: restaurantId,
        date,
        time,
        party_size: parseInt(partySize),
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || null,
        special_requests: specialRequests || null,
        source: source || null,
        campaign: campaign || null,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating reservation:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit reservation request' },
        { status: 500 }
      )
    }

    // TODO: Send email/WhatsApp notification to restaurant
    // For MVP, you can handle this manually or add it later

    // Track reservation click event
    await supabase.from('analytics_events').insert({
      restaurant_id: restaurantId,
      event_type: 'reservation_click',
      is_action: true,
      source: source || null,
      campaign: campaign || null,
    })

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
    })
  } catch (error) {
    console.error('Reservation submit error:', error)
    return NextResponse.json(
      { error: 'Failed to submit reservation' },
      { status: 500 }
    )
  }
}
