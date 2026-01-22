import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Use Node.js runtime for revalidatePath support (doesn't work in Edge)
export const runtime = 'nodejs'

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
    
    // Log what we're receiving
    console.log('[Update] Received update request:', {
      restaurantId,
      hasTagline: tagline !== undefined,
      hasDescription: description !== undefined,
      hasLogoUrl: logoUrl !== undefined,
      hasCoverBannerColor: coverBannerColor !== undefined,
      coverBannerColorValue: coverBannerColor
    })
    
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
    // Handle logo and banner color - allow null to clear values
    if (logoUrl !== undefined) updateData.logo_url = logoUrl || null
    if (coverBannerColor !== undefined) updateData.cover_banner_color = coverBannerColor || null
    if (whatsappNumber !== undefined) updateData.whatsapp_number = whatsappNumber
    if (bookingUrl !== undefined) updateData.booking_url = bookingUrl
    if (bookingPlatform !== undefined) updateData.booking_platform = bookingPlatform

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No data provided to update' },
        { status: 400 }
      )
    }

    const { data: updatedRestaurant, error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating restaurant:', error)
      console.error('Update data:', JSON.stringify(updateData, null, 2))
      console.error('Restaurant ID:', restaurantId)
      return NextResponse.json(
        { error: `Failed to update restaurant details: ${error.message || 'Unknown error'}`, details: error },
        { status: 500 }
      )
    }

    if (!updatedRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or update failed' },
        { status: 404 }
      )
    }

    // Revalidate the restaurant page cache so changes appear immediately
    if (updatedRestaurant.country_code && updatedRestaurant.restaurant_number) {
      try {
        // Pad restaurant_number to 5 digits to match the URL format
        const paddedNumber = String(updatedRestaurant.restaurant_number).padStart(5, '0')
        const restaurantPath = `/r/${updatedRestaurant.country_code}/${paddedNumber}`
        const apiPath = `/api/restaurants/${updatedRestaurant.country_code}/${paddedNumber}`
        
        console.log(`[Revalidation] Revalidating paths: ${restaurantPath} and ${apiPath}`)
        console.log(`[Revalidation] Restaurant data:`, {
          country_code: updatedRestaurant.country_code,
          restaurant_number: updatedRestaurant.restaurant_number,
          padded_number: paddedNumber
        })
        
        revalidatePath(restaurantPath)
        revalidatePath(apiPath)
        
        console.log(`[Revalidation] Successfully revalidated cache for restaurant ${updatedRestaurant.name}`)
      } catch (revalidateError) {
        console.error('[Revalidation] Error revalidating cache:', revalidateError)
        // Don't fail the request if revalidation fails - data is still saved
      }
    } else {
      console.warn('[Revalidation] Missing country_code or restaurant_number, cannot revalidate cache')
      console.warn('[Revalidation] Restaurant data:', {
        country_code: updatedRestaurant.country_code,
        restaurant_number: updatedRestaurant.restaurant_number
      })
    }

    console.log('[Update] Successfully updated restaurant:', {
      id: updatedRestaurant.id,
      name: updatedRestaurant.name,
      updatedFields: Object.keys(updateData)
    })

    return NextResponse.json({ success: true, restaurant: updatedRestaurant })
  } catch (error) {
    console.error('Complete restaurant error:', error)
    return NextResponse.json(
      { error: 'Failed to complete restaurant details' },
      { status: 500 }
    )
  }
}
