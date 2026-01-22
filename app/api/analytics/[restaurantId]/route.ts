import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use Edge Runtime for speed
export const runtime = 'edge'

// Cache responses for 60 seconds to reduce DB load
const CACHE_TTL = 60

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

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '14d':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        break
      case '28d':
        startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
        break
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Fetch aggregated stats from daily_stats table (fast)
    const { data: dailyStats, error: statsError } = await supabase
      .from('analytics_daily_stats')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

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

    // Fetch top sources (from events table, only page_view events to match Page Views metric)
    const { data: sourceData } = await supabase
      .from('analytics_events')
      .select('source')
      .eq('restaurant_id', restaurantId)
      .eq('event_type', 'page_view')
      .gte('created_at', startDate.toISOString())
      .not('source', 'is', null)
      .limit(1000) // Limit for performance

    // Aggregate sources
    const sourceCounts: Record<string, number> = {}
    sourceData?.forEach(event => {
      const source = event.source || 'direct'
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
      .gte('created_at', startDate.toISOString())
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
        'Cache-Control': `s-maxage=${CACHE_TTL}, stale-while-revalidate`
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
