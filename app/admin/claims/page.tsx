'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { showToast } from '@/components/Toast'

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
  restaurant_number: string | null
  business_links: any | null
  is_claimed: boolean
}

function AdminClaimsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [claims, setClaims] = useState<PendingClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [editingClaim, setEditingClaim] = useState<string | null>(null)
  const [claimEdits, setClaimEdits] = useState<Record<string, { countryCode: string; restaurantNumber: string }>>({})

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

  const handleEditClaim = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId)
    if (claim) {
      setClaimEdits(prev => ({
        ...prev,
        [claimId]: {
          countryCode: claim.country_code || '',
          restaurantNumber: claim.restaurant_number || '',
        }
      }))
      setEditingClaim(claimId)
    }
  }

  const handleCancelEdit = (claimId: string) => {
    setEditingClaim(null)
    setClaimEdits(prev => {
      const newEdits = { ...prev }
      delete newEdits[claimId]
      return newEdits
    })
  }

  const handleApprove = async (claimId: string) => {
    const edits = claimEdits[claimId]
    
    // Validate required fields for new restaurants (those with temp placeholders)
    const claim = claims.find(c => c.id === claimId)
    if (claim && (claim.country_code === 'xx' || !claim.country_code || claim.restaurant_number === '00000' || !claim.restaurant_number)) {
      if (!edits || !edits.countryCode || !edits.restaurantNumber) {
        showToast('Please set the Country Code and Restaurant Number before approving. Click "Edit URL" to set these fields.', 'warning')
        return
      }
      
      // Validate format
      if (edits.countryCode.length !== 2) {
        showToast('Country code must be exactly 2 letters (e.g., "mx", "nl", "es")', 'error')
        return
      }
      
      if (!/^\d{5}$/.test(edits.restaurantNumber)) {
        showToast('Restaurant number must be exactly 5 digits (e.g., "00002", "04480")', 'error')
        return
      }
    }

    setProcessing(claimId)
    try {
      const response = await fetch('/api/admin/claims/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          claimId,
          countryCode: edits?.countryCode || null,
          restaurantNumber: edits?.restaurantNumber || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve claim')
      }

      // Refresh claims list
      await fetchClaims()
      setEditingClaim(null)
      setClaimEdits(prev => {
        const newEdits = { ...prev }
        delete newEdits[claimId]
        return newEdits
      })
      showToast('Claim approved successfully!', 'success')
    } catch (error) {
      console.error('Error approving claim:', error)
      showToast(error instanceof Error ? error.message : 'Failed to approve claim', 'error')
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
      showToast('Claim rejected.', 'success')
    } catch (error) {
      console.error('Error rejecting claim:', error)
      showToast(error instanceof Error ? error.message : 'Failed to reject claim', 'error')
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
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Country Code</p>
                          {editingClaim === claim.id ? (
                            <input
                              type="text"
                              value={claimEdits[claim.id]?.countryCode || claim.country_code || ''}
                              onChange={(e) => {
                                const value = e.target.value.toLowerCase().trim().substring(0, 2)
                                setClaimEdits(prev => ({
                                  ...prev,
                                  [claim.id]: {
                                    ...prev[claim.id],
                                    countryCode: value,
                                    restaurantNumber: prev[claim.id]?.restaurantNumber || claim.restaurant_number || '',
                                  }
                                }))
                              }}
                              placeholder="e.g., mx, nl, es"
                              maxLength={2}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-600">
                              {claim.country_code ? claim.country_code.toUpperCase() : 'Not set'}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Restaurant Number</p>
                          {editingClaim === claim.id ? (
                            <input
                              type="text"
                              value={claimEdits[claim.id]?.restaurantNumber || claim.restaurant_number || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').substring(0, 5).padStart(5, '0')
                                setClaimEdits(prev => ({
                                  ...prev,
                                  [claim.id]: {
                                    ...prev[claim.id],
                                    countryCode: prev[claim.id]?.countryCode || claim.country_code || '',
                                    restaurantNumber: value,
                                  }
                                }))
                              }}
                              placeholder="e.g., 00002"
                              maxLength={5}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-600">
                              {claim.restaurant_number || 'Not set'}
                            </p>
                          )}
                        </div>
                        {(editingClaim === claim.id || (claim.country_code && claim.restaurant_number && claim.country_code !== 'xx' && claim.restaurant_number !== '00000')) && (
                          <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Restaurant URL:</p>
                            <p className="text-sm text-blue-800 font-mono break-all">
                              https://bitereserve.com/r/{editingClaim === claim.id 
                                ? `${claimEdits[claim.id]?.countryCode || claim.country_code || 'xx'}/${claimEdits[claim.id]?.restaurantNumber || claim.restaurant_number || '00000'}`
                                : `${claim.country_code}/${claim.restaurant_number}`
                              }
                            </p>
                            {editingClaim === claim.id && (
                              <p className="text-xs text-blue-600 mt-1">
                                Make sure the country code (2 letters) and restaurant number (5 digits) are correct before approving.
                              </p>
                            )}
                            {!editingClaim && claim.is_claimed && (
                              <p className="text-xs text-blue-600 mt-1">
                                This is an existing restaurant that was claimed. The URL is already set.
                              </p>
                            )}
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
                          <p className="text-sm font-semibold text-gray-700 mb-1">Restaurant Type</p>
                          <p className="text-sm text-gray-600">
                            {(() => {
                              // If restaurant has a valid URL (not placeholder values), it's an existing restaurant
                              const hasValidUrl = claim.country_code && 
                                                 claim.restaurant_number && 
                                                 claim.country_code !== 'xx' && 
                                                 claim.restaurant_number !== '00000' &&
                                                 claim.country_code.length === 2 &&
                                                 claim.restaurant_number.length === 5
                              
                              // If is_claimed is true, it means it was an existing restaurant that was claimed (found via search)
                              // If it has a valid URL (not placeholders), it's definitely an existing restaurant
                              // Otherwise, it's a new restaurant
                              const isExisting = claim.is_claimed === true || hasValidUrl
                              
                              return isExisting ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1V12h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Existing Restaurant (Claimed)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  New Restaurant
                                </span>
                              )
                            })()}
                          </p>
                        </div>
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

                      {/* Business Links */}
                      {claim.business_links && typeof claim.business_links === 'object' && Object.keys(claim.business_links).length > 0 && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Business Card Links</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(claim.business_links).map(([key, link]: [string, any]) => {
                              if (!link || !link.enabled || !link.url) return null
                              
                              const linkLabels: Record<string, string> = {
                                opentable: 'OpenTable',
                                resy: 'Resy',
                                whatsapp: 'WhatsApp',
                                tripadvisor: 'TripAdvisor',
                                instagram: 'Instagram',
                                facebook: 'Facebook',
                                twitter: 'Twitter',
                                yelp: 'Yelp',
                                email: 'Email',
                                phone: 'Phone',
                                website: 'Website',
                                maps: 'Maps',
                              }
                              
                              const label = link.label || linkLabels[key] || key
                              
                              return (
                                <div key={key} className="flex items-start gap-2 p-2 bg-white rounded border border-blue-100">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-accent-600 hover:underline break-all"
                                    >
                                      {link.url}
                                    </a>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {Object.values(claim.business_links).filter((link: any) => link?.enabled && link?.url).length === 0 && (
                            <p className="text-xs text-gray-500 italic">No enabled links</p>
                          )}
                        </div>
                      )}
                    </div>

                    {(claim.claim_status === 'pending' || claim.claim_status === null) && (
                      <div className="flex flex-col gap-2">
                        {editingClaim === claim.id ? (
                          <>
                            <button
                              onClick={() => handleApprove(claim.id)}
                              disabled={processing === claim.id}
                              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processing === claim.id ? 'Processing...' : 'Approve & Save URL'}
                            </button>
                            <button
                              onClick={() => handleCancelEdit(claim.id)}
                              disabled={processing === claim.id}
                              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClaim(claim.id)}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                            >
                              Edit URL
                            </button>
                            <button
                              onClick={() => handleApprove(claim.id)}
                              disabled={processing === claim.id || (claim.country_code === 'xx' || !claim.country_code || claim.restaurant_number === '00000' || !claim.restaurant_number)}
                              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={(claim.country_code === 'xx' || !claim.country_code || claim.restaurant_number === '00000' || !claim.restaurant_number) ? 'Please set Country Code and Restaurant Number first' : ''}
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
                          </>
                        )}
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
