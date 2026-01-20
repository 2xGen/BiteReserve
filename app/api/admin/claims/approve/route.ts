import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendRestaurantApprovedEmail } from '@/lib/resend'

export const runtime = 'edge'

// POST - Approve a restaurant claim
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
    const { claimId } = body

    if (!claimId) {
      return NextResponse.json(
        { error: 'Missing claimId' },
        { status: 400 }
      )
    }

    // Get the restaurant and user info
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('*, users!restaurants_user_id_fkey (email, name)')
      .eq('id', claimId)
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    if (restaurant.claim_status === 'approved') {
      return NextResponse.json(
        { error: 'Claim already approved' },
        { status: 400 }
      )
    }

    // Update restaurant to approved status
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        claim_status: 'approved',
        is_claimed: true,
        claim_reviewed_at: new Date().toISOString(),
        // claim_reviewed_by: adminUserId, // Add this when you have admin user tracking
      })
      .eq('id', claimId)

    if (updateError) {
      console.error('Error approving claim:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve claim' },
        { status: 500 }
      )
    }

    // Start the trial for Pro/Business subscriptions
    // Trial starts from approval date, not payment date
    if (restaurant.user_id) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', restaurant.user_id)
        .in('plan', ['pro', 'business'])
        .eq('status', 'pending')
        .single()

      if (subscription) {
        // Calculate trial end date (14 days from now - approval date)
        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + 14)
        
        // Update subscription to start trial
        await supabase
          .from('subscriptions')
          .update({
            status: 'trialing',
            trial_ends_at: trialEndDate.toISOString(),
            current_period_end: trialEndDate.toISOString(),
          })
          .eq('id', subscription.id)

        // Also update Stripe subscription trial period if needed
        // Note: Stripe trial may have already started, but we'll extend it if needed
        // For now, we'll just update our DB - Stripe will sync on next webhook
        
        // Send approval email with trial start notification
        if (restaurant.users?.email && restaurant.users?.name) {
          try {
            await sendRestaurantApprovedEmail(
              restaurant.users.email,
              restaurant.users.name,
              restaurant.name,
              subscription.plan as 'free' | 'pro' | 'business'
            )
          } catch (emailError) {
            console.error('Error sending approval email:', emailError)
            // Don't fail the approval if email fails
          }
        }
      } else {
        // Free plan - just send approval email
        if (restaurant.users?.email && restaurant.users?.name) {
          try {
            await sendRestaurantApprovedEmail(
              restaurant.users.email,
              restaurant.users.name,
              restaurant.name,
              'free'
            )
          } catch (emailError) {
            console.error('Error sending approval email:', emailError)
            // Don't fail the approval if email fails
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Claim approved successfully',
    })
  } catch (error) {
    console.error('Approve claim error:', error)
    return NextResponse.json(
      { error: 'Failed to approve claim' },
      { status: 500 }
    )
  }
}
