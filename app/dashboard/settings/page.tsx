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
  country_code: string
  restaurant_number: string
  is_claimed: boolean
  claim_status: string
}

function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (user) {
      fetchRestaurants()
    }
  }, [user])

  const fetchRestaurants = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/restaurants?userId=${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch restaurants')
      const data = await response.json()
      setRestaurants(data.restaurants || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
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
            <p className="text-gray-600">Manage your restaurants</p>
          </div>

          {restaurants.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-4">No restaurants found.</p>
              <Link href="/claim" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Restaurant
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {restaurants.map((restaurant) => {
                const publicUrl = `/r/${restaurant.country_code}/${restaurant.restaurant_number}`
                const isPending = restaurant.claim_status === 'pending' || !restaurant.is_claimed
                
                return (
                  <div key={restaurant.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                          {isPending && (
                            <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                          <Link
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Public Page
                          </Link>
                          <Link
                            href={`/dashboard/edit?id=${restaurant.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Information
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Add Restaurant Button */}
              <div className="bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 p-6 text-center">
                <Link
                  href="/claim"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Restaurant
                </Link>
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
