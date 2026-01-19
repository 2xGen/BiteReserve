import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// GET - Fetch all campaign links for a restaurant
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    // Create Supabase client inside function to avoid build-time evaluation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { restaurantId } = params

    // Fetch campaign links
    const { data: links, error } = await supabase
      .from('campaign_links')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch click counts for each campaign
    const linksWithStats = await Promise.all(
      (links || []).map(async (link) => {
        const { count: clicks } = await supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .eq('campaign', link.slug)

        const { count: reservations } = await supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .eq('campaign', link.slug)
          .eq('event_type', 'reservation_click')

        return {
          ...link,
          clicks: clicks || 0,
          reservations: reservations || 0
        }
      })
    )

    return NextResponse.json({ campaigns: linksWithStats })
  } catch (error) {
    console.error('Campaigns GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST - Create a new campaign link
export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    // Create Supabase client inside function to avoid build-time evaluation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { restaurantId } = params
    const body = await request.json()
    const { name, type } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data, error } = await supabase
      .from('campaign_links')
      .insert({
        restaurant_id: restaurantId,
        name,
        slug,
        type
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A campaign with this name already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ campaign: { ...data, clicks: 0, reservations: 0 } })
  } catch (error) {
    console.error('Campaigns POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a campaign link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    // Create Supabase client inside function to avoid build-time evaluation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('id')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('campaign_links')
      .update({ is_active: false })
      .eq('id', campaignId)
      .eq('restaurant_id', params.restaurantId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Campaigns DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
