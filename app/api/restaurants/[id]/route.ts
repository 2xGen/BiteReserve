import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// GET - Fetch restaurant by ID (for completion form)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching restaurant:', error)
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error('Restaurant GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}
