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

const bookingPlatformOptions = [
  { value: 'website', label: 'Our own website' },
  { value: 'opentable', label: 'OpenTable' },
  { value: 'resy', label: 'Resy' },
  { value: 'thefork', label: 'TheFork / LaFourchette' },
  { value: 'bookatable', label: 'Bookatable' },
  { value: 'quandoo', label: 'Quandoo' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone only' },
  { value: 'email', label: 'Email' },
  { value: 'instagram', label: 'Instagram DM' },
  { value: 'none', label: 'No online booking yet' },
  { value: 'other', label: 'Other' }
]

function ClaimPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: '',
    cuisineTypes: [] as string[],
    bookingPlatforms: [] as string[],
    howDidYouHear: '',
    notes: ''
  })
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RestaurantSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantSearchResult | null>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user && user.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }))
    }
  }, [user])

  // Check URL params for restaurant lookup (from restaurant page)
  useEffect(() => {
    const country = searchParams.get('country')
    const id = searchParams.get('id')
    
    if (country && id) {
      handleRestaurantLookup(country, id)
    }
  }, [searchParams])

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
      address: restaurant.address || '',
      city: city,
      country: country || restaurant.country_code.toUpperCase(),
      website: restaurant.website || '',
      cuisineTypes: restaurant.cuisine || [],
    }))
    
    setShowSearchResults(false)
    setSearchQuery('')
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
      address: '',
      city: '',
      country: '',
      website: '',
      cuisineTypes: [],
    }))
  }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleCuisine = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }))
  }

  const toggleBookingPlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      bookingPlatforms: prev.bookingPlatforms.includes(platform)
        ? prev.bookingPlatforms.filter(p => p !== platform)
        : [...prev.bookingPlatforms, platform]
    }))
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
          // User info
          email: formData.email,
          ownerName: formData.ownerName,
          phone: formData.phone,
          // Restaurant info
          restaurantId: selectedRestaurant?.id || null, // If claiming existing restaurant
          restaurantName: formData.restaurantName,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          website: formData.website,
          cuisineTypes: formData.cuisineTypes,
          bookingPlatforms: formData.bookingPlatforms,
          // Plan selection
          selectedPlan,
          // Optional
          howDidYouHear: formData.howDidYouHear,
          notes: formData.notes
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim')
      }

      // Success - show success screen
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">You're on the list!</h1>
            <p className="text-lg text-gray-600 mb-8">
              We'll review your submission and get your BiteReserve page set up within 24 hours. 
              You'll receive an email at <span className="font-semibold text-gray-900">{formData.email}</span> with your login details.
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
                  <span>We create your BiteReserve page</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You get your dashboard login</span>
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Full Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street address"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                      />
                    </div>
                    
                    {/* Cuisine Types - Multi Select */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cuisine Type(s)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {cuisineOptions.map((cuisine) => (
                          <button
                            key={cuisine}
                            type="button"
                            onClick={() => toggleCuisine(cuisine)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              formData.cuisineTypes.includes(cuisine)
                                ? 'bg-accent-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {cuisine}
                          </button>
                        ))}
                      </div>
                      {formData.cuisineTypes.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Selected: {formData.cuisineTypes.join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                      />
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
                    <div className="grid md:grid-cols-2 gap-4">
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 234 567 8900"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Optional Info */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    A Few More Details
                    <span className="text-sm font-normal text-gray-400 ml-2">(optional)</span>
                  </h2>
                  <div className="space-y-4">
                    
                    {/* Booking Platforms - Multi Select */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        How do guests currently book with you?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {bookingPlatformOptions.map((platform) => (
                          <button
                            key={platform.value}
                            type="button"
                            onClick={() => toggleBookingPlatform(platform.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                              formData.bookingPlatforms.includes(platform.value)
                                ? 'bg-accent-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {platform.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        How did you hear about us?
                      </label>
                      <select
                        name="howDidYouHear"
                        value={formData.howDidYouHear}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors bg-white"
                      >
                        <option value="">Select one...</option>
                        <option value="google">Google search</option>
                        <option value="social">Social media</option>
                        <option value="referral">Another restaurant</option>
                        <option value="hotel">Hotel partner</option>
                        <option value="2xgen">2xGen</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Anything else we should know?
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Tell us about your restaurant, partners, or specific needs..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Plan Selection */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Choose Your Plan
                  </h2>
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
                          <span className="text-xs text-gray-500 block">then $29/mo</span>
                        </div>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
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
                        {selectedPlan === 'pro' ? 'Start My 14-Day Pro Trial' : 'Claim My Restaurant — Free'}
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
                  <h4 className="font-semibold text-gray-900 mb-1">What happens after the Pro trial?</h4>
                  <p className="text-gray-600 text-sm">After 14 days, your Pro subscription continues at $29/mo. You can cancel anytime from your dashboard if you'd prefer the Free plan.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Can I edit my information later?</h4>
                  <p className="text-gray-600 text-sm">Absolutely. Once you have your dashboard login, you can edit all your restaurant details anytime.</p>
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
