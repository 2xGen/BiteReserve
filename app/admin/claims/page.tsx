'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PendingClaim {
  id: string
  name: string
  tagline: string | null
  address: string | null
  website: string | null
  phone: string | null
  cuisine: string[] | null
  features: string[] | null
  description: string | null
  price_level: string | null
  hours: any
  google_business_profile: string | null
  booking_platform: string | null
  claim_status: string | null
  created_at: string
  user_id: string
  user_email: string | null
  user_name: string | null
  user_plan: string
  country_code: string | null
}

function AdminClaimsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [claims, setClaims] = useState<PendingClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')

  useEffect(() => {
    if (user) {
      fetchClaims()
    }
  }, [user, filter])

  const fetchClaims = async () => {
    try {
      const response = await fetch(`/api/admin/claims?status=${filter === 'pending' ? 'pending' : 'all'}`)
      if (!response.ok) throw new Error('Failed to fetch claims')
      const data = await response.json()
      setClaims(data.claims || [])
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (claimId: string) => {
    setProcessing(claimId)
    try {
      const response = await fetch('/api/admin/claims/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve claim')
      }

      // Refresh claims list
      await fetchClaims()
      alert('Claim approved successfully!')
    } catch (error) {
      console.error('Error approving claim:', error)
      alert(error instanceof Error ? error.message : 'Failed to approve claim')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (claimId: string, reason?: string) => {
    const rejectReason = reason || prompt('Reason for rejection (optional):')
    if (rejectReason === null) return // User cancelled

    setProcessing(claimId)
    try {
      const response = await fetch('/api/admin/claims/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, reason: rejectReason || undefined }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject claim')
      }

      // Refresh claims list
      await fetchClaims()
      alert('Claim rejected.')
    } catch (error) {
      console.error('Error rejecting claim:', error)
      alert(error instanceof Error ? error.message : 'Failed to reject claim')
    } finally {
      setProcessing(null)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
            <p className="mt-4 text-gray-600">Loading claims...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const pendingCount = claims.filter(c => c.claim_status === 'pending' || c.claim_status === null).length

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Restaurant Claims Review</h1>
                <p className="text-gray-600">Review and approve restaurant claim requests</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/restaurants"
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  All Restaurants
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      filter === 'pending'
                        ? 'bg-accent-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      filter === 'all'
                        ? 'bg-accent-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {claims.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-600">
                {filter === 'pending' 
                  ? 'All claims have been reviewed!' 
                  : 'No restaurant claims have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className={`bg-white rounded-xl shadow-md border-2 ${
                    claim.claim_status === 'pending' || claim.claim_status === null
                      ? 'border-amber-200'
                      : claim.claim_status === 'approved'
                      ? 'border-green-200'
                      : 'border-red-200'
                  } p-6`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{claim.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            claim.claim_status === 'pending' || claim.claim_status === null
                              ? 'bg-amber-100 text-amber-800'
                              : claim.claim_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {(claim.claim_status || 'pending').toUpperCase()}
                        </span>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {claim.tagline && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Tagline</p>
                            <p className="text-sm text-gray-600 italic">{claim.tagline}</p>
                          </div>
                        )}
                        {claim.address && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Address</p>
                            <p className="text-sm text-gray-600">{claim.address}</p>
                          </div>
                        )}
                        {claim.country_code && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Country</p>
                            <p className="text-sm text-gray-600">{claim.country_code.toUpperCase()}</p>
                          </div>
                        )}
                        {claim.website && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Website</p>
                            <a
                              href={claim.website.startsWith('http') ? claim.website : `https://${claim.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-accent-600 hover:underline"
                            >
                              {claim.website}
                            </a>
                          </div>
                        )}
                        {claim.phone && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Phone</p>
                            <p className="text-sm text-gray-600">{claim.phone}</p>
                          </div>
                        )}
                        {claim.price_level && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Price Level</p>
                            <p className="text-sm text-gray-600">{claim.price_level}</p>
                          </div>
                        )}
                        {claim.booking_platform && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Booking Platform</p>
                            <p className="text-sm text-gray-600 capitalize">{claim.booking_platform}</p>
                          </div>
                        )}
                        {claim.cuisine && claim.cuisine.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Cuisine</p>
                            <p className="text-sm text-gray-600">{claim.cuisine.join(', ')}</p>
                          </div>
                        )}
                        {claim.features && claim.features.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Features</p>
                            <p className="text-sm text-gray-600">{claim.features.join(', ')}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Claimed By</p>
                          <p className="text-sm text-gray-600">
                            {claim.user_name || 'N/A'} ({claim.user_email || 'No email'})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Plan</p>
                          <p className="text-sm text-gray-600 capitalize">{claim.user_plan || 'free'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Submitted</p>
                          <p className="text-sm text-gray-600">
                            {new Date(claim.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {claim.google_business_profile && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Google Business Profile</p>
                            <a
                              href={claim.google_business_profile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-accent-600 hover:underline break-all"
                            >
                              {claim.google_business_profile}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Opening Hours */}
                      {claim.hours && typeof claim.hours === 'object' && Object.keys(claim.hours).length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Opening Hours</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(claim.hours).map(([day, hours]) => {
                              // Handle both string and object formats
                              let hoursDisplay = ''
                              if (typeof hours === 'string') {
                                hoursDisplay = hours
                              } else if (hours && typeof hours === 'object') {
                                // If it's an object, try to extract a display value
                                if ('time' in hours) {
                                  hoursDisplay = hours.time as string
                                } else if ('label' in hours) {
                                  hoursDisplay = hours.label as string
                                } else {
                                  hoursDisplay = JSON.stringify(hours)
                                }
                              }
                              
                              return hoursDisplay ? (
                                <div key={day} className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-600 capitalize w-20">{day}:</span>
                                  <span className="text-xs text-gray-700">{hoursDisplay}</span>
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {claim.description && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{claim.description}</p>
                        </div>
                      )}
                    </div>

                    {(claim.claim_status === 'pending' || claim.claim_status === null) && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleApprove(claim.id)}
                          disabled={processing === claim.id}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === claim.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(claim.id)}
                          disabled={processing === claim.id}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function AdminClaimsPage() {
  return (
    <ProtectedRoute>
      <AdminClaimsPageContent />
    </ProtectedRoute>
  )
}
