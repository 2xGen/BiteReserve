import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// POST - Update restaurant settings
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
      reservation_form_enabled,
      reservation_email,
      reservation_whatsapp,
      reservation_min_advance_hours,
      reservation_delivery_method,
    } = body

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Missing restaurantId' },
        { status: 400 }
      )
    }

    // Verify restaurant belongs to user (get user from auth header or body)
    // For now, we'll trust the request - add proper auth later
    const updateData: any = {
      reservation_form_enabled: reservation_form_enabled || false,
      reservation_min_advance_hours: reservation_min_advance_hours || 24,
      reservation_delivery_method: reservation_delivery_method || 'email',
    }

    // Handle email - if changed, mark as unverified
    if (reservation_email !== undefined) {
      // Check if email changed
      const { data: current } = await supabase
        .from('restaurants')
        .select('reservation_email')
        .eq('id', restaurantId)
        .single()

      if (current?.reservation_email !== reservation_email) {
        updateData.reservation_email = reservation_email || null
        updateData.reservation_email_verified = false // Require re-verification
      }
    }

    // Handle WhatsApp - if changed, mark as unverified
    if (reservation_whatsapp !== undefined) {
      const { data: current } = await supabase
        .from('restaurants')
        .select('reservation_whatsapp')
        .eq('id', restaurantId)
        .single()

      if (current?.reservation_whatsapp !== reservation_whatsapp) {
        updateData.reservation_whatsapp = reservation_whatsapp || null
        updateData.reservation_whatsapp_verified = false // Require re-verification
      }
    }

    const { error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurantId)

    if (error) {
      console.error('Error updating restaurant settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    // TODO: Send verification email/SMS if email/WhatsApp changed
    // For MVP, you'll handle verification manually

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
