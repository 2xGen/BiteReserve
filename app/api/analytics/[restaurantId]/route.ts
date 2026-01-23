import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use Edge Runtime for speed
export const runtime = 'edge'

// No caching - dashboard needs real-time data
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
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    // Calculate date range using UTC to match database timezone
    // Database uses CURRENT_DATE which is UTC, so we need to use UTC dates here too
    const now = new Date()
    
    // Get today's date in UTC (matching database CURRENT_DATE)
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ))
    const todayDateStr = todayUTC.toISOString().split('T')[0]
    
    // Calculate start date by subtracting days from today (in UTC)
    let daysToSubtract = 7
    switch (period) {
      case '24h':
        daysToSubtract = 1
        break
      case '7d':
        daysToSubtract = 7
        break
      case '14d':
        daysToSubtract = 14
        break
      case '28d':
        daysToSubtract = 28
        break
      case '3m':
        daysToSubtract = 90
        break
      case '6m':
        daysToSubtract = 180
        break
    }
    
    // Calculate start date in UTC
    const startDateUTC = new Date(todayUTC)
    startDateUTC.setUTCDate(startDateUTC.getUTCDate() - daysToSubtract)
    const startDateStr = startDateUTC.toISOString().split('T')[0]
    const includeToday = todayDateStr >= startDateStr

    // Fetch aggregated stats from daily_stats table (fast)
    // If today is included, exclude it from daily_stats and count directly from events for real-time accuracy
    const dailyStatsQuery = supabase
      .from('analytics_daily_stats')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('date', startDateStr)
      .order('date', { ascending: true })
    
    if (includeToday) {
      // Exclude today from daily_stats - we'll count it directly from events
      dailyStatsQuery.lt('date', todayDateStr)
    }

    const { data: dailyStats, error: statsError } = await dailyStatsQuery

    if (statsError) {
      console.error('Stats error:', statsError)
    }

    // Calculate totals from daily stats
    const totals = {
      pageViews: 0,
      phoneClicks: 0,
      addressClicks: 0,
      websiteClicks: 0,
      hoursClicks: 0,
      reservationClicks: 0,
      ctaActions: 0, // Section 1 Hero Buttons: Call, Map, Web, Book
      uniqueVisitors: 0,
      // New link types
      opentableClicks: 0,
      resyClicks: 0,
      whatsappClicks: 0,
      tripadvisorClicks: 0,
      instagramClicks: 0,
      facebookClicks: 0,
      twitterClicks: 0,
      yelpClicks: 0,
      emailClicks: 0,
      mapsClicks: 0,
    }

    const chartData: { date: string; pageViews: number; reservations: number }[] = []

    if (dailyStats) {
      dailyStats.forEach(day => {
        totals.pageViews += day.page_views || 0
        totals.hoursClicks += day.hours_views || 0
        totals.reservationClicks += day.reservation_clicks || 0
        totals.uniqueVisitors += day.unique_visitors || 0
        
        // New link click types from daily_stats (fast aggregated data)
        totals.phoneClicks += day.phone_clicks || 0
        totals.mapsClicks += day.maps_clicks || 0
        totals.websiteClicks += day.website_clicks || 0
        totals.opentableClicks += day.opentable_clicks || 0
        totals.resyClicks += day.resy_clicks || 0
        totals.whatsappClicks += day.whatsapp_clicks || 0
        totals.tripadvisorClicks += day.tripadvisor_clicks || 0
        totals.instagramClicks += day.instagram_clicks || 0
        totals.facebookClicks += day.facebook_clicks || 0
        totals.twitterClicks += day.twitter_clicks || 0
        totals.yelpClicks += day.yelp_clicks || 0
        totals.emailClicks += day.email_clicks || 0
        
        // Backward compatibility: maps_clicks also counts as addressClicks
        totals.addressClicks += day.maps_clicks || 0
        
        // CTA Actions = Section 1 Hero Buttons (Call, Map, Web, Book)
        // Count: phone_click + maps_click + website_click + opentable_click + resy_click
        totals.ctaActions += (day.phone_clicks || 0) + (day.maps_clicks || 0) + (day.website_clicks || 0) + (day.opentable_clicks || 0) + (day.resy_clicks || 0)

        chartData.push({
          date: day.date,
          pageViews: day.page_views || 0,
          reservations: day.reservation_clicks || 0
        })
      })
    }

    // Count today's events directly from events table for real-time accuracy
    // This ensures events that just happened appear immediately in totals
    if (includeToday) {
      // Use UTC midnight for today to match database date calculations
      const todayStart = todayUTC.toISOString()
      // Use the start date (also UTC) to ensure we only count events within the period
      const periodStart = startDateUTC.toISOString()
      
      const { data: todayEvents } = await supabase
        .from('analytics_events')
        .select('event_type')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', todayStart)
        .gte('created_at', periodStart) // Only count events within the selected period

      if (todayEvents) {
        todayEvents.forEach(event => {
          switch (event.event_type) {
            case 'page_view':
              totals.pageViews += 1
              break
            case 'phone_click':
              totals.phoneClicks += 1
              totals.ctaActions += 1
              break
            case 'maps_click':
              totals.mapsClicks += 1
              totals.addressClicks += 1
              totals.ctaActions += 1
              break
            case 'website_click':
              totals.websiteClicks += 1
              totals.ctaActions += 1
              break
            case 'opentable_click':
              totals.opentableClicks += 1
              totals.reservationClicks += 1
              totals.ctaActions += 1
              break
            case 'resy_click':
              totals.resyClicks += 1
              totals.reservationClicks += 1
              totals.ctaActions += 1
              break
            case 'whatsapp_click':
              totals.whatsappClicks += 1
              break
            case 'tripadvisor_click':
              totals.tripadvisorClicks += 1
              break
            case 'instagram_click':
              totals.instagramClicks += 1
              break
            case 'facebook_click':
              totals.facebookClicks += 1
              break
            case 'twitter_click':
              totals.twitterClicks += 1
              break
            case 'yelp_click':
              totals.yelpClicks += 1
              break
            case 'email_click':
              totals.emailClicks += 1
              break
            case 'hours_click':
            case 'hours_view':
              totals.hoursClicks += 1
              break
            case 'reservation_click':
              totals.reservationClicks += 1
              break
          }
        })
      }
    }

    // Fetch top sources (from events table, only page_view events to match Page Views metric)
    const { data: sourceData } = await supabase
      .from('analytics_events')
      .select('source')
      .eq('restaurant_id', restaurantId)
      .eq('event_type', 'page_view')
      .gte('created_at', startDateUTC.toISOString())
      .not('source', 'is', null)
      .limit(1000) // Limit for performance

    // Aggregate sources
    const sourceCounts: Record<string, number> = {}
    sourceData?.forEach(event => {
      const source = event.source || 'direct'
      // Filter out localhost from production analytics (not meaningful for restaurant owners)
      if (source.toLowerCase() === 'localhost') {
        return // Skip localhost - treat as internal/testing traffic
      }
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })

    const sources = Object.entries(sourceCounts)
      .map(([name, visits]) => ({ name, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6) // Top 6 sources

    // Fetch top campaigns
    const { data: campaignData } = await supabase
      .from('analytics_events')
      .select('campaign')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDateUTC.toISOString())
      .not('campaign', 'is', null)
      .limit(1000)

    const campaignCounts: Record<string, number> = {}
    campaignData?.forEach(event => {
      if (event.campaign) {
        campaignCounts[event.campaign] = (campaignCounts[event.campaign] || 0) + 1
      }
    })

    const campaigns = Object.entries(campaignCounts)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Fetch recent activity (last 10 events)
    const { data: recentActivity } = await supabase
      .from('analytics_events')
      .select('event_type, source, campaign, created_at, device_type, city, country')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      totals,
      chartData,
      sources,
      campaigns,
      recentActivity: recentActivity?.map(event => ({
        type: event.event_type,
        source: event.source,
        campaign: event.campaign,
        time: event.created_at,
        device: event.device_type,
        location: event.city && event.country ? `${event.city}, ${event.country}` : null
      })) || []
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
