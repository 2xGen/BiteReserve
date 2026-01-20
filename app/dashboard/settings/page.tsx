'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Restaurant {
  id: string
  name: string
  slug: string
  reservation_form_enabled: boolean
  reservation_email: string | null
  reservation_email_verified: boolean
  reservation_whatsapp: string | null
  reservation_whatsapp_verified: boolean
  reservation_min_advance_hours: number
  reservation_delivery_method: string
}

function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Reservation form settings
  const [formEnabled, setFormEnabled] = useState(false)
  const [reservationEmail, setReservationEmail] = useState('')
  const [reservationWhatsApp, setReservationWhatsApp] = useState('')
  const [minAdvanceHours, setMinAdvanceHours] = useState(24)
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'whatsapp' | 'both'>('email')

  useEffect(() => {
    if (user) {
      fetchRestaurants()
    }
  }, [user])

  useEffect(() => {
    if (selectedRestaurant && restaurants.length > 0) {
      const restaurant = restaurants.find(r => r.id === selectedRestaurant)
      if (restaurant) {
        setFormEnabled(restaurant.reservation_form_enabled)
        setReservationEmail(restaurant.reservation_email || '')
        setReservationWhatsApp(restaurant.reservation_whatsapp || '')
        setMinAdvanceHours(restaurant.reservation_min_advance_hours || 24)
        setDeliveryMethod((restaurant.reservation_delivery_method as 'email' | 'whatsapp' | 'both') || 'email')
      }
    }
  }, [selectedRestaurant, restaurants])

  const fetchRestaurants = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/restaurants?userId=${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch restaurants')
      const data = await response.json()
      setRestaurants(data.restaurants || [])
      
      if (data.restaurants && data.restaurants.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(data.restaurants[0].id)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedRestaurant) return

    setSaving(true)
    try {
      const response = await fetch('/api/restaurants/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: selectedRestaurant,
          reservation_form_enabled: formEnabled,
          reservation_email: reservationEmail || null,
          reservation_whatsapp: reservationWhatsApp || null,
          reservation_min_advance_hours: minAdvanceHours,
          reservation_delivery_method: deliveryMethod,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }

      // Refresh restaurants
      await fetchRestaurants()
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const currentRestaurant = restaurants.find(r => r.id === selectedRestaurant)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Restaurant Settings</h1>
            <p className="text-gray-600">Configure your reservation form and preferences</p>
          </div>

          {/* Restaurant Selector */}
          {restaurants.length > 1 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Restaurant
              </label>
              <select
                value={selectedRestaurant || ''}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!currentRestaurant ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No restaurants found. <Link href="/claim" className="text-accent-600 hover:underline">Claim a restaurant</Link> to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservation Form Settings</h2>

              {/* Enable/Disable Toggle */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Enable Reservation Form</h3>
                    <p className="text-sm text-gray-600">
                      Allow guests to request reservations directly from your BiteReserve page
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEnabled}
                      onChange={(e) => setFormEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>
              </div>

              {formEnabled && (
                <>
                  {/* Delivery Method */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      How should you receive reservation requests?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('email')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          deliveryMethod === 'email'
                            ? 'border-accent-500 bg-accent-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p className="font-semibold text-gray-900">Email</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('whatsapp')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          deliveryMethod === 'whatsapp'
                            ? 'border-accent-500 bg-accent-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          <p className="font-semibold text-gray-900">WhatsApp</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('both')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          deliveryMethod === 'both'
                            ? 'border-accent-500 bg-accent-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <p className="font-semibold text-gray-900">Both</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Email Settings */}
                  {(deliveryMethod === 'email' || deliveryMethod === 'both') && (
                    <div className="mb-8 pb-8 border-b border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address for Reservations <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={reservationEmail}
                        onChange={(e) => setReservationEmail(e.target.value)}
                        placeholder="reservations@yourrestaurant.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 mb-2"
                        required={deliveryMethod === 'email' || deliveryMethod === 'both'}
                      />
                      {currentRestaurant.reservation_email_verified ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Email verified
                        </p>
                      ) : (
                        <p className="text-sm text-amber-600">
                          ⚠️ Email requires verification. We'll send a verification email after you save.
                        </p>
                      )}
                    </div>
                  )}

                  {/* WhatsApp Settings */}
                  {(deliveryMethod === 'whatsapp' || deliveryMethod === 'both') && (
                    <div className="mb-8 pb-8 border-b border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        WhatsApp Number for Reservations <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={reservationWhatsApp}
                        onChange={(e) => setReservationWhatsApp(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 mb-2"
                        required={deliveryMethod === 'whatsapp' || deliveryMethod === 'both'}
                      />
                      {currentRestaurant.reservation_whatsapp_verified ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          WhatsApp verified
                        </p>
                      ) : (
                        <p className="text-sm text-amber-600">
                          ⚠️ WhatsApp number requires verification. We'll send a verification code after you save.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Minimum Advance Time */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Minimum Advance Booking Time
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      How far in advance must guests book? This gives you time to confirm reservations.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { hours: 24, label: '24 hours' },
                        { hours: 48, label: '48 hours' },
                        { hours: 72, label: '3 days' },
                        { hours: 168, label: '1 week' },
                      ].map((option) => (
                        <button
                          key={option.hours}
                          type="button"
                          onClick={() => setMinAdvanceHours(option.hours)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            minAdvanceHours === option.hours
                              ? 'border-accent-500 bg-accent-50 text-accent-700 font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Save Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || (formEnabled && (deliveryMethod === 'email' || deliveryMethod === 'both') && !reservationEmail) || (formEnabled && (deliveryMethod === 'whatsapp' || deliveryMethod === 'both') && !reservationWhatsApp)}
                  className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  )
}
