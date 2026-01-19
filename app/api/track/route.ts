import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use Edge Runtime for faster, cheaper execution
export const runtime = 'edge'

// Simple hash function for IP anonymization
async function hashIP(ip: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

// Detect device type from user agent
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile'
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside function to avoid build-time evaluation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: true, queued: true }, // Don't fail tracking
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await request.json()
    const { restaurantId, eventType, source, campaign, referrer } = body

    // Validate required fields
    if (!restaurantId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate event type
    const validEventTypes = [
      'page_view',
      'phone_click',
      'address_click',
      'website_click',
      'hours_click',
      'reservation_click'
    ]
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const country = request.headers.get('x-vercel-ip-country') || null
    const city = request.headers.get('x-vercel-ip-city') || null

    // Hash IP for privacy
    const ipHash = await hashIP(ip, supabaseKey)
    const deviceType = getDeviceType(userAgent)

    // Insert event (fire and forget pattern for speed)
    const { error } = await supabase.from('analytics_events').insert({
      restaurant_id: restaurantId,
      event_type: eventType,
      source: source || null,
      campaign: campaign || null,
      referrer: referrer || null,
      user_agent: userAgent.slice(0, 500), // Limit length
      ip_hash: ipHash,
      country,
      city,
      device_type: deviceType
    })

    if (error) {
      console.error('Track error:', error)
      // Don't fail the request - tracking should be non-blocking
      return NextResponse.json({ success: true, queued: true })
    }

    // Also update daily stats (async, non-blocking)
    ;(async () => {
      try {
        await supabase.rpc('increment_daily_stat', {
          p_restaurant_id: restaurantId,
          p_event_type: eventType
        })
      } catch {
        // Ignore errors - this is fire-and-forget
      }
    })()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track error:', error)
    // Always return success to not block the client
    return NextResponse.json({ success: true, queued: true })
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
