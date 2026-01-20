import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// POST - Reject a restaurant claim
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
    const { claimId, reason } = body

    if (!claimId) {
      return NextResponse.json(
        { error: 'Missing claimId' },
        { status: 400 }
      )
    }

    // Get the restaurant
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', claimId)
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    if (restaurant.claim_status === 'rejected') {
      return NextResponse.json(
        { error: 'Claim already rejected' },
        { status: 400 }
      )
    }

    // Update restaurant to rejected status
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        claim_status: 'rejected',
        is_claimed: false,
        claim_reviewed_at: new Date().toISOString(),
        // claim_reviewed_by: adminUserId, // Add this when you have admin user tracking
        // rejection_reason: reason, // You could add this column if you want to store rejection reasons
      })
      .eq('id', claimId)

    if (updateError) {
      console.error('Error rejecting claim:', updateError)
      return NextResponse.json(
        { error: 'Failed to reject claim' },
        { status: 500 }
      )
    }

    // TODO: Send rejection email to user (you mentioned you'll do this manually for MVP)

    return NextResponse.json({
      success: true,
      message: 'Claim rejected',
    })
  } catch (error) {
    console.error('Reject claim error:', error)
    return NextResponse.json(
      { error: 'Failed to reject claim' },
      { status: 500 }
    )
  }
}
