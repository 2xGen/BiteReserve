'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const cuisineOptions = [
  'Italian', 'French', 'Spanish', 'Mediterranean', 'Japanese', 'Chinese', 
  'Thai', 'Indian', 'Mexican', 'American', 'Seafood', 'Steakhouse', 
  'Vegetarian', 'Vegan', 'Fine Dining', 'Casual Dining', 'Tapas', 'Sushi',
  'Pizza', 'Bistro', 'Farm-to-Table', 'Fusion', 'Other'
]

function CompleteClaimContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const sessionId = searchParams.get('session_id')
  const userId = searchParams.get('user_id')
  const restaurantId = searchParams.get('restaurant_id')
  
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    website: '',
    cuisineTypes: [] as string[],
    description: '',
  })

  useEffect(() => {
    if (sessionId && userId && restaurantId) {
      fetchRestaurant()
    } else {
      setLoading(false)
    }
  }, [sessionId, userId, restaurantId])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurants/by-id/${restaurantId}`)
      if (!response.ok) throw new Error('Failed to fetch restaurant')
      const data = await response.json()
      setRestaurant(data.restaurant)
      
      // Pre-fill if data exists
      if (data.restaurant) {
        setFormData(prev => ({
          ...prev,
          address: data.restaurant.address || '',
          phone: data.restaurant.phone || '',
          website: data.restaurant.website || '',
          cuisineTypes: data.restaurant.cuisine || [],
          description: data.restaurant.description || '',
        }))
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCuisine = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantId) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/restaurants/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          address: formData.address || null,
          phone: formData.phone || null,
          website: formData.website || null,
          cuisine: formData.cuisineTypes.length > 0 ? formData.cuisineTypes : null,
          description: formData.description || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete restaurant details')
      }

      setIsComplete(true)
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error completing restaurant:', error)
      alert(error instanceof Error ? error.message : 'Failed to save details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
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

  if (!sessionId || !userId || !restaurantId) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="max-w-lg mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Request</h1>
            <p className="text-lg text-gray-600 mb-8">Missing required information. Please try claiming again.</p>
            <Link
              href="/claim"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors"
            >
              Go to Claim Page
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">All Set!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your restaurant details have been saved. Redirecting to your dashboard...
            </p>
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
              Complete Your Restaurant Details
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
              Add your restaurant information to get your BiteReserve page ready for verification.
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 max-w-2xl mx-auto">
              <p className="text-white text-sm">
                <strong>⏳ Your 14-day trial will start after verification</strong> (usually within 24 hours). This ensures you get the full trial period to use all features.
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="space-y-6">
                {/* Restaurant Name (read-only) */}
                {restaurant && (
                  <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-accent-800 font-semibold mb-1">Restaurant</p>
                    <p className="text-lg font-bold text-accent-900">{restaurant.name}</p>
                  </div>
                )}

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address, City, Country"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number
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

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourrestaurant.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                  />
                </div>

                {/* Cuisine Types */}
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

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your restaurant..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
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
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete & Go to Dashboard
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    You can always edit these details later in your dashboard.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function CompleteClaimPage() {
  return (
    <Suspense fallback={
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
    }>
      <CompleteClaimContent />
    </Suspense>
  )
}
