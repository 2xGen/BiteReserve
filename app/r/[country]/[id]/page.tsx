'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { trackEvent, trackPageView } from '@/lib/tracking'
import { generateRestaurantSchema } from '@/lib/schema-org'

interface Restaurant {
  id: string
  name: string
  tagline: string | null
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  google_maps_url: string | null
  rating: number | null
  review_count: number | null
  price_level: string | null
  cuisine: string[] | null
  features: string[] | null
  hours: Record<string, string> | Array<{days?: string[] | string, time?: string, label?: string, day?: string}> | null
  booking_url: string | null
  booking_platform: string | null
  is_claimed: boolean
  country_code: string
  restaurant_number: string
}

export default function RestaurantPage() {
  const params = useParams()
  const country = params?.country as string
  const id = params?.id as string

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showPhone, setShowPhone] = useState(false)
  const [showAddress, setShowAddress] = useState(false)
  const [showWebsite, setShowWebsite] = useState(false)
  const [showHoursDropdown, setShowHoursDropdown] = useState(false)
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: '',
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Fetch restaurant data
  useEffect(() => {
    if (!country || !id) {
      setLoading(false)
      setError('Invalid restaurant URL')
      return
    }

    const fetchRestaurant = async () => {
      try {
        console.log('Fetching restaurant:', country, id)
        const startTime = Date.now()
        
        // Add timeout to fetch
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(`/api/restaurants/${country}/${id}`, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        const duration = Date.now() - startTime
        console.log(`API response status: ${response.status} (${duration}ms)`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API error:', errorData)
          if (response.status === 404) {
            setError('Restaurant not found')
          } else {
            setError(`Failed to load restaurant: ${errorData.error || 'Unknown error'}`)
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log('Restaurant data:', data)
        
        if (!data.restaurant) {
          setError('Restaurant data is missing')
          setLoading(false)
          return
        }

        setRestaurant(data.restaurant)
        
        // Track page view (silent)
        if (data.restaurant.id) {
          trackPageView(data.restaurant.id)
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err)
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request timed out. Please try again.')
        } else {
          setError(`Failed to load restaurant: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [country, id])

  // Click outside to close hours dropdown
  useEffect(() => {
    if (!showHoursDropdown) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-hours-dropdown]') && !target.closest('[data-hours-button]')) {
        setShowHoursDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showHoursDropdown])

  // Generate Schema.org structured data and inject into head
  useEffect(() => {
    if (!restaurant) return

    const schemaData = generateRestaurantSchema({ 
      restaurant, 
      baseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://bite.reserve'
    })

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'restaurant-schema'
    script.text = JSON.stringify(schemaData)
    
    // Remove existing schema if present
    const existing = document.getElementById('restaurant-schema')
    if (existing) existing.remove()
    
    document.head.appendChild(script)
    
    return () => {
      const scriptToRemove = document.getElementById('restaurant-schema')
      if (scriptToRemove) scriptToRemove.remove()
    }
  }, [restaurant])

  const handleRevealPhone = () => {
    if (!showPhone && restaurant) {
      trackEvent(restaurant.id, 'phone_click')
      setShowPhone(true)
    }
  }

  const handleRevealAddress = () => {
    if (!showAddress && restaurant) {
      trackEvent(restaurant.id, 'address_click')
      setShowAddress(true)
    }
  }

  const handleRevealWebsite = () => {
    if (!showWebsite && restaurant) {
      trackEvent(restaurant.id, 'website_click')
      setShowWebsite(true)
    }
  }

  const handleToggleHours = () => {
    if (!showHoursDropdown && restaurant) {
      trackEvent(restaurant.id, 'hours_click')
    }
    setShowHoursDropdown(!showHoursDropdown)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurant) return

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // TODO: Send to API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))
      trackEvent(restaurant.id, 'reservation_click')
      setSubmitStatus('success')
      setFormData({
        date: '', time: '', partySize: '', name: '', email: '', phone: '', specialRequests: '',
      })
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-8 inline-block">
            {/* Fork and Knife Icon - Simple design */}
            <div className="flex items-center justify-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-accent-600 rounded-lg flex items-center justify-center transform rotate-45">
                  <div className="w-1 h-6 bg-white rounded-full"></div>
                </div>
                <div className="absolute inset-0 animate-ping opacity-20">
                  <div className="w-12 h-12 bg-accent-600 rounded-lg"></div>
                </div>
              </div>
              <div className="w-1 h-14 bg-accent-600 rounded-full animate-pulse"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
                <div className="absolute inset-0 animate-ping opacity-20" style={{ animationDelay: '0.3s' }}>
                  <div className="w-12 h-12 bg-accent-600 rounded-full"></div>
                </div>
              </div>
            </div>
            {/* Pulsing rings */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-28 h-28 border-2 border-accent-200 rounded-full animate-ping"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-28 h-28 border-2 border-accent-300 rounded-full animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2s' }}></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">Loading restaurant</h3>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-sm text-gray-500 font-medium">Just a moment...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This restaurant could not be found.'}</p>
          <Link href="/" className="text-accent-600 hover:text-accent-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Normalize hours data - handle both Record<string, string> and array of objects formats
  const normalizeHours = (hoursData: any): Record<string, string> => {
    if (!hoursData) return {}
    
    // If it's already a Record<string, string>, return as is
    if (typeof hoursData === 'object' && !Array.isArray(hoursData)) {
      // Check if it's a plain object with string values
      const isStringRecord = Object.values(hoursData).every(val => 
        typeof val === 'string' || val === null || val === undefined
      )
      if (isStringRecord) {
        return hoursData as Record<string, string>
      }
    }
    
    // If it's an array of objects (Google Places format: [{days, time, label}])
    if (Array.isArray(hoursData)) {
      const normalized: Record<string, string> = {}
      const dayMap: Record<string, string> = {
        'monday': 'monday',
        'tuesday': 'tuesday',
        'wednesday': 'wednesday',
        'thursday': 'thursday',
        'friday': 'friday',
        'saturday': 'saturday',
        'sunday': 'sunday',
      }
      
      hoursData.forEach((item: any) => {
        if (item && typeof item === 'object') {
          const timeStr = item.time || item.label || ''
          if (item.days && Array.isArray(item.days)) {
            item.days.forEach((day: string) => {
              const dayKey = dayMap[day.toLowerCase()] || day.toLowerCase()
              if (normalized[dayKey]) {
                normalized[dayKey] += ', ' + timeStr
              } else {
                normalized[dayKey] = timeStr
              }
            })
          } else if (item.day) {
            const dayKey = dayMap[item.day.toLowerCase()] || item.day.toLowerCase()
            normalized[dayKey] = timeStr
          }
        }
      })
      return normalized
    }
    
    return {}
  }

  const hours = normalizeHours(restaurant.hours)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const isOpen = hours[today] ? true : false // Simple check - could be enhanced

  return (
    <div className="min-h-screen bg-gray-50 pt-10 sm:pt-12">
        {/* Main Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        {/* Restaurant Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-10 mb-4 sm:mb-6">
          {/* Cuisine Tags */}
          {restaurant.cuisine && restaurant.cuisine.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {restaurant.cuisine.map((c, i) => (
                <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-accent-100 text-accent-700 text-xs sm:text-sm font-semibold rounded-full">
                  {c}
                </span>
              ))}
            </div>
          )}
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium mb-4 sm:mb-6">{restaurant.tagline}</p>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-200">
            {restaurant.rating && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-0.5 sm:gap-1 text-yellow-500">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-gray-900 text-sm sm:text-base">{restaurant.rating}</span>
                </div>
                {restaurant.review_count && (
                  <span className="text-gray-500 text-xs sm:text-sm">({restaurant.review_count})</span>
                )}
              </div>
            )}
            {restaurant.price_level && (
              <div className="text-gray-600 font-medium text-sm sm:text-base">{restaurant.price_level}</div>
            )}
            {Object.keys(hours).length > 0 && (
              <div className="relative z-50" data-hours-dropdown>
                <button 
                  type="button"
                  data-hours-button
                  onClick={handleToggleHours}
                  className="flex items-center gap-1.5 sm:gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors cursor-pointer text-sm sm:text-base"
                >
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  {isOpen ? 'Open Now' : 'Closed'}
                  <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${showHoursDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showHoursDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowHoursDropdown(false)}
                    />
                    <div className="absolute top-full left-0 sm:left-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 p-3 sm:p-5 z-50 w-[280px] sm:min-w-[340px] -translate-x-1/4 sm:translate-x-0">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-100">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-bold text-gray-900 text-sm sm:text-base">Opening Hours</span>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        {Object.entries(hours).map(([day, time]) => (
                          <div 
                            key={day} 
                            className={`flex items-start justify-between gap-3 sm:gap-6 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-colors whitespace-nowrap ${
                              day === today 
                                ? 'bg-accent-50 border border-accent-200' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`capitalize font-medium flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-sm ${day === today ? 'text-accent-700' : 'text-gray-700'}`}>
                              {day.slice(0, 3)}
                              {day === today && (
                                <span className="text-[8px] sm:text-[10px] bg-accent-500 text-white px-1 sm:px-1.5 py-0.5 rounded font-bold uppercase">Today</span>
                              )}
                            </div>
                            <div className={`font-semibold text-right text-xs sm:text-sm ${day === today ? 'text-accent-600' : 'text-gray-900'}`}>
                              {typeof time === 'string' && time.trim() 
                                ? time.split(', ').map((slot, i) => (
                                    <div key={i}>{slot.trim()}</div>
                                  ))
                                : <div>Closed</div>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* HERO CTA BUTTONS */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
            {/* Call Button */}
            {restaurant.phone && (
              <button
                onClick={handleRevealPhone}
                className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                  showPhone 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-50 hover:bg-green-100 text-green-700 active:scale-95 sm:hover:scale-105'
                }`}
              >
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${showPhone ? 'bg-white/20' : 'bg-green-100'}`}>
                  <svg className={`w-4 h-4 sm:w-6 sm:h-6 ${showPhone ? 'text-white' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="font-bold text-xs sm:text-sm">Call</span>
              </button>
            )}

            {/* Directions Button */}
            {restaurant.address && (
              <button
                onClick={handleRevealAddress}
                className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                  showAddress 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 active:scale-95 sm:hover:scale-105'
                }`}
              >
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${showAddress ? 'bg-white/20' : 'bg-purple-100'}`}>
                  <svg className={`w-4 h-4 sm:w-6 sm:h-6 ${showAddress ? 'text-white' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-bold text-xs sm:text-sm">Map</span>
              </button>
            )}

            {/* Website Button */}
            {restaurant.website && (
              <button
                onClick={handleRevealWebsite}
                className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                  showWebsite 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 active:scale-95 sm:hover:scale-105'
                }`}
              >
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${showWebsite ? 'bg-white/20' : 'bg-blue-100'}`}>
                  <svg className={`w-4 h-4 sm:w-6 sm:h-6 ${showWebsite ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <span className="font-bold text-xs sm:text-sm">Web</span>
              </button>
            )}

            {/* Reserve Button - Only show if claimed */}
            {restaurant.is_claimed && (
              <a
                href="#reserve"
                className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-accent-500 hover:bg-accent-600 text-white transition-all duration-300 active:scale-95 sm:hover:scale-105"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-bold text-xs sm:text-sm">Book</span>
              </a>
            )}
          </div>

          {/* Revealed Phone Number */}
          {showPhone && restaurant.phone && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-lg sm:rounded-xl animate-fade-in-scale">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <p className="text-xs sm:text-sm text-green-700 font-medium">Phone Number</p>
                  <a href={`tel:${restaurant.phone}`} className="text-base sm:text-xl font-bold text-green-800 hover:underline">
                    {restaurant.phone}
                  </a>
                </div>
                <a
                  href={`tel:${restaurant.phone}`}
                  className="w-full sm:w-auto text-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  Call Now
                </a>
              </div>
            </div>
          )}

          {/* Revealed Address */}
          {showAddress && restaurant.address && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-50 border-2 border-purple-200 rounded-lg sm:rounded-xl animate-fade-in-scale">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-purple-700 font-medium">Address</p>
                  <p className="text-sm sm:text-lg font-bold text-purple-800">{restaurant.address}</p>
                </div>
                {restaurant.google_maps_url && (
                  <a
                    href={restaurant.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Revealed Website */}
          {showWebsite && restaurant.website && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl animate-fade-in-scale">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="overflow-hidden">
                  <p className="text-xs sm:text-sm text-blue-700 font-medium">Website</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-800 truncate">{restaurant.website}</p>
                </div>
                <button
                  className="w-full sm:w-auto text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          {restaurant.description && (
            <p className="text-gray-600 leading-relaxed mt-4 sm:mt-6 text-sm sm:text-lg">{restaurant.description}</p>
          )}
          
          {/* Features */}
          {restaurant.features && restaurant.features.length > 0 && (
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
              {restaurant.features.map((feature, i) => (
                <span key={i} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium">
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reservation Form Section - Only for claimed restaurants */}
        {restaurant.is_claimed && (
          <div id="reserve" className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-accent-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Request a Table</h2>
                <p className="text-gray-500 text-xs sm:text-base">The restaurant will respond directly</p>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
                <div className="flex items-center gap-2 text-green-700 font-semibold mb-1 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Request Submitted!
                </div>
                <p className="text-xs sm:text-sm text-green-600">The restaurant will respond to your email.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Party Size *</label>
                  <select
                    name="partySize"
                    value={formData.partySize}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-gray-900 bg-white text-sm sm:text-base"
                  >
                    <option value="">Select guests</option>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                    ))}
                    <option value="9+">9+ guests</option>
                  </select>
                </div>

                <div className="hidden sm:block">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any dietary restrictions or special occasions?"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-gray-900 resize-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-gray-900 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-gray-900 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-gray-900 text-sm sm:text-base"
                  />
                </div>

                <div className="sm:hidden">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any dietary restrictions?"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-gray-900 resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold text-base sm:text-lg rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl active:scale-[0.98] sm:hover:-translate-y-0.5 mt-1 sm:mt-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : 'Request Reservation'}
                </button>

                <p className="text-[10px] sm:text-xs text-center text-gray-500">
                  Your info is only shared with the restaurant.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Powered By */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-500 mb-1 sm:mb-2">Powered by</p>
          <Link href="/" className="text-accent-600 font-bold text-lg sm:text-xl hover:text-accent-700 transition-colors">
            BiteReserve
          </Link>
          {!restaurant.is_claimed && (
            <p className="mt-2 text-sm sm:text-base text-gray-400">
              Is this your restaurant?{' '}
              <Link 
                href={`/claim?country=${restaurant.country_code}&id=${restaurant.restaurant_number}`}
                className="text-accent-600 hover:text-accent-700 underline font-medium"
              >
                Claim it free
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-8 sm:py-12 mt-6 sm:mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Want a page like this?
          </h2>
          <p className="text-white/80 mb-2 sm:mb-3 text-sm sm:text-base">
            Get your own reservation page with full tracking.
          </p>
          <p className="text-white/70 mb-4 sm:mb-6 text-xs sm:text-sm max-w-2xl mx-auto">
            BiteReserve — A demand-tracking platform for restaurants, designed to capture high-intent diners at the moment of decision.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-900 font-bold rounded-lg sm:rounded-xl hover:bg-accent-50 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Learn More
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
