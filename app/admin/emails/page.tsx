'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { showToast } from '@/components/Toast'

export const dynamic = 'force-dynamic'

interface Restaurant {
  id: string
  name: string
  address: string | null
  country_code: string | null
  restaurant_number: string | null
  email: string | null
}

function AdminEmailsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [countries, setCountries] = useState<string[]>([])
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) {
      fetchRestaurants()
    }
  }, [user, selectedCountry])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCountry) params.append('country', selectedCountry)

      const response = await fetch(`/api/admin/restaurants/emails?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch restaurants' }))
        throw new Error(errorData.error || 'Failed to fetch restaurants')
      }
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setRestaurants(data.restaurants || [])
      setCountries(data.countries || [])
      
      // Initialize email inputs with existing emails
      const initialEmails: Record<string, string> = {}
      data.restaurants?.forEach((r: Restaurant) => {
        initialEmails[r.id] = r.email || ''
      })
      setEmailInputs(initialEmails)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
      showToast('Failed to load restaurants', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (restaurantId: string, email: string) => {
    setEmailInputs(prev => ({
      ...prev,
      [restaurantId]: email
    }))
  }

  const handleSaveEmail = async (restaurantId: string) => {
    const email = emailInputs[restaurantId]?.trim() || null
    
    try {
      setSaving(prev => ({ ...prev, [restaurantId]: true }))
      
      const response = await fetch(`/api/admin/restaurants/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          email
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save email')
      }

      showToast('Email saved successfully', 'success')
      
      // Update the restaurant in the list
      setRestaurants(prev => prev.map(r => 
        r.id === restaurantId ? { ...r, email } : r
      ))
    } catch (error) {
      console.error('Error saving email:', error)
      showToast(error instanceof Error ? error.message : 'Failed to save email', 'error')
    } finally {
      setSaving(prev => ({ ...prev, [restaurantId]: false }))
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
            <p className="mt-4 text-gray-600">Loading restaurants...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              href="/admin/restaurants"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Restaurants
            </Link>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Restaurant Emails</h1>
                <p className="text-gray-600">Manage email addresses for restaurants by region</p>
              </div>
            </div>

            {/* Country Filter */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
              <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Country (ISO Code)
              </label>
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <div className="mt-4 text-sm text-gray-600">
                Showing {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
                {selectedCountry && ` in ${selectedCountry}`}
              </div>
            </div>
          </div>

          {/* Restaurants Table */}
          {restaurants.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600">Try adjusting your filter</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Restaurant Name</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Address</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-8 py-6 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                        <td className="px-8 py-6">
                          <div className="font-bold text-lg text-gray-900 mb-2">{restaurant.name}</div>
                          {restaurant.country_code && restaurant.restaurant_number && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md">
                              <span className="text-xs font-semibold text-gray-600">
                                {restaurant.country_code}/{restaurant.restaurant_number}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-base text-gray-700 leading-relaxed max-w-md">{restaurant.address || '—'}</div>
                        </td>
                        <td className="px-8 py-6">
                          <input
                            type="email"
                            value={emailInputs[restaurant.id] || ''}
                            onChange={(e) => handleEmailChange(restaurant.id, e.target.value)}
                            placeholder="restaurant@example.com"
                            className="w-full min-w-[300px] px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-base font-medium transition-all"
                          />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => handleSaveEmail(restaurant.id)}
                            disabled={saving[restaurant.id]}
                            className={`px-6 py-3.5 rounded-lg font-bold text-base transition-all shadow-sm ${
                              saving[restaurant.id]
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-accent-600 hover:bg-accent-700 text-white hover:shadow-md'
                            }`}
                          >
                            {saving[restaurant.id] ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </span>
                            ) : (
                              'Save'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function AdminEmailsPage() {
  return (
    <ProtectedRoute>
      <AdminEmailsPageContent />
    </ProtectedRoute>
  )
}
