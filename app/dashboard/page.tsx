'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Restaurant {
  id: string
  slug: string
  name: string
  tagline: string | null
  address: string | null
  phone: string | null
  website: string | null
  rating: number | null
  review_count: number | null
  is_claimed: boolean
  created_at: string
  country_code: string | null
  restaurant_number: string | null
}

function DashboardContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    totalReservations: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    if (user) {
      fetchRestaurants()
    }
  }, [user])

  useEffect(() => {
    if (restaurants.length > 0) {
      fetchStats()
    }
  }, [restaurants])

  const fetchRestaurants = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, slug, name, tagline, address, phone, website, rating, review_count, is_claimed, created_at, country_code, restaurant_number')
        .eq('user_id', user.id)
        .eq('is_claimed', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRestaurants(data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!user || restaurants.length === 0) return

    try {
      // Get aggregate stats from analytics_daily_stats
      const { data, error } = await supabase
        .from('analytics_daily_stats')
        .select('page_views, phone_clicks, address_clicks, website_clicks, hours_clicks, reservation_clicks')
        .in('restaurant_id', restaurants.map(r => r.id))

      if (error) throw error

      const totals = data?.reduce((acc, stat) => ({
        totalViews: acc.totalViews + (stat.page_views || 0),
        totalClicks: acc.totalClicks + (stat.phone_clicks || 0) + (stat.address_clicks || 0) + (stat.website_clicks || 0) + (stat.hours_clicks || 0),
        totalReservations: acc.totalReservations + (stat.reservation_clicks || 0),
      }), { totalViews: 0, totalClicks: 0, totalReservations: 0 }) || { totalViews: 0, totalClicks: 0, totalReservations: 0 }

      setStats({
        ...totals,
        conversionRate: totals.totalViews > 0 ? parseFloat(((totals.totalReservations / totals.totalViews) * 100).toFixed(1)) : 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-900">{user?.email}</span>
                </p>
              </div>
              <Link
                href="/claim"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Claim Restaurant
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          ) : restaurants.length === 0 ? (
            /* No Restaurants - Empty State */
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Restaurants Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Claim your first restaurant to start tracking where your bookings come from and see real demand insights.
              </p>
              <Link
                href="/claim"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Claim Your Restaurant
              </Link>
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Total Views</span>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Total Clicks</span>
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.596 4.23L2.475 5.61M5.596 4.23l-1.64 1.64" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Reservations</span>
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReservations.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Conversion</span>
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Restaurants List */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Restaurants</h2>
                  <Link
                    href="/claim"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Restaurant
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.map((restaurant) => {
                    const restaurantUrl = restaurant.country_code && restaurant.restaurant_number 
                      ? `/r/${restaurant.country_code}/${restaurant.restaurant_number}`
                      : `/restaurant/${restaurant.slug}`
                    const dashboardUrl = restaurant.country_code && restaurant.restaurant_number
                      ? `/dashboard/restaurant/${restaurant.country_code}/${restaurant.restaurant_number}`
                      : `/restaurant/${restaurant.slug}/dashboard`
                    
                    return (
                      <Link
                        key={restaurant.id}
                        href={dashboardUrl}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-accent-300 transition-all p-6 group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-accent-600 transition-colors">
                              {restaurant.name}
                            </h3>
                            {restaurant.tagline && (
                              <p className="text-sm text-gray-600 mb-2">{restaurant.tagline}</p>
                            )}
                            {restaurant.rating && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                                <span className="font-semibold">{restaurant.rating}</span>
                                {restaurant.review_count && (
                                  <span className="text-gray-500">({restaurant.review_count} reviews)</span>
                                )}
                              </div>
                            )}
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>

                        {restaurant.address && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="line-clamp-1">{restaurant.address}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                          <span className="text-xs font-semibold text-accent-600 bg-accent-50 px-2 py-1 rounded">
                            View Dashboard
                          </span>
                          <Link
                            href={restaurantUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-gray-600 hover:text-accent-600 transition-colors"
                          >
                            View Page →
                          </Link>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <Link
                  href="/dashboard/analytics"
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Analytics</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Track where your bookings come from with detailed analytics
                  </p>
                  <span className="text-sm font-semibold text-blue-600">View Analytics →</span>
                </Link>

                <Link
                  href="/dashboard/campaigns"
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Campaign Links</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Create tracking links for hotels, influencers, and campaigns
                  </p>
                  <span className="text-sm font-semibold text-green-600">Manage Links →</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Settings</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage your account, subscription, and preferences
                  </p>
                  <span className="text-sm font-semibold text-purple-600">Account Settings →</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
