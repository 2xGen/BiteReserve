'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const cuisineOptions = [
  'Italian', 'French', 'Spanish', 'Mediterranean', 'Japanese', 'Chinese', 
  'Thai', 'Indian', 'Mexican', 'American', 'Seafood', 'Steakhouse', 
  'Vegetarian', 'Vegan', 'Fine Dining', 'Casual Dining', 'Tapas', 'Sushi',
  'Pizza', 'Bistro', 'Farm-to-Table', 'Fusion', 'Other'
]

const featureOptions = [
  'Outdoor Seating', 'Ocean View', 'Private Dining', 'Full Bar', 'Valet Parking',
  'Live Music', 'WiFi', 'Pet Friendly', 'Wheelchair Accessible', 'Parking',
  'Takeout', 'Delivery', 'Reservations', 'Happy Hour', 'Brunch', 'Late Night',
  'Romantic', 'Family Friendly', 'Groups', 'Business Dining', 'Date Night'
]

function CompleteAddRestaurantContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const restaurantId = searchParams.get('restaurant_id')
  
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [formData, setFormData] = useState({
    tagline: '',
    address: '',
    phone: '',
    website: '',
    cuisineTypes: [] as string[],
    features: [] as string[],
    description: '',
    googleBusinessProfile: '',
    priceLevel: '',
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
  })

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant()
    } else {
      setLoading(false)
    }
  }, [restaurantId])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurants/by-id/${restaurantId}`)
      if (!response.ok) throw new Error('Failed to fetch restaurant')
      const data = await response.json()
      setRestaurant(data.restaurant)
      
      // Pre-fill if data exists
      if (data.restaurant) {
        let hoursObj: { monday: string; tuesday: string; wednesday: string; thursday: string; friday: string; saturday: string; sunday: string } = {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: '',
        }
        
        if (data.restaurant.hours) {
          if (typeof data.restaurant.hours === 'object' && !Array.isArray(data.restaurant.hours)) {
            hoursObj = { ...hoursObj, ...data.restaurant.hours } as typeof hoursObj
          }
        }
        
        setFormData(prev => ({
          ...prev,
          tagline: data.restaurant.tagline || '',
          address: data.restaurant.address || '',
          phone: data.restaurant.phone || '',
          website: data.restaurant.website || '',
          cuisineTypes: data.restaurant.cuisine || [],
          features: data.restaurant.features || [],
          description: data.restaurant.description || '',
          priceLevel: data.restaurant.price_level || '',
          hours: hoursObj,
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

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value,
      }
    }))
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
          tagline: formData.tagline || null,
          address: formData.address || null,
          phone: formData.phone || null,
          website: formData.website || null,
          cuisine: formData.cuisineTypes.length > 0 ? formData.cuisineTypes : null,
          features: formData.features.length > 0 ? formData.features : null,
          description: formData.description || null,
          priceLevel: formData.priceLevel || null,
          hours: formData.hours,
          googleBusinessProfile: formData.googleBusinessProfile || null,
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

  if (!restaurantId) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="max-w-lg mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Request</h1>
            <p className="text-lg text-gray-600 mb-8">Missing restaurant information. Please try adding a restaurant again.</p>
            <Link
              href="/dashboard/add-restaurant"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors"
            >
              Go to Add Restaurant
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
              Your restaurant details have been saved and submitted for verification. Redirecting to your dashboard...
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link
              href="/dashboard/add-restaurant"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Complete Restaurant Details</h1>
            <p className="text-gray-600">
              Add your restaurant information to submit for verification. Our team will verify your submission within 24 hours.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Name (read-only) */}
              {restaurant && (
                <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-accent-800 font-semibold mb-1">Restaurant</p>
                  <p className="text-lg font-bold text-accent-900">{restaurant.name}</p>
                </div>
              )}

              {/* Tagline */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tagline <span className="text-gray-500 font-normal">(Short description)</span>
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g., Authentic Italian Coastal Cuisine"
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                />
              </div>

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

              {/* Price Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price Level
                </label>
                <select
                  name="priceLevel"
                  value={formData.priceLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors bg-white"
                >
                  <option value="">Select price level</option>
                  <option value="$">$ - Budget Friendly</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Expensive</option>
                  <option value="$$$$">$$$$ - Very Expensive</option>
                </select>
              </div>

              {/* Opening Hours */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opening Hours
                </label>
                <div className="space-y-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-gray-700 capitalize">
                        {day}:
                      </label>
                      <input
                        type="text"
                        value={formData.hours[day as keyof typeof formData.hours]}
                        onChange={(e) => handleHoursChange(day, e.target.value)}
                        placeholder="e.g., 5:00 PM – 10:00 PM or Closed"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>
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
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Features & Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {featureOptions.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.features.includes(feature)
                          ? 'bg-accent-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Business Profile */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Google Business Profile Link <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="googleBusinessProfile"
                  value={formData.googleBusinessProfile}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/your-restaurant"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This helps us verify your restaurant faster.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Restaurant Description <span className="text-gray-500 font-normal">(Optional, but recommended)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your restaurant's cuisine, atmosphere, specialties, and what makes it unique."
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
                      Submit for Verification
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
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CompleteAddRestaurantPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-accent-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <CompleteAddRestaurantContent />
      </Suspense>
    </ProtectedRoute>
  )
}
