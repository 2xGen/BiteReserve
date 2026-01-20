'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface RestaurantSearchResult {
  id: string
  name: string
  tagline: string | null
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  cuisine: string[] | null
  country_code: string
  restaurant_number: string
  is_claimed: boolean
}

const cuisineOptions = [
  'Italian', 'French', 'Spanish', 'Mediterranean', 'Japanese', 'Chinese', 
  'Thai', 'Indian', 'Mexican', 'American', 'Seafood', 'Steakhouse', 
  'Vegetarian', 'Vegan', 'Fine Dining', 'Casual Dining', 'Tapas', 'Sushi',
  'Pizza', 'Bistro', 'Farm-to-Table', 'Fusion', 'Other'
]

function ClaimPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  
  // All hooks must be declared before any conditional returns
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    city: '',
    country: '',
  })
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'business'>('free')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RestaurantSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantSearchResult | null>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Check if user was canceled from Stripe Checkout
  const canceled = searchParams.get('canceled') === 'true'
  
  // ALL useEffect hooks must be declared before conditional returns
  // Show cancel message if user canceled checkout
  useEffect(() => {
    if (canceled) {
      alert('Checkout was canceled. Your restaurant claim has been saved, but your subscription was not started. You can try again from your dashboard.')
    }
  }, [canceled])

  // Pre-fill email and name from logged-in user (required)
  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({ 
        ...prev, 
        email: user.email || '',
        ownerName: prev.ownerName || (user.user_metadata?.name || '')
      }))
    }
  }, [user])

  // Define functions before useEffect hooks that use them
  // Lookup specific restaurant by country/id
  const handleRestaurantLookup = async (country: string, id: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/restaurants/search?country=${encodeURIComponent(country)}&id=${encodeURIComponent(id)}`)
      const data = await response.json()
      
      if (data.restaurants && data.restaurants.length > 0) {
        const restaurant = data.restaurants[0]
        setSelectedRestaurant(restaurant)
        prefillFormFromRestaurant(restaurant)
      }
    } catch (error) {
      console.error('Lookup error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Pre-fill form from restaurant data
  const prefillFormFromRestaurant = (restaurant: RestaurantSearchResult) => {
    // Extract city and country from address
    const addressParts = restaurant.address?.split(',').map(s => s.trim()) || []
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2] : ''
    const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : ''

    setFormData(prev => ({
      ...prev,
      restaurantName: restaurant.name || '',
      city: city,
      country: country || restaurant.country_code.toUpperCase(),
    }))
    
    setShowSearchResults(false)
    setSearchQuery('')
  }

  // Check URL params for restaurant lookup (from restaurant page)
  useEffect(() => {
    const country = searchParams.get('country')
    const id = searchParams.get('id')
    
    if (country && id && user) { // Only lookup if user is logged in
      handleRestaurantLookup(country, id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user])

  // Close search results when clicking outside
  useEffect(() => {
    if (!showSearchResults) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-search-container]')) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSearchResults])
  
  // Show login prompt if not authenticated (after all hooks)
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow">
          {/* Hero */}
          <section className="relative py-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700"></div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Claim Your Restaurant
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Get your free BiteReserve page and start tracking where your guests come from.
              </p>
            </div>
          </section>

          {/* Login Required Message */}
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
            <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Account Required
                </h2>
                
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  You need to have an account to claim a restaurant. This ensures you can access your dashboard and manage your restaurant page.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Free Account
                  </Link>
                  
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }
  
  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Search restaurants
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/restaurants/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.restaurants || [])
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Select a restaurant from search results
  const handleSelectRestaurant = (restaurant: RestaurantSearchResult) => {
    setSelectedRestaurant(restaurant)
    prefillFormFromRestaurant(restaurant)
  }

  // Clear selected restaurant and reset form
  const handleClearSelection = () => {
    setSelectedRestaurant(null)
    setFormData(prev => ({
      ...prev,
      restaurantName: '',
      city: '',
      country: '',
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // User info (use logged-in user's data)
          email: user?.email || formData.email, // Use logged-in user's email
          ownerName: formData.ownerName,
          phone: formData.phone,
          userId: user?.id, // Pass logged-in user's ID
          // Restaurant info
          restaurantId: selectedRestaurant?.id || null, // If claiming existing restaurant
          restaurantName: formData.restaurantName,
          city: formData.city,
          country: formData.country,
          // Plan selection
          selectedPlan,
          billingCycle: (selectedPlan === 'pro' || selectedPlan === 'business') ? billingCycle : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim')
      }

      // If Pro/Business plan, redirect to Stripe Checkout
      if (data.checkoutUrl && data.requiresPayment) {
        window.location.href = data.checkoutUrl
        return
      }

      // Success - show success screen (for Free plan)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Claim submission error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit claim. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Claim Submitted!</h1>
            <p className="text-lg text-gray-600 mb-4">
              We've received your restaurant claim request. Our team will manually verify your submission within 24 hours by checking your restaurant's information against public data sources (primarily Google Business Profile) to ensure URLs, booking links, and contact details match.
            </p>
            <p className="text-base text-gray-600 mb-8">
              Once verified, you'll receive an email at <span className="font-semibold text-gray-900">{formData.email}</span> with your dashboard login details and your BiteReserve page will be activated.
            </p>
            
            {selectedPlan === 'pro' && (
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-6">
                <p className="text-accent-800 font-semibold">🎉 You've started your 14-day Pro trial!</p>
                <p className="text-accent-700 text-sm mt-1">Full access to all features. No card required.</p>
              </div>
            )}
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-3">What happens next?</h3>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>We verify your restaurant information (within 24 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Your BiteReserve page is activated</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You receive your dashboard login via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Start creating tracking links</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>See where your guests come from!</span>
                </li>
              </ul>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Claim Your Restaurant
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Get your free BiteReserve page and start tracking where your guests come from.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Set up in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Edit anytime</span>
              </div>
            </div>

            {/* Verification Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-base font-bold text-amber-900 mb-2">Manual Verification Required</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    After you submit your claim, we'll manually verify your request within 24 hours. We'll check your restaurant's information against public data sources (primarily Google Business Profile) to verify that URLs, booking links, and contact details match. Once verified, your BiteReserve page will be activated and you'll receive an email confirmation.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="space-y-6">
                
                {/* Restaurant Lookup */}
                {!selectedRestaurant && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Is your restaurant already listed?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Search to see if we already have your restaurant's information from Google Places. If found, we'll pre-fill the form for you.
                    </p>
                    <div className="relative" data-search-container>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && searchResults.length > 0 && setShowSearchResults(true)}
                        placeholder="Search by restaurant name..."
                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((restaurant) => (
                            <button
                              key={restaurant.id}
                              type="button"
                              onClick={() => handleSelectRestaurant(restaurant)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-semibold text-gray-900">{restaurant.name}</div>
                              {restaurant.address && (
                                <div className="text-sm text-gray-600 mt-1">{restaurant.address}</div>
                              )}
                              {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">{restaurant.cuisine.join(', ')}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500">
                          No restaurants found. Continue filling out the form below.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Restaurant Info */}
                {selectedRestaurant && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <h3 className="font-bold text-gray-900">Restaurant Found!</h3>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          We found <strong>{selectedRestaurant.name}</strong> in our database. The form below has been pre-filled with information from <strong>Google Places API</strong>.
                        </p>
                        <p className="text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                          <strong>Note:</strong> This data was automatically imported from Google Places. Please review and update any information that needs correction.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        title="Clear selection"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Restaurant Info */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Restaurant Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Restaurant Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="restaurantName"
                        value={formData.restaurantName}
                        onChange={handleChange}
                        required
                        placeholder="e.g., La Terrazza del Mare"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          placeholder="e.g., Barcelona"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          placeholder="e.g., Spain"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You'll be able to add your full address, phone, website, and other details after completing your payment.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Contact Info */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Your Contact Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        required
                        placeholder="Full name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@restaurant.com"
                        disabled={!!user} // Disable if user is logged in (can't change email)
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                      {user && (
                        <p className="text-xs text-gray-500 mt-1">This email is linked to your account.</p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Plan Selection */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Choose Your Plan
                  </h2>
                  
                  {/* Trial Notice for Pro/Business */}
                  {(selectedPlan === 'pro' || selectedPlan === 'business') && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">14-Day Trial Starts After Verification</p>
                          <p className="text-sm text-blue-800">
                            Your 14-day trial will begin once your restaurant is verified (usually within 24 hours). This ensures you get the full trial period to use all features.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Free Plan */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('free')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPlan === 'free'
                          ? 'border-accent-500 bg-accent-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">Free Plan</span>
                        <span className="text-2xl font-black text-gray-900">$0</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          25 guest actions/month
                        </li>
                        <li className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          3 tracking links
                        </li>
                        <li className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          14 days analytics
                        </li>
                      </ul>
                      {selectedPlan === 'free' && (
                        <div className="mt-3 flex items-center gap-1.5 text-accent-600 font-semibold text-sm">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Selected
                        </div>
                      )}
                    </button>

                    {/* Pro Trial */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('pro')}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                        selectedPlan === 'pro'
                          ? 'border-accent-500 bg-accent-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="absolute -top-2.5 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        RECOMMENDED
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">14-Day Pro Trial</span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-gray-900">$0</span>
                          <span className="text-xs text-gray-500 block">
                            {selectedPlan === 'pro' && billingCycle === 'annual' 
                              ? 'then $290/year' 
                              : 'then $29/mo'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Billing Cycle Toggle - Only show for Pro plan */}
                      {selectedPlan === 'pro' && (
                        <div className="mb-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Billing Cycle</span>
                            <span className="text-xs text-gray-500">
                              {billingCycle === 'annual' ? 'Save 2 months' : 'Monthly'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setBillingCycle('monthly')
                              }}
                              className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all text-left ${
                                billingCycle === 'monthly'
                                  ? 'bg-accent-600 text-white border-2 border-accent-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                              }`}
                            >
                              $29/mo
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setBillingCycle('annual')
                              }}
                              className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all relative text-left ${
                                billingCycle === 'annual'
                                  ? 'bg-accent-600 text-white border-2 border-accent-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                              }`}
                            >
                              $290/year
                              {billingCycle === 'annual' && (
                                <span className="absolute top-2 right-3 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">2 mo free</span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Up to <strong>3 restaurants</strong>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <strong>Unlimited</strong> guest actions
                        </li>
                        <li className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <strong>Unlimited</strong> tracking links
                        </li>
                        <li className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          90 days analytics + reports
                        </li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Cancel anytime. You won't be charged until trial ends.</p>
                      {selectedPlan === 'pro' && (
                        <div className="mt-2 flex items-center gap-1.5 text-accent-600 font-semibold text-sm">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Selected
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Business Plan - Subtle Option */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('business')}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedPlan === 'business'
                          ? 'border-accent-500 bg-accent-50'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">Business Plan</span>
                            <span className="text-xs text-gray-500">• Multiple restaurants</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>
                              {selectedPlan === 'business' && billingCycle === 'annual'
                                ? '$990/year'
                                : '$99/mo'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>Up to 15 restaurants</span>
                            <span className="text-gray-400">•</span>
                            <span>365 days analytics</span>
                          </div>
                          
                          {/* Billing Cycle Toggle - Only show for Business plan */}
                          {selectedPlan === 'business' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">Billing Cycle</span>
                                <span className="text-xs text-gray-500">
                                  {billingCycle === 'annual' ? 'Save 2 months' : 'Monthly'}
                                </span>
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setBillingCycle('monthly')
                                  }}
                                  className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all text-left ${
                                    billingCycle === 'monthly'
                                      ? 'bg-accent-600 text-white border-2 border-accent-700'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                                  }`}
                                >
                                  $99/mo
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setBillingCycle('annual')
                                  }}
                                  className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all relative text-left ${
                                    billingCycle === 'annual'
                                      ? 'bg-accent-600 text-white border-2 border-accent-700'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                                  }`}
                                >
                                  $990/year
                                  {billingCycle === 'annual' && (
                                    <span className="absolute top-2 right-3 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">2 mo free</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedPlan === 'business' && (
                          <svg className="w-5 h-5 text-accent-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating your page...
                      </>
                    ) : (
                      <>
                        {selectedPlan === 'free'
                          ? 'Claim My Restaurant — Free'
                          : selectedPlan === 'pro'
                          ? `Start My 14-Day Pro Trial${billingCycle === 'annual' ? ' (Annual)' : ''}`
                          : `Start Business Plan${billingCycle === 'annual' ? ' (Annual)' : ''}`
                        }
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    By submitting, you agree to our <a href="#" className="text-accent-600 hover:underline">Terms</a> and <a href="#" className="text-accent-600 hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </form>

            {/* FAQ */}
            <div className="mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Common Questions</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Is it really free?</h4>
                  <p className="text-gray-600 text-sm">Yes! The free plan includes 25 guest actions per month, 3 tracking links, and 14 days of analytics. Upgrade only if you need more.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">When does my trial start?</h4>
                  <p className="text-gray-600 text-sm">Your 14-day trial starts after your restaurant is verified (usually within 24 hours). This ensures you get the full trial period to use all features, not time spent waiting for verification.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">What happens after the Pro trial?</h4>
                  <p className="text-gray-600 text-sm">After 14 days, your Pro subscription continues at $29/mo. You can cancel anytime from your dashboard if you'd prefer the Free plan.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Can I edit my information later?</h4>
                  <p className="text-gray-600 text-sm">Absolutely. Once you have your dashboard login, you can edit all your restaurant details anytime.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">What happens after I submit my claim?</h4>
                  <p className="text-gray-600 text-sm">We'll manually verify your restaurant information within 24 hours by checking it against public data sources (primarily Google Business Profile). Once verified, you'll receive an email with your dashboard login and your BiteReserve page will be activated. If we need additional information (like your Google Business Profile link), we'll email you.</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ClaimPageContent />
    </Suspense>
  )
}
