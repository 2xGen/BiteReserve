import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// POST - Complete restaurant details after payment
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
      tagline,
      address,
      phone,
      website,
      cuisine,
      features,
      description,
      priceLevel,
      hours,
      googleBusinessProfile,
      businessLinks,
      logoUrl,
      coverBannerColor,
      whatsappNumber,
      bookingUrl,
      bookingPlatform,
    } = body

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Missing restaurantId' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (tagline !== undefined) updateData.tagline = tagline
    if (address !== undefined) updateData.address = address
    if (phone !== undefined) updateData.phone = phone
    if (website !== undefined) updateData.website = website
    if (cuisine !== undefined) updateData.cuisine = cuisine
    if (features !== undefined) updateData.features = features
    if (description !== undefined) updateData.description = description
    if (priceLevel !== undefined) updateData.price_level = priceLevel
    if (hours !== undefined) updateData.hours = hours
    // Note: google_business_profile column doesn't exist in schema, skipping
    // if (googleBusinessProfile !== undefined) updateData.google_business_profile = googleBusinessProfile
    if (businessLinks !== undefined) {
      // Update phone, website, maps links if enabled
      if (businessLinks.phone?.enabled && phone) {
        businessLinks.phone.url = `tel:${phone}`
      }
      if (businessLinks.website?.enabled && website) {
        businessLinks.website.url = website
      }
      if (businessLinks.maps?.enabled && address) {
        // Generate Google Maps URL from address
        const encodedAddress = encodeURIComponent(address)
        businessLinks.maps.url = `https://maps.google.com/?q=${encodedAddress}`
      }
      updateData.business_links = businessLinks
    }
    if (logoUrl !== undefined) updateData.logo_url = logoUrl
    if (coverBannerColor !== undefined) updateData.cover_banner_color = coverBannerColor
    if (whatsappNumber !== undefined) updateData.whatsapp_number = whatsappNumber
    if (bookingUrl !== undefined) updateData.booking_url = bookingUrl
    if (bookingPlatform !== undefined) updateData.booking_platform = bookingPlatform

    const { error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurantId)

    if (error) {
      console.error('Error updating restaurant:', error)
      console.error('Update data:', JSON.stringify(updateData, null, 2))
      return NextResponse.json(
        { error: `Failed to update restaurant details: ${error.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete restaurant error:', error)
    return NextResponse.json(
      { error: 'Failed to complete restaurant details' },
      { status: 500 }
    )
  }
}
