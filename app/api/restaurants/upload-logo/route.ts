import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Use Node runtime for file uploads (Edge has limitations with FormData)
export const runtime = 'nodejs'

// POST - Upload restaurant logo to Supabase Storage
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
    const formData = await request.formData()
    const file = formData.get('file') as File
    const restaurantId = formData.get('restaurantId') as string

    if (!file || !restaurantId) {
      return NextResponse.json(
        { error: 'Missing file or restaurantId' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PNG, JPEG, WebP, or SVG.' },
        { status: 400 }
      )
    }

    // Validate file size (max 2MB for logo)
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      )
    }

    // Verify restaurant exists and user has permission
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, user_id, country_code, restaurant_number')
      .eq('id', restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${restaurantId}-${Date.now()}.${fileExt}`
    const filePath = `restaurant-logos/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Check if bucket exists, create if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === 'restaurant-assets')
    
    if (!bucketExists) {
      // Try to create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('restaurant-assets', {
        public: true, // Make bucket public so logos can be accessed
        fileSizeLimit: 5242880, // 5MB max file size
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
      })

      if (createError) {
        console.error('Error creating bucket:', createError)
        return NextResponse.json(
          { 
            error: 'Storage bucket not configured. Please create the "restaurant-assets" bucket in Supabase Storage.',
            details: 'Go to Supabase Dashboard > Storage > Create Bucket. Name: "restaurant-assets", Public: Yes',
            createError: createError.message
          },
          { status: 500 }
        )
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('restaurant-assets')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: true, // Allow overwriting old logos
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      // Check if bucket doesn't exist
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Storage bucket not configured. Please create the "restaurant-assets" bucket in Supabase Storage.',
            details: 'Go to Supabase Dashboard > Storage > Create Bucket. Name: "restaurant-assets", Public: Yes',
            uploadError: uploadError.message
          },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to upload logo', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('restaurant-assets')
      .getPublicUrl(filePath)

    const logoUrl = urlData.publicUrl

    // Update restaurant with logo URL
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ logo_url: logoUrl })
      .eq('id', restaurantId)

    if (updateError) {
      console.error('Error updating restaurant:', updateError)
      // Try to delete uploaded file on error
      await supabase.storage.from('restaurant-assets').remove([filePath])
      return NextResponse.json(
        { error: 'Failed to save logo URL' },
        { status: 500 }
      )
    }

    // Revalidate the restaurant page cache so logo appears immediately
    if (restaurant.country_code && restaurant.restaurant_number) {
      const restaurantPath = `/r/${restaurant.country_code}/${restaurant.restaurant_number}`
      revalidatePath(restaurantPath)
      // Also revalidate the API route
      revalidatePath(`/api/restaurants/${restaurant.country_code}/${restaurant.restaurant_number}`)
    }

    return NextResponse.json({
      success: true,
      logoUrl,
    })
  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}
