'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Mock restaurant data (would come from Google Places API)
const restaurant = {
  name: 'La Terrazza del Mare',
  tagline: 'Authentic Italian Coastal Cuisine',
  rating: 4.7,
  reviewCount: 342,
  priceLevel: '$$$',
  cuisine: ['Italian', 'Seafood', 'Mediterranean'],
  address: '123 Ocean View Boulevard, Marina District, San Francisco, CA 94123',
  phone: '+1 (415) 555-0123',
  website: 'https://laterrazzadelmare.com',
  googleMapsUrl: 'https://maps.google.com/?q=La+Terrazza+del+Mare+San+Francisco',
  hours: {
    monday: '5:00 PM – 10:00 PM',
    tuesday: '5:00 PM – 10:00 PM',
    wednesday: '5:00 PM – 10:00 PM',
    thursday: '5:00 PM – 10:30 PM',
    friday: '5:00 PM – 11:00 PM',
    saturday: '12:00 PM – 3:00 PM, 5:30 PM – 11:00 PM',
    sunday: '12:00 PM – 9:00 PM',
  },
  features: ['Outdoor Seating', 'Ocean View', 'Private Dining', 'Full Bar', 'Valet Parking'],
  description: 'Experience the essence of Italian coastal dining at La Terrazza del Mare. Our chef brings authentic recipes from the Amalfi Coast, featuring the freshest seafood and handmade pasta. Enjoy breathtaking views of the San Francisco Bay while savoring dishes crafted with passion and tradition.',
}

// Demo analytics data
const initialAnalytics = {
  pageViews: 1247,
  phoneClicks: 89,
  addressClicks: 156,
  websiteClicks: 234,
  hoursClicks: 45,
  reservationRequests: 67,
}

