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
  claim_status: 'pending' | 'approved' | 'rejected' | null
  created_at: string
  country_code: string | null
  restaurant_number: string | null
}

// Time period options
const timePeriods = [
  { label: '24h', value: '24h', days: 1 },
  { label: '7d', value: '7d', days: 7 },
  { label: '14d', value: '14d', days: 14 },
  { label: '28d', value: '28d', days: 28 },
  { label: '3m', value: '3m', days: 90 },
  { label: '6m', value: '6m', days: 180 },
]

// Campaign link types
const campaignTypes = [
  { value: 'hotel', label: 'Hotel / Concierge' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'social', label: 'Social Media' },
  { value: 'email', label: 'Email' },
  { value: 'qr', label: 'QR Code' },
  { value: 'ads', label: 'Paid Ads' },
  { value: 'other', label: 'Other' },
]

// Icon component for campaign types
const CampaignIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    hotel: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    influencer: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    social: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    email: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    qr: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    ads: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    other: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  }
  return <>{icons[type] || icons.other}</>
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [campaignLinks, setCampaignLinks] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newLink, setNewLink] = useState({ name: '', type: 'hotel' })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchRestaurants()
      fetchSubscription()
    }
  }, [user])

  // Calculate restaurant limits and separate by status
  let maxRestaurants = 1
  if (subscription?.plan === 'pro') maxRestaurants = 3
  else if (subscription?.plan === 'business') maxRestaurants = 15
  
  const restaurantCount = restaurants.length
  const approvedRestaurants = restaurants.filter((r) => r.claim_status === 'approved' || (r.is_claimed && !r.claim_status))
  const pendingRestaurants = restaurants.filter((r) => r.claim_status === 'pending')
  const rejectedRestaurants = restaurants.filter((r) => r.claim_status === 'rejected')

  useEffect(() => {
    if (approvedRestaurants.length > 0) {
      // Auto-select first approved restaurant if none selected
      if (!selectedRestaurant || !approvedRestaurants.find((r) => r.id === selectedRestaurant)) {
        setSelectedRestaurant(approvedRestaurants[0].id)
      }
    }
  }, [restaurants, approvedRestaurants, selectedRestaurant])

  useEffect(() => {
    if (selectedRestaurant) {
      fetchAnalytics()
      fetchCampaignLinks()
    }
  }, [selectedRestaurant, selectedPeriod])

  const fetchRestaurants = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, slug, name, tagline, address, phone, website, rating, review_count, is_claimed, claim_status, created_at, country_code, restaurant_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRestaurants(data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    if (!selectedRestaurant) return

    try {
      const response = await fetch(`/api/analytics/${selectedRestaurant}?period=${selectedPeriod}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchCampaignLinks = async () => {
    if (!selectedRestaurant) return

    try {
      const response = await fetch(`/api/campaigns/${selectedRestaurant}`)
      if (!response.ok) throw new Error('Failed to fetch campaigns')
      const data = await response.json()
      setCampaignLinks(data.campaigns || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const fetchSubscription = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/stripe/subscription-status?userId=${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch subscription')
      const data = await response.json()
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const handleCreateLink = async () => {
    if (!newLink.name.trim() || !selectedRestaurant) return

    try {
      const response = await fetch(`/api/campaigns/${selectedRestaurant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLink.name,
          type: newLink.type
        })
      })

      if (!response.ok) throw new Error('Failed to create campaign')
      await fetchCampaignLinks()
      setNewLink({ name: '', type: 'hotel' })
      setShowModal(false)
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign link')
    }
  }

  const handleDeleteLink = async (campaignId: string) => {
    if (!selectedRestaurant) return

    try {
      const response = await fetch(`/api/campaigns/${selectedRestaurant}?id=${campaignId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete campaign')
      await fetchCampaignLinks()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Failed to delete campaign link')
    }
  }

  const handleCopyLink = (url: string) => {
    const fullUrl = 'https://bite.reserve/' + url
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(url)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const currentRestaurant = restaurants.find((r) => r.id === selectedRestaurant)
  
  let restaurantUrl: string | null = null
  if (currentRestaurant?.country_code && currentRestaurant?.restaurant_number) {
    restaurantUrl = `/r/${currentRestaurant.country_code}/${currentRestaurant.restaurant_number}`
  } else if (currentRestaurant) {
    restaurantUrl = `/restaurant/${currentRestaurant.slug}`
  }

  const canClaimMore = restaurantCount < maxRestaurants

  let planName = 'Free'
  if (subscription?.plan) {
    planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <div className="flex items-center gap-3">
                  <p className="text-gray-600">
                    Welcome back, <span className="font-semibold text-gray-900">{user?.email}</span>
                  </p>
                  {subscription && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      subscription.plan === 'free'
                        ? 'bg-gray-100 text-gray-700'
                        : subscription.plan === 'pro'
                        ? 'bg-accent-100 text-accent-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {planName} Plan
                      {subscription.status === 'trialing' && ' (Trial)'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {restaurants.length > 0 && (
                  <Link
                    href="/dashboard/settings"
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                )}
                {subscription?.stripe_customer_id && (
                  <Link
                    href="/dashboard/subscription"
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Manage Subscription
                  </Link>
                )}
                {canClaimMore && (
                  <Link
                    href="/claim"
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Claim Restaurant
                  </Link>
                )}
              </div>
            </div>

            {/* Restaurant Selector - Only show if multiple restaurants */}
            {restaurants.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Restaurant</label>
                <select
                  value={selectedRestaurant || ''}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full sm:w-auto min-w-[250px] px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              {/* Restaurant Status Overview */}
              <div className="mb-6 space-y-4">
                {/* Restaurant Count Badge */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Restaurants</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {restaurantCount} / {maxRestaurants}
                      </p>
                    </div>
                    {canClaimMore && (
                      <Link
                        href="/claim"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Restaurant
                      </Link>
                    )}
                  </div>
                </div>

                {/* Pending Restaurants */}
                {pendingRestaurants.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending Verification ({pendingRestaurants.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="bg-white rounded-lg p-4 border border-amber-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{restaurant.name}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Submitted {new Date(restaurant.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                              Pending
                            </span>
                          </div>
                          <p className="text-sm text-amber-800 mt-3">
                            We're verifying your restaurant information. You'll receive an email once it's approved (usually within 24 hours).
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected Restaurants */}
                {rejectedRestaurants.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Rejected Claims ({rejectedRestaurants.length})
                    </h3>
                    <div className="space-y-3">
                      {rejectedRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="bg-white rounded-lg p-4 border border-red-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{restaurant.name}</p>
                            </div>
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              Rejected
                            </span>
                          </div>
                          <p className="text-sm text-red-800 mt-3">
                            Your claim was rejected. Please check your email for details or contact support.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Approved Restaurants Dashboard */}
              {approvedRestaurants.length > 0 && selectedRestaurant && currentRestaurant ? (
                <div key="approved-dashboard">
                  {/* Restaurant Header */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentRestaurant.name}</h2>
                        {currentRestaurant.tagline && (
                          <p className="text-gray-600 mb-3">{currentRestaurant.tagline}</p>
                        )}
                        <div className="flex items-center gap-4 flex-wrap">
                          {restaurantUrl && (
                            <Link
                              href={restaurantUrl}
                              className="inline-flex items-center gap-2 text-sm text-accent-600 hover:text-accent-700 font-semibold"
                            >
                              View Public Page
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                          )}
                          <Link
                            href={`/dashboard/edit?id=${currentRestaurant.id}`}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Information
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Period Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Performance</h3>
                  <p className="text-gray-500 text-sm mt-1">Track how guests engage</p>
                </div>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200 overflow-x-auto">
                  {timePeriods.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedPeriod === period.value
                          ? 'bg-accent-500 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              {analyticsData && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Page Views</span>
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totals?.pageViews?.toLocaleString() || '0'}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Phone Clicks</span>
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totals?.phoneClicks?.toLocaleString() || '0'}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Reservations</span>
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totals?.reservationClicks?.toLocaleString() || '0'}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Conversion</span>
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.totals?.pageViews > 0
                        ? ((analyticsData.totals.reservationClicks / analyticsData.totals.pageViews) * 100).toFixed(1)
                        : '0.0'}%
                    </p>
                  </div>
                </div>
              )}

              {/* Chart and Sources */}
              {analyticsData && (
                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                  {/* Chart */}
                  <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic & Bookings</h3>
                    {analyticsData.chartData && analyticsData.chartData.length > 0 ? (
                      <div className="h-64 flex items-end justify-between gap-1">
                        {analyticsData.chartData.map((point: any, i: number) => {
                          const maxViews = Math.max(...analyticsData.chartData.map((p: any) => p.pageViews || 0), 1)
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
                    {analyticsData.sources && analyticsData.sources.length > 0 ? (
                      <div className="space-y-4">
                        {analyticsData.sources.slice(0, 5).map((source: any, i: number) => {
                          const totalVisits = analyticsData.sources.reduce((sum: number, s: any) => sum + s.visits, 0)
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
              )}

              {/* Campaign Links Section */}
              <div className="mt-8">
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-t-xl p-4 sm:p-6 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Campaign Links</h3>
                      <p className="text-white/80 text-xs sm:text-base">Track where your guests come from</p>
                    </div>
                    <button 
                      onClick={() => setShowModal(true)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-accent-600 font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Link
                    </button>
                  </div>
                </div>

                {/* Campaign Links - Card View on Mobile, Table on Desktop */}
                <div className="bg-white rounded-b-xl sm:rounded-b-2xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
                  {campaignLinks.length > 0 ? (
                    <>
                      {/* Mobile Card View */}
                      <div className="sm:hidden divide-y divide-gray-100">
                        {campaignLinks.map((link) => {
                          const typeInfo = campaignTypes.find(t => t.value === link.type)
                          const convRate = link.clicks > 0 ? ((link.reservations / link.clicks) * 100).toFixed(1) : '0.0'
                          const fullUrl = currentRestaurant?.country_code && currentRestaurant?.restaurant_number
                            ? `r/${currentRestaurant.country_code}/${currentRestaurant.restaurant_number}?ref=${link.slug}`
                            : `bite.reserve/...?ref=${link.slug}`
                          const typeColors: Record<string, string> = {
                            hotel: 'bg-purple-100 text-purple-600',
                            influencer: 'bg-yellow-100 text-yellow-600',
                            social: 'bg-pink-100 text-pink-600',
                            email: 'bg-blue-100 text-blue-600',
                            qr: 'bg-gray-100 text-gray-600',
                            ads: 'bg-orange-100 text-orange-600',
                            other: 'bg-slate-100 text-slate-600',
                          }
                          
                          return (
                            <div key={link.id} className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`p-2 rounded-lg ${typeColors[link.type]}`}>
                                    <CampaignIcon type={link.type} className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 text-sm">{link.name}</p>
                                    <p className="text-[10px] text-gray-500">{typeInfo?.label}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteLink(link.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500">Clicks</span>
                                  <p className="font-bold text-gray-900">{link.clicks || 0}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Bookings</span>
                                  <p className="font-bold text-accent-600">{link.reservations || 0}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Rate</span>
                                  <p className="font-bold text-gray-900">{convRate}%</p>
                                </div>
                                <button
                                  onClick={() => handleCopyLink(fullUrl)}
                                  className={`ml-auto p-2 rounded-lg ${copiedId === fullUrl ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                                >
                                  {copiedId === fullUrl ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Campaign</th>
                              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Link</th>
                              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Clicks</th>
                              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Bookings</th>
                              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Rate</th>
                              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {campaignLinks.map((link) => {
                              const typeInfo = campaignTypes.find(t => t.value === link.type)
                              const convRate = link.clicks > 0 ? ((link.reservations / link.clicks) * 100).toFixed(1) : '0.0'
                              const fullUrl = currentRestaurant?.country_code && currentRestaurant?.restaurant_number
                                ? `r/${currentRestaurant.country_code}/${currentRestaurant.restaurant_number}?ref=${link.slug}`
                                : `bite.reserve/...?ref=${link.slug}`
                              const typeColors: Record<string, string> = {
                                hotel: 'bg-purple-100 text-purple-600',
                                influencer: 'bg-yellow-100 text-yellow-600',
                                social: 'bg-pink-100 text-pink-600',
                                email: 'bg-blue-100 text-blue-600',
                                qr: 'bg-gray-100 text-gray-600',
                                ads: 'bg-orange-100 text-orange-600',
                                other: 'bg-slate-100 text-slate-600',
                              }
                              
                              return (
                                <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2.5 rounded-xl ${typeColors[link.type]}`}>
                                        <CampaignIcon type={link.type} className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900">{link.name}</p>
                                        <p className="text-xs text-gray-500">{typeInfo?.label}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">{fullUrl}</code>
                                      <button
                                        onClick={() => handleCopyLink(fullUrl)}
                                        className={`p-1.5 rounded-lg transition-colors ${copiedId === fullUrl ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                      >
                                        {copiedId === fullUrl ? (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        ) : (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center font-bold text-gray-900">{link.clicks?.toLocaleString() || 0}</td>
                                  <td className="px-6 py-4 text-center font-bold text-accent-600">{link.reservations || 0}</td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                      parseFloat(convRate) >= 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {convRate}%
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => handleDeleteLink(link.id)}
                                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-4">No campaign links yet</p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                      >
                        Create Your First Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
                </div>
              ) : approvedRestaurants.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Waiting for Approval</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your restaurant claims are being verified. You'll receive an email once they're approved.
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full sm:rounded-2xl sm:max-w-lg overflow-hidden animate-fade-in-scale rounded-t-2xl sm:rounded-b-2xl">
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-xl font-bold text-white">Create Campaign Link</h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-white/80 hover:text-white">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  placeholder="e.g., Grand Hotel, Newsletter"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm sm:text-base"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Source Type</label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {campaignTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewLink({ ...newLink, type: type.value })}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-xs sm:text-sm ${
                        newLink.type === type.value
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <CampaignIcon type={type.value} className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {newLink.name && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Preview</p>
                  <code className="text-xs sm:text-sm text-accent-600 font-mono break-all">
                    {currentRestaurant?.country_code && currentRestaurant?.restaurant_number
                      ? `r/${currentRestaurant.country_code}/${currentRestaurant.restaurant_number}?ref=${newLink.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
                      : `bite.reserve/...?ref=${newLink.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
                    }
                  </code>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex items-center justify-end gap-2 sm:gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 sm:px-5 py-2 sm:py-2.5 text-gray-600 font-medium text-sm sm:text-base">
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                disabled={!newLink.name.trim()}
                className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all ${
                  newLink.name.trim()
                    ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
