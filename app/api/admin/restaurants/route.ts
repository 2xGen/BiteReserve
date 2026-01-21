import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// GET - Fetch all restaurants for admin view with filters
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const countryCode = searchParams.get('country')
    const searchQuery = searchParams.get('search')

    // Get total count using count query (not fetching all IDs)
    let countQuery = supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })

    if (countryCode) {
      countQuery = countQuery.eq('country_code', countryCode.toUpperCase())
    }

    if (searchQuery) {
      countQuery = countQuery.or(`name.ilike.%${searchQuery}%,restaurant_number.ilike.%${searchQuery}%`)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting restaurants:', countError)
      return NextResponse.json(
        { error: 'Failed to count restaurants' },
        { status: 500 }
      )
    }

    // Get all matching restaurant IDs for analytics
    // Need to paginate to get ALL restaurants (Supabase default limit is 1000)
    let restaurantIds: string[] = []
    let page = 0
    const PAGE_SIZE = 1000
    let hasMore = true

    while (hasMore) {
      let restaurantIdsQuery = supabase
        .from('restaurants')
        .select('id')
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (countryCode) {
        restaurantIdsQuery = restaurantIdsQuery.eq('country_code', countryCode.toUpperCase())
      }

      if (searchQuery) {
        restaurantIdsQuery = restaurantIdsQuery.or(`name.ilike.%${searchQuery}%,restaurant_number.ilike.%${searchQuery}%`)
      }

      const { data: pageRestaurants, error: restaurantsError } = await restaurantIdsQuery

      if (restaurantsError) {
        console.error('Error fetching restaurant IDs:', restaurantsError)
        break
      }

      if (!pageRestaurants || pageRestaurants.length === 0) {
        hasMore = false
      } else {
        restaurantIds = restaurantIds.concat(pageRestaurants.map(r => r.id))
        hasMore = pageRestaurants.length === PAGE_SIZE
        page++
      }
    }

    console.log(`Fetched ${restaurantIds.length} restaurant IDs for analytics`)

    // Get aggregate analytics totals (last 30 days) for all filtered restaurants
    // Use daily_stats for fast aggregation instead of querying events table
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    
    let aggregateAnalytics = {
      totalPageViews: 0,
      totalPhoneClicks: 0,
      totalReservationClicks: 0,
      totalAddressReveals: 0,
      totalWebsiteReveals: 0,
      sources: [] as any[],
      chartData: [] as any[],
    }

    let totalCampaignLinks = 0

    try {
      // Query daily_stats instead of events table (much faster!)
      let dailyStatsQuery = supabase
        .from('analytics_daily_stats')
        .select('*')
        .gte('date', startDate)

      // If filters applied, need to filter by restaurant IDs
      if (restaurantIds.length > 0) {
        const CHUNK_SIZE = 1000
        let allDailyStats: any[] = []

        // Query daily_stats in chunks
        for (let i = 0; i < restaurantIds.length; i += CHUNK_SIZE) {
          const chunk = restaurantIds.slice(i, i + CHUNK_SIZE)
          const { data: statsData, error: statsError } = await supabase
            .from('analytics_daily_stats')
            .select('*')
            .in('restaurant_id', chunk)
            .gte('date', startDate)

          if (statsError) {
            console.error(`Error fetching daily stats chunk ${Math.floor(i / CHUNK_SIZE) + 1}:`, statsError)
          } else {
            if (statsData && statsData.length > 0) {
              allDailyStats = allDailyStats.concat(statsData)
            }
          }
        }

        // Aggregate from daily_stats
        allDailyStats.forEach(day => {
          aggregateAnalytics.totalPageViews += day.page_views || 0
          aggregateAnalytics.totalPhoneClicks += (day.phone_reveals || 0) + (day.phone_clicks || 0)
          aggregateAnalytics.totalReservationClicks += day.reservation_clicks || 0
          aggregateAnalytics.totalAddressReveals += (day.address_reveals || 0) + (day.maps_clicks || 0)
          aggregateAnalytics.totalWebsiteReveals += (day.website_reveals || 0) + (day.website_clicks || 0)

          // Build chart data
          const date = day.date
          const existing = aggregateAnalytics.chartData.find(c => c.date === date)
          if (existing) {
            existing.pageViews += day.page_views || 0
          } else {
            aggregateAnalytics.chartData.push({
              date,
              pageViews: day.page_views || 0
            })
          }
        })

        // Get campaign links count - query in chunks
        let campaignLinksTotal = 0
        for (let i = 0; i < restaurantIds.length; i += CHUNK_SIZE) {
          const chunk = restaurantIds.slice(i, i + CHUNK_SIZE)
          const { count: campaignLinksCount } = await supabase
            .from('campaign_links')
            .select('*', { count: 'exact', head: true })
            .in('restaurant_id', chunk)
            .eq('is_active', true)
          campaignLinksTotal += campaignLinksCount || 0
        }
        totalCampaignLinks = campaignLinksTotal
      } else {
        // No filters - query all daily_stats (much faster than events!)
        console.log('No filters applied, querying all daily_stats directly')
        const { data: allDailyStats, error: statsError } = await supabase
          .from('analytics_daily_stats')
          .select('*')
          .gte('date', startDate)

        if (statsError) {
          console.error('Error fetching daily stats:', statsError)
        } else if (allDailyStats && allDailyStats.length > 0) {
          // Aggregate from daily_stats
          allDailyStats.forEach(day => {
            aggregateAnalytics.totalPageViews += day.page_views || 0
            aggregateAnalytics.totalPhoneClicks += (day.phone_reveals || 0) + (day.phone_clicks || 0)
            aggregateAnalytics.totalReservationClicks += day.reservation_clicks || 0
            aggregateAnalytics.totalAddressReveals += (day.address_reveals || 0) + (day.maps_clicks || 0)
            aggregateAnalytics.totalWebsiteReveals += (day.website_reveals || 0) + (day.website_clicks || 0)

            // Build chart data
            const date = day.date
            const existing = aggregateAnalytics.chartData.find(c => c.date === date)
            if (existing) {
              existing.pageViews += day.page_views || 0
            } else {
              aggregateAnalytics.chartData.push({
                date,
                pageViews: day.page_views || 0
              })
            }
          })
        }

        // Get campaign links count - no filters
        const { count: campaignLinksCount } = await supabase
          .from('campaign_links')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
        totalCampaignLinks = campaignLinksCount || 0
      }

      // Still need to query events table for sources (this is lightweight - just source/campaign fields)
      // Limit to recent events for source aggregation (last 7 days is enough for top sources)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      let sourceEventsQuery = supabase
        .from('analytics_events')
        .select('source, campaign')
        .gte('created_at', sevenDaysAgo)
        .not('source', 'is', null)
        .limit(5000) // Limit for performance

      if (restaurantIds.length > 0) {
        // With filters, query only for filtered restaurants
        const CHUNK_SIZE = 1000
        const sourceMap = new Map<string, number>()
        
        for (let i = 0; i < restaurantIds.length; i += CHUNK_SIZE) {
          const chunk = restaurantIds.slice(i, i + CHUNK_SIZE)
          const { data: sourceEvents } = await supabase
            .from('analytics_events')
            .select('source, campaign')
            .in('restaurant_id', chunk)
            .gte('created_at', sevenDaysAgo)
            .not('source', 'is', null)
            .limit(5000)

          if (sourceEvents) {
            sourceEvents.forEach(event => {
              const source = event.source || event.campaign || 'direct'
              sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
            })
          }
        }

        aggregateAnalytics.sources = Array.from(sourceMap.entries())
          .map(([name, visits]) => ({ name, visits }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 10)
      } else {
        // No filters - query all sources
        const { data: sourceEvents } = await sourceEventsQuery

        if (sourceEvents) {
          const sourceMap = new Map<string, number>()
          sourceEvents.forEach(event => {
            const source = event.source || event.campaign || 'direct'
            sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
          })
          aggregateAnalytics.sources = Array.from(sourceMap.entries())
            .map(([name, visits]) => ({ name, visits }))
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 10)
        }
      }

      // Sort chart data by date
      aggregateAnalytics.chartData.sort((a, b) => a.date.localeCompare(b.date))
      
      console.log(`Analytics aggregated from daily_stats: ${aggregateAnalytics.totalPageViews} page views, ${aggregateAnalytics.totalPhoneClicks} phone clicks`)
    } catch (analyticsError) {
      console.error('Error fetching aggregate analytics:', analyticsError)
    }


    // Get unique country codes for filter dropdown
    const { data: countriesData } = await supabase
      .from('restaurants')
      .select('country_code')
      .not('country_code', 'is', null)

    const uniqueCountries = Array.from(
      new Set((countriesData || []).map((r: any) => r.country_code).filter(Boolean))
    ).sort()

    return NextResponse.json({
      countries: uniqueCountries,
      aggregated: {
        totalRestaurants: totalCount || 0,
        totalPageViews: aggregateAnalytics.totalPageViews,
        totalPhoneClicks: aggregateAnalytics.totalPhoneClicks,
        totalReservationClicks: aggregateAnalytics.totalReservationClicks,
        totalCampaignLinks: totalCampaignLinks,
        totalAddressReveals: aggregateAnalytics.totalAddressReveals,
        totalWebsiteReveals: aggregateAnalytics.totalWebsiteReveals,
        sources: aggregateAnalytics.sources,
        chartData: aggregateAnalytics.chartData,
      },
    })
  } catch (error) {
    console.error('Admin restaurants GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}
