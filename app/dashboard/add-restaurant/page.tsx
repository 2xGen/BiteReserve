'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { showToast } from '@/components/Toast'

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

function AddRestaurantContent() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    restaurantName: '',
    city: '',
    country: '', // Country name (simple text input)
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RestaurantSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantSearchResult | null>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Pre-fill form from restaurant data
  const prefillFormFromRestaurant = (restaurant: RestaurantSearchResult) => {
    const addressParts = restaurant.address?.split(',').map(s => s.trim()) || []
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2] : ''
    const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : ''

    setFormData(prev => ({
      ...prev,
      restaurantName: restaurant.name || '',
      city: city,
      country: country,
    }))
    
    setShowSearchResults(false)
    setSearchQuery('')
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
    if (!user?.id) {
      showToast('Please log in to add a restaurant', 'warning')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/restaurants/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          restaurantId: selectedRestaurant?.id || null,
          restaurantName: formData.restaurantName,
          city: formData.city,
          country: formData.country, // Country name (admin will set ISO code and restaurant number manually)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add restaurant')
      }

      // Redirect to complete page
      router.push(`/dashboard/add-restaurant/complete?restaurant_id=${data.restaurantId}`)
    } catch (error) {
      console.error('Add restaurant error:', error)
      showToast(error instanceof Error ? error.message : 'Failed to add restaurant. Please try again.', 'error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Add Another Restaurant</h1>
            <p className="text-gray-600">
              Add an additional restaurant to your account. We'll verify it within 24 hours and create your restaurant page.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Search Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Is your restaurant already listed?
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Search to see if we already have your restaurant's information. If found, we'll pre-fill the form for you.
                </p>
                <div className="relative" data-search-container>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by restaurant name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-accent-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
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
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedRestaurant && (
                  <div className="mt-4 p-4 bg-accent-50 border border-accent-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-accent-900">Selected: {selectedRestaurant.name}</p>
                      {selectedRestaurant.address && (
                        <p className="text-sm text-accent-700 mt-1">{selectedRestaurant.address}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-accent-600 hover:text-accent-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Restaurant Information */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="restaurantName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      id="restaurantName"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      required
                      placeholder="e.g., La Terrazza del Mare"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Barcelona"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Spain, Netherlands, United States"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors"
                >
                  {isSubmitting ? 'Adding Restaurant...' : 'Continue to Add Details'}
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function AddRestaurantPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-accent-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <AddRestaurantContent />
      </Suspense>
    </ProtectedRoute>
  )
}
