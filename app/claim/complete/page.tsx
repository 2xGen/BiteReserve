'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { showToast } from '@/components/Toast'
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
    businessLinks: {
      opentable: { url: '', enabled: false },
      resy: { url: '', enabled: false },
      whatsapp: { url: '', enabled: false },
      tripadvisor: { url: '', enabled: false },
      instagram: { url: '', enabled: false },
      facebook: { url: '', enabled: false },
      twitter: { url: '', enabled: false },
      yelp: { url: '', enabled: false },
      email: { url: '', enabled: false },
      phone: { url: '', enabled: false },
      website: { url: '', enabled: false },
      maps: { url: '', enabled: false },
    } as Record<string, { url: string; enabled: boolean }>,
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
        // Handle hours - could be object or array
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
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-update business links when phone/website changes
      if (name === 'phone' && prev.businessLinks.phone.enabled) {
        updated.businessLinks = {
          ...prev.businessLinks,
          phone: { ...prev.businessLinks.phone, url: value ? `tel:${value}` : '' }
        }
      }
      if (name === 'website' && prev.businessLinks.website.enabled) {
        updated.businessLinks = {
          ...prev.businessLinks,
          website: { ...prev.businessLinks.website, url: value || '' }
        }
      }
      if (name === 'address' && prev.businessLinks.maps.enabled) {
        const encodedAddress = encodeURIComponent(value)
        updated.businessLinks = {
          ...prev.businessLinks,
          maps: { ...prev.businessLinks.maps, url: value ? `https://maps.google.com/?q=${encodedAddress}` : '' }
        }
      }
      return updated
    })
  }

  const handleBusinessLinkChange = (linkType: string, field: 'url' | 'enabled', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      businessLinks: {
        ...prev.businessLinks,
        [linkType]: {
          ...prev.businessLinks[linkType],
          [field]: value,
        }
      }
    }))
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
      // Build business_links object with only enabled links (include section and order for consistency)
      const businessLinks: Record<string, { url: string; enabled: boolean; section?: number; order?: number }> = {}
      let section1Order = 1
      let section2Order = 1
      
      Object.entries(formData.businessLinks).forEach(([key, link]) => {
        if (link.enabled && link.url.trim()) {
          // Determine section: phone, maps, website, opentable, resy go to section 1
          const isSection1 = ['phone', 'maps', 'website', 'opentable', 'resy'].includes(key)
          const section = isSection1 ? 1 : 2
          const order = isSection1 ? section1Order++ : section2Order++
          
          // Auto-update phone, website, maps links from form fields
          if (key === 'phone' && formData.phone) {
            businessLinks[key] = { url: `tel:${formData.phone}`, enabled: true, section, order }
          } else if (key === 'website' && formData.website) {
            businessLinks[key] = { url: formData.website, enabled: true, section, order }
          } else if (key === 'maps' && formData.address) {
            businessLinks[key] = { url: '', enabled: true, section, order } // Will be set server-side
          } else {
            businessLinks[key] = {
              url: link.url.trim(),
              enabled: true,
              section,
              order,
            }
          }
        }
      })

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
          businessLinks: Object.keys(businessLinks).length > 0 ? businessLinks : null,
          whatsappNumber: formData.businessLinks.whatsapp.url ? formData.businessLinks.whatsapp.url.replace('https://wa.me/', '').replace(/\D/g, '') : null,
          bookingUrl: formData.businessLinks.opentable.enabled ? formData.businessLinks.opentable.url : formData.businessLinks.resy.enabled ? formData.businessLinks.resy.url : null,
          bookingPlatform: formData.businessLinks.opentable.enabled ? 'opentable' : formData.businessLinks.resy.enabled ? 'resy' : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || errorData.details || 'Failed to complete restaurant details'
        console.error('API Error:', errorData)
        throw new Error(errorMessage)
      }

      setIsComplete(true)
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error completing restaurant:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save details. Please try again.'
      console.error('Full error details:', error)
      showToast(errorMessage, 'error')
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

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tagline <span className="text-gray-500 font-normal">(Optional)</span>
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
                  <p className="text-xs text-gray-500 mt-1">
                    A short, catchy phrase that appears below your restaurant name on the listing page.
                  </p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Address <span className="text-gray-500 font-normal">(Optional)</span>
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
                    Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
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
                    Website <span className="text-gray-500 font-normal">(Optional)</span>
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

                {/* Business Links Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Business Card Links</h2>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="text-gray-500">(Optional)</span> Choose which links to display on your restaurant listing page. All clicks are tracked.
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    You can add these later in your dashboard if you prefer.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Booking Platforms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Booking & Reservations</label>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.opentable.enabled}
                            onChange={(e) => handleBusinessLinkChange('opentable', 'enabled', e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">OpenTable</label>
                            <input
                              type="url"
                              value={formData.businessLinks.opentable.url}
                              onChange={(e) => handleBusinessLinkChange('opentable', 'url', e.target.value)}
                              placeholder="https://www.opentable.com/..."
                              disabled={!formData.businessLinks.opentable.enabled}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.resy.enabled}
                            onChange={(e) => handleBusinessLinkChange('resy', 'enabled', e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resy</label>
                            <input
                              type="url"
                              value={formData.businessLinks.resy.url}
                              onChange={(e) => handleBusinessLinkChange('resy', 'url', e.target.value)}
                              placeholder="https://resy.com/..."
                              disabled={!formData.businessLinks.resy.enabled}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.whatsapp.enabled}
                            onChange={(e) => handleBusinessLinkChange('whatsapp', 'enabled', e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                            <input
                              type="text"
                              value={formData.businessLinks.whatsapp.url.replace('https://wa.me/', '')}
                              onChange={(e) => {
                                const value = e.target.value
                                const phoneNumber = value.replace(/\D/g, '')
                                handleBusinessLinkChange('whatsapp', 'url', phoneNumber ? `https://wa.me/${phoneNumber}` : '')
                              }}
                              placeholder="Phone number (e.g., +14155550123)"
                              disabled={!formData.businessLinks.whatsapp.enabled}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Social Media</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.instagram.enabled}
                            onChange={(e) => handleBusinessLinkChange('instagram', 'enabled', e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Instagram</label>
                            <input
                              type="url"
                              value={formData.businessLinks.instagram.url}
                              onChange={(e) => handleBusinessLinkChange('instagram', 'url', e.target.value)}
                              placeholder="https://instagram.com/..."
                              disabled={!formData.businessLinks.instagram.enabled}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.facebook.enabled}
                            onChange={(e) => handleBusinessLinkChange('facebook', 'enabled', e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Facebook</label>
                            <input
                              type="url"
                              value={formData.businessLinks.facebook.url}
                              onChange={(e) => handleBusinessLinkChange('facebook', 'url', e.target.value)}
                              placeholder="https://facebook.com/..."
                              disabled={!formData.businessLinks.facebook.enabled}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.tripadvisor.enabled}
                            onChange={(e) => handleBusinessLinkChange('tripadvisor', 'enabled', e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">TripAdvisor</label>
                            <input
                              type="url"
                              value={formData.businessLinks.tripadvisor.url}
                              onChange={(e) => handleBusinessLinkChange('tripadvisor', 'url', e.target.value)}
                              placeholder="https://tripadvisor.com/..."
                              disabled={!formData.businessLinks.tripadvisor.enabled}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.yelp.enabled}
                            onChange={(e) => handleBusinessLinkChange('yelp', 'enabled', e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Yelp</label>
                            <input
                              type="url"
                              value={formData.businessLinks.yelp.url}
                              onChange={(e) => handleBusinessLinkChange('yelp', 'url', e.target.value)}
                              placeholder="https://yelp.com/..."
                              disabled={!formData.businessLinks.yelp.enabled}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Basic Links */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact & Basic Links</label>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.phone.enabled}
                            onChange={(e) => handleBusinessLinkChange('phone', 'enabled', e.target.checked)}
                            className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <label>Phone (auto-filled from phone number above)</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.website.enabled}
                            onChange={(e) => handleBusinessLinkChange('website', 'enabled', e.target.checked)}
                            className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <label>Website (auto-filled from website above)</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.maps.enabled}
                            onChange={(e) => handleBusinessLinkChange('maps', 'enabled', e.target.checked)}
                            className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <label>Google Maps (auto-filled from address)</label>
                        </div>
                        <div className="flex items-start gap-2 mt-3">
                          <input
                            type="checkbox"
                            checked={formData.businessLinks.email.enabled}
                            onChange={(e) => handleBusinessLinkChange('email', 'enabled', e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={formData.businessLinks.email.url.replace('mailto:', '')}
                              onChange={(e) => handleBusinessLinkChange('email', 'url', `mailto:${e.target.value}`)}
                              placeholder="contact@yourrestaurant.com"
                              disabled={!formData.businessLinks.email.enabled}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    <option value="$$">$$ - Casual Dining</option>
                    <option value="$$$">$$$ - Upscale</option>
                    <option value="$$$$">$$$$ - Fine Dining</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps diners understand your price range.
                  </p>
                </div>

                {/* Opening Hours */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Opening Hours <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Enter your opening hours for each day. Use format like "5:00 PM – 10:00 PM" or "Closed" for closed days.
                  </p>
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
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: For multiple time slots on the same day, use commas (e.g., "12:00 PM – 3:00 PM, 5:30 PM – 11:00 PM")
                  </p>
                </div>

                {/* Cuisine Types */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cuisine Type(s) <span className="text-gray-500 font-normal">(Optional)</span>
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

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Features & Amenities <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select features that apply to your restaurant. These will appear on your listing page.
                  </p>
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
                  {formData.features.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {formData.features.join(', ')}
                    </p>
                  )}
                </div>

                {/* Verification Help */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Verification Help (Optional)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    To speed up verification, you can provide your Google Business Profile link. This helps us verify your restaurant quickly.
                  </p>
                  
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
                      This helps us verify your restaurant faster. You can find it by searching for your restaurant on Google Maps.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Restaurant Description
                  </h3>
                  <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>📝 This description will appear on your public BiteReserve listing page.</strong> Write a compelling description that helps diners understand what makes your restaurant special.
                    </p>
                  </div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description <span className="text-gray-500 font-normal">(Optional, but recommended)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your restaurant's cuisine, atmosphere, specialties, and what makes it unique. This will be visible to potential diners on your BiteReserve page."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Include your signature dishes, ambiance, and what makes your restaurant special. This helps diners decide to visit!
                  </p>
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
