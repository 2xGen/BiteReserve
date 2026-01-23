'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface AggregatedData {
  totalRestaurants: number
  totalPageViews: number
  totalPhoneClicks: number
  totalReservationClicks: number
  totalCampaignLinks: number
  totalAddressReveals: number
  totalWebsiteReveals: number
  sources: Array<{ name: string; visits: number }>
  chartData: Array<{ date: string; pageViews: number }>
  restaurants: Array<{
    id: string
    name: string
    country_code: string | null
    restaurant_number: string | null
    claim_status: string | null
    is_claimed: boolean
    user_name: string | null
    user_email: string | null
    user_plan: string
    analytics: {
      totals: {
        pageViews: number
        phoneClicks: number
        reservationClicks: number
      }
    }
    campaign_links: Array<{
      id: string
      name: string
      slug: string
      type: string
      clicks: number
      reservations: number
    }>
  }>
}

function AdminRestaurantsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<AggregatedData | null>(null)
  const [countries, setCountries] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, selectedCountry, searchQuery])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCountry) params.append('country', selectedCountry)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/admin/restaurants?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch restaurants')
      const responseData = await response.json()
      
      // Use aggregated data directly from API
      const aggregatedData = responseData.aggregated || {}
      
      const aggregated: AggregatedData = {
        totalRestaurants: aggregatedData.totalRestaurants || 0,
        totalPageViews: aggregatedData.totalPageViews || 0,
        totalPhoneClicks: aggregatedData.totalPhoneClicks || 0,
        totalReservationClicks: aggregatedData.totalReservationClicks || 0,
        totalCampaignLinks: aggregatedData.totalCampaignLinks || 0,
        totalAddressReveals: aggregatedData.totalAddressReveals || 0,
        totalWebsiteReveals: aggregatedData.totalWebsiteReveals || 0,
        sources: aggregatedData.sources || [],
        chartData: aggregatedData.chartData || [],
        restaurants: [], // No restaurant list needed
      }
      
      setData(aggregated)
      setCountries(responseData.countries || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
            <p className="mt-4 text-gray-600">Loading restaurants...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">All Restaurants</h1>
                <p className="text-gray-600">View and manage all restaurants in the system</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/emails"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Manage Emails
                </Link>
                <Link
                  href="/admin/claims"
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View Claims
                </Link>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country Filter */}
                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                    Filter by Country (ISO Code)
                  </label>
                  <select
                    id="country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Filter */}
                <div>
                  <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                    Search by Name or Restaurant Code
                  </label>
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter restaurant name or code..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-gray-600">
                Showing {data?.totalRestaurants || 0} restaurant{(data?.totalRestaurants || 0) !== 1 ? 's' : ''}
                {selectedCountry && ` in ${selectedCountry}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            </div>
          </div>

          {/* Aggregated Dashboard */}
          {!data || data.totalRestaurants === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Total Restaurants</span>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.totalRestaurants.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Page Views</span>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.totalPageViews.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Phone Clicks</span>
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.totalPhoneClicks.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Booking Attempts</span>
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.totalReservationClicks.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Conversion</span>
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.totalPageViews > 0
                      ? ((data.totalReservationClicks / data.totalPageViews) * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
              </div>

              {/* Chart and Sources */}
              <div className="grid lg:grid-cols-3 gap-6 mb-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic & Guest Actions (Last 30 Days)</h3>
                  {data.chartData && data.chartData.length > 0 ? (
                    <div className="h-64 flex items-end justify-between gap-1">
                      {data.chartData.map((point, i) => {
                        const maxViews = Math.max(...data.chartData.map(p => p.pageViews || 0), 1)
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-accent-500 to-accent-400 rounded-t max-w-[24px]"
                              style={{ height: `${Math.max((point.pageViews / maxViews) * 100, 4)}%` }}
                            ></div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      No data available
                    </div>
                  )}
                </div>

                {/* Traffic Sources */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic Sources</h3>
                  {data.sources && data.sources.length > 0 ? (
                    <div className="space-y-4">
                      {data.sources.slice(0, 5).map((source, i) => {
                        const totalVisits = data.sources.reduce((sum, s) => sum + s.visits, 0)
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-gray-700">{source.name}</span>
                              <span className="text-sm text-gray-500">{source.visits.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${(source.visits / totalVisits) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No traffic sources yet</p>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function AdminRestaurantsPage() {
  return (
    <ProtectedRoute>
      <AdminRestaurantsPageContent />
    </ProtectedRoute>
  )
}