export default function ExampleRestaurantPage() {
  const [analytics, setAnalytics] = useState(initialAnalytics)
  const [showTrackingToast, setShowTrackingToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
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

  // Simulate real-time page view on mount
  useEffect(() => {
    setAnalytics(prev => ({ ...prev, pageViews: prev.pageViews + 1 }))
    showTracking('Page View tracked')
  }, [])

  const showTracking = (message: string) => {
    setToastMessage(message)
    setShowTrackingToast(true)
    setTimeout(() => setShowTrackingToast(false), 2000)
  }

  const trackEvent = (eventType: keyof typeof analytics, label: string) => {
    setAnalytics(prev => ({ ...prev, [eventType]: prev[eventType] + 1 }))
    showTracking(`${label} tracked`)
  }

  const handleRevealPhone = () => {
    if (!showPhone) {
      trackEvent('phoneClicks', 'View Phone Number')
      setShowPhone(true)
    }
  }

  const handleRevealAddress = () => {
    if (!showAddress) {
      trackEvent('addressClicks', 'View Address')
      setShowAddress(true)
    }
  }

  const handleRevealWebsite = () => {
    if (!showWebsite) {
      trackEvent('websiteClicks', 'View Website')
      setShowWebsite(true)
    }
  }

  const handleToggleHours = () => {
    if (!showHoursDropdown) {
      trackEvent('hoursClicks', 'View Hours')
    }
    setShowHoursDropdown(!showHoursDropdown)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      trackEvent('reservationRequests', 'Reservation Request')
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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof restaurant.hours

  return (
    <div className="min-h-screen bg-gray-50 pt-10 sm:pt-12">
      {/* Demo Mode Banner - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-accent-500 rounded-full text-xs sm:text-sm font-bold">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
              </span>
              DEMO
            </div>
            <span className="text-xs sm:text-sm text-white/80 hidden sm:inline">All clicks are tracked</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="text-xs sm:text-sm font-medium text-white/80 hover:text-white transition-colors hidden sm:flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <Link 
              href="/claim" 
              className="px-3 sm:px-4 py-1 sm:py-1.5 bg-accent-500 hover:bg-accent-400 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5"
            >
              <span className="hidden xs:inline">Claim</span> Restaurant
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Tracking Toast - Mobile optimized */}
      <div className={`fixed top-14 sm:top-20 right-2 sm:right-4 z-50 transition-all duration-300 ${showTrackingToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <div className="bg-primary-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-2xl flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent-500 rounded-full flex items-center justify-center">
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-xs sm:text-sm">{toastMessage}</p>
            <p className="text-[10px] sm:text-xs text-white/70">Data sent to dashboard</p>
          </div>
        </div>
      </div>

      {/* Mini Analytics Dashboard - Mobile optimized */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-10 sm:top-12 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <Link 
              href="/restaurant/example/dashboard" 
              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="font-bold text-gray-900 text-xs sm:text-sm">Dashboard</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                <span className="font-bold text-gray-900">{analytics.pageViews.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                <span className="font-bold text-gray-900">{analytics.phoneClicks}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                <span className="font-bold text-gray-900">{analytics.addressClicks}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 hidden xs:flex">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
                <span className="font-bold text-gray-900">{analytics.websiteClicks}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-500 rounded-full"></div>
                <span className="font-bold text-gray-900">{analytics.reservationRequests}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        {/* Restaurant Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-10 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {restaurant.cuisine.map((c, i) => (
              <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-accent-100 text-accent-700 text-xs sm:text-sm font-semibold rounded-full">
                {c}
              </span>
            ))}
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
            {restaurant.name}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium mb-4 sm:mb-6">{restaurant.tagline}</p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1 text-yellow-500">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-gray-900 text-sm sm:text-base">{restaurant.rating}</span>
              </div>
              <span className="text-gray-500 text-xs sm:text-sm">({restaurant.reviewCount})</span>
            </div>
            <div className="text-gray-600 font-medium text-sm sm:text-base">{restaurant.priceLevel}</div>
            <div className="relative z-50">
              <button 
                type="button"
                onClick={handleToggleHours}
                className="flex items-center gap-1.5 sm:gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors cursor-pointer text-sm sm:text-base"
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                Open Now
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
                      {Object.entries(restaurant.hours).map(([day, hours]) => (
                        <div 
                          key={day} 
                          className={`flex items-start justify-between gap-3 sm:gap-6 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-colors ${
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
                            {hours.split(', ').map((slot, i) => (
                              <div key={i}>{slot}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* HERO CTA BUTTONS - Mobile optimized */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
            {/* Call Button */}
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

            {/* Directions Button */}
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

            {/* Website Button */}
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

            {/* Reserve Button */}
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
          </div>

          {/* Revealed Phone Number */}
          {showPhone && (
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
          {showAddress && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-50 border-2 border-purple-200 rounded-lg sm:rounded-xl animate-fade-in-scale">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-purple-700 font-medium">Address</p>
                  <p className="text-sm sm:text-lg font-bold text-purple-800">{restaurant.address}</p>
                </div>
                <a
                  href={restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Maps
                </a>
              </div>
            </div>
          )}

          {/* Revealed Website */}
          {showWebsite && (
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
          <p className="text-gray-600 leading-relaxed mt-4 sm:mt-6 text-sm sm:text-lg">{restaurant.description}</p>
          
          {/* Features */}
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
            {restaurant.features.map((feature, i) => (
              <span key={i} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium">
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Reservation Form Section */}
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

              {/* Mobile-only special requests */}
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

        {/* Powered By */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Powered by</p>
          <Link href="/" className="text-accent-600 font-bold text-base sm:text-lg hover:text-accent-700 transition-colors">
            BiteReserve
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-8 sm:py-12 mt-6 sm:mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Want a page like this?
          </h2>
          <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">
            Get your own reservation page with full tracking.
          </p>
          <Link
            href="/claim"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-900 font-bold rounded-lg sm:rounded-xl hover:bg-accent-50 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Claim Your Restaurant
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
