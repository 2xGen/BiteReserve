'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import BusinessLinksEditor from '@/components/BusinessLinksEditor'

const linkTypeLabels: Record<string, string> = {
  opentable: 'Book on OpenTable',
  resy: 'Reserve on Resy',
  whatsapp: 'Message on WhatsApp',
  tripadvisor: 'View on TripAdvisor',
  instagram: 'Follow on Instagram',
  facebook: 'Follow on Facebook',
  twitter: 'Follow on Twitter',
  yelp: 'View on Yelp',
  email: 'Email Us',
  phone: 'Call Us',
  website: 'Visit Website',
  maps: 'View on Map',
}
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

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

function EditPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('id')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  
  const [formData, setFormData] = useState({
    tagline: '',
    address: '',
    phone: '',
    website: '',
    cuisineTypes: [] as string[],
    features: [] as string[],
    description: '',
    priceLevel: '',
    logoUrl: '',
    coverBannerColor: '#1F2937',
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
      // Section 1: Call, Map, Web, Book (max 4)
      phone: { url: '', enabled: false, order: 1, section: 1 },
      maps: { url: '', enabled: false, order: 2, section: 1 },
      website: { url: '', enabled: false, order: 3, section: 1 },
      opentable: { url: '', enabled: false, order: 4, section: 1 },
      resy: { url: '', enabled: false, order: 4, section: 1 },
      // Section 2: Other links (max 8)
      whatsapp: { url: '', enabled: false, order: 1, section: 2 },
      tripadvisor: { url: '', enabled: false, order: 2, section: 2 },
      instagram: { url: '', enabled: false, order: 3, section: 2 },
      facebook: { url: '', enabled: false, order: 4, section: 2 },
      twitter: { url: '', enabled: false, order: 5, section: 2 },
      yelp: { url: '', enabled: false, order: 6, section: 2 },
      email: { url: '', enabled: false, order: 7, section: 2 },
    } as Record<string, { url: string; enabled: boolean; order: number; section: number; label?: string; icon?: string; is_custom?: boolean }>,
    customLinks: [] as Array<{ id: string; url: string; label: string; icon: string; enabled: boolean; order: number; section: number }>,
  })

  useEffect(() => {
    if (user && restaurantId) {
      fetchRestaurant()
      fetchSubscription()
    }
  }, [user, restaurantId])

  const fetchSubscription = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/stripe/subscription-status?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const fetchRestaurant = async () => {
    if (!restaurantId) return

    try {
      const response = await fetch(`/api/restaurants/by-id/${restaurantId}`)
      if (!response.ok) throw new Error('Failed to fetch restaurant')
      const data = await response.json()
      setRestaurant(data.restaurant)
      
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
      
      // Initialize business links with default sections
      let businessLinks: Record<string, { url: string; enabled: boolean; order: number; section: number; label?: string; icon?: string }> = {
        // Section 1: Call, Map, Web, Book (max 4)
        phone: { url: '', enabled: false, order: 1, section: 1 },
        maps: { url: '', enabled: false, order: 2, section: 1 },
        website: { url: '', enabled: false, order: 3, section: 1 },
        opentable: { url: '', enabled: false, order: 4, section: 1 },
        resy: { url: '', enabled: false, order: 4, section: 1 },
        // Section 2: Other links (max 8)
        whatsapp: { url: '', enabled: false, order: 1, section: 2 },
        tripadvisor: { url: '', enabled: false, order: 2, section: 2 },
        instagram: { url: '', enabled: false, order: 3, section: 2 },
        facebook: { url: '', enabled: false, order: 4, section: 2 },
        twitter: { url: '', enabled: false, order: 5, section: 2 },
        yelp: { url: '', enabled: false, order: 6, section: 2 },
        email: { url: '', enabled: false, order: 7, section: 2 },
      }
      
      // Extract custom links from business_links
      let customLinks: Array<{ id: string; url: string; label: string; icon: string; enabled: boolean; order: number; section: number }> = []
      
      // Load business_links from database
      if (data.restaurant.business_links && typeof data.restaurant.business_links === 'object') {
        Object.entries(data.restaurant.business_links).forEach(([key, value]: [string, any]) => {
          // Check if it's a custom link
          if (key.startsWith('custom_') && value.is_custom) {
            const customId = key.replace('custom_', '')
            customLinks.push({
              id: customId,
              url: value.url || '',
              label: value.label || '',
              icon: value.icon || 'link',
              enabled: value.enabled !== false,
              order: value.order || 999,
              section: value.section || 2,
            })
          } else if (businessLinks[key]) {
            // Standard link - preserve section from database or use default
            businessLinks[key] = {
              url: value.url || '',
              enabled: value.enabled !== false,
              order: value.order || businessLinks[key].order,
              section: value.section !== undefined ? value.section : businessLinks[key].section,
              label: value.label,
              icon: value.icon,
            }
          }
        })
      }
      
      // Pre-fill phone, website, maps links from restaurant data if not in business_links
      if (data.restaurant.phone && (!businessLinks.phone.url || !businessLinks.phone.enabled)) {
        businessLinks.phone = { 
          url: `tel:${data.restaurant.phone}`, 
          enabled: true, 
          order: businessLinks.phone.order,
          section: businessLinks.phone.section
        }
      }
      if (data.restaurant.website && (!businessLinks.website.url || !businessLinks.website.enabled)) {
        businessLinks.website = { 
          url: data.restaurant.website, 
          enabled: true, 
          order: businessLinks.website.order,
          section: businessLinks.website.section
        }
      }
      if (data.restaurant.google_maps_url && (!businessLinks.maps.url || !businessLinks.maps.enabled)) {
        businessLinks.maps = { 
          url: data.restaurant.google_maps_url, 
          enabled: true, 
          order: businessLinks.maps.order,
          section: businessLinks.maps.section
        }
      }
      
      // Sort custom links by order
      customLinks.sort((a, b) => a.order - b.order)
      
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
        logoUrl: data.restaurant.logo_url || '',
        coverBannerColor: data.restaurant.cover_banner_color || '#1F2937',
        hours: hoursObj,
        businessLinks,
        customLinks,
      }))
    } catch (error) {
      console.error('Error fetching restaurant:', error)
      alert('Failed to load restaurant. Please try again.')
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

  const handleBusinessLinkChange = (type: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      businessLinks: {
        ...prev.businessLinks,
        [type]: {
          ...prev.businessLinks[type],
          [field]: value,
        }
      }
    }))
  }

  const addCustomLink = () => {
    const newId = `${Date.now()}`
    const maxOrder = Math.max(...formData.customLinks.map(l => l.order), ...Object.values(formData.businessLinks).filter(l => l.section === 2).map(l => l.order || 0), 0)
    setFormData(prev => ({
      ...prev,
      customLinks: [
        ...prev.customLinks,
        { id: newId, url: '', label: '', icon: 'link', enabled: true, order: maxOrder + 1, section: 2 }
      ]
    }))
  }

  const removeCustomLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customLinks: prev.customLinks.filter(link => link.id !== id)
    }))
  }

  const updateCustomLink = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customLinks: prev.customLinks.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !restaurantId) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PNG, JPEG, WebP, or SVG.')
      return
    }

    // Validate file size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    if (file.size > MAX_SIZE) {
      alert('File too large. Maximum size is 2MB.')
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('restaurantId', restaurantId)

      const response = await fetch('/api/restaurants/upload-logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload logo')
      }

      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        logoUrl: data.logoUrl,
      }))
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload logo. Please try again.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantId) return

    setSaving(true)
    try {
      // Build business_links object with sections and custom links
      const businessLinks: Record<string, any> = {}
        
        // Add enabled standard business links with sections
        Object.entries(formData.businessLinks).forEach(([key, link]) => {
          if (link.enabled && link.url.trim()) {
            // Auto-update phone, website, maps links from form fields
            if (key === 'phone' && formData.phone) {
              businessLinks[key] = { 
                url: `tel:${formData.phone}`, 
                enabled: true, 
                order: link.order || 999,
                section: link.section || 1,
                label: link.label
              }
            } else if (key === 'website' && formData.website) {
              businessLinks[key] = { 
                url: formData.website, 
                enabled: true, 
                order: link.order || 999,
                section: link.section || 1,
                label: link.label
              }
            } else if (key === 'maps' && formData.address) {
              businessLinks[key] = { 
                url: '', // Will be set server-side
                enabled: true, 
                order: link.order || 999,
                section: link.section || 1,
                label: link.label
              }
            } else {
              businessLinks[key] = {
                url: link.url.trim(),
                enabled: true,
                order: link.order || 999,
                section: link.section !== undefined ? link.section : 2, // Preserve section, default to 2 if not set
                label: link.label,
                icon: link.icon
              }
            }
          }
        })
        
        // Add enabled custom links
        formData.customLinks.forEach((customLink) => {
          if (customLink.enabled && customLink.url.trim() && customLink.label.trim()) {
            businessLinks[`custom_${customLink.id}`] = {
              url: customLink.url,
              enabled: true,
              order: customLink.order || 999,
              section: customLink.section || 2,
              label: customLink.label,
              icon: customLink.icon,
              is_custom: true
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
          businessLinks: Object.keys(businessLinks).length > 0 ? businessLinks : null,
          logoUrl: formData.logoUrl || null,
          coverBannerColor: formData.coverBannerColor || null,
          whatsappNumber: formData.businessLinks.whatsapp?.url ? formData.businessLinks.whatsapp.url.replace('https://wa.me/', '').replace(/\D/g, '') : null,
          bookingUrl: (() => {
            // Find the book link in section 1 (any link that's not phone, maps, or website)
            const bookLink = Object.entries(formData.businessLinks).find(([key, link]) => 
              link.enabled && link.section === 1 && key !== 'phone' && key !== 'maps' && key !== 'website'
            )
            return bookLink ? bookLink[1].url : null
          })(),
          bookingPlatform: (() => {
            // Determine booking platform from section 1 book link
            const bookLink = Object.entries(formData.businessLinks).find(([key, link]) => 
              link.enabled && link.section === 1 && key !== 'phone' && key !== 'maps' && key !== 'website'
            )
            if (bookLink) {
              const key = bookLink[0]
              if (key === 'opentable') return 'opentable'
              if (key === 'resy') return 'resy'
              return 'custom' // For other link types used as booking
            }
            return null
          })(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update restaurant details')
      }

      alert('Restaurant information updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating restaurant:', error)
      alert(error instanceof Error ? error.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Restaurant not found.</p>
            <Link href="/dashboard" className="text-accent-600 hover:underline">
              Back to Dashboard
            </Link>
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Edit Restaurant Information</h1>
            <p className="text-gray-600">Update your restaurant details. Changes will appear on your public listing page.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <div className="space-y-6">
              {/* Restaurant Name (read-only) */}
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-accent-800 font-semibold mb-1">Restaurant</p>
                <p className="text-lg font-bold text-accent-900">{restaurant.name}</p>
              </div>

              {/* Page Customization (Pro/Business only) */}
              {subscription && (subscription.plan === 'pro' || subscription.plan === 'business') && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Page Customization
                    <span className="ml-2 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-semibold rounded-full">Pro Feature</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Restaurant Logo
                      </label>
                      <div className="flex items-start gap-4">
                        {formData.logoUrl && (
                          <div className="flex-shrink-0">
                            <img 
                              src={formData.logoUrl} 
                              alt="Restaurant logo" 
                              className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-50 file:text-accent-700 hover:file:bg-accent-100 disabled:opacity-50"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPEG, WebP, or SVG. Max 2MB. Recommended: 200x200px or larger.
                          </p>
                          {uploadingLogo && (
                            <p className="text-xs text-accent-600 mt-1">Uploading...</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Page Accent Color */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Page Accent Color
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Match the page with your brand color
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { name: 'Emerald', value: '#059669' },
                          { name: 'Navy', value: '#1E3A8A' },
                          { name: 'Burgundy', value: '#7F1D1D' },
                          { name: 'Slate', value: '#475569' },
                        ].map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, coverBannerColor: color.value }))}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              formData.coverBannerColor === color.value
                                ? 'border-accent-600 ring-2 ring-accent-200 bg-accent-50'
                                : 'border-gray-300 hover:border-gray-400 bg-white'
                            }`}
                          >
                            <div
                              className="w-12 h-12 rounded-lg border-2 border-gray-200"
                              style={{ backgroundColor: color.value }}
                            />
                            <span className={`text-xs font-medium ${
                              formData.coverBannerColor === color.value ? 'text-accent-700' : 'text-gray-600'
                            }`}>
                              {color.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This color creates a subtle shadow accent on your restaurant page
                      </p>
                    </div>
                  </div>
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
                <p className="text-xs text-gray-500 mt-1">
                  A short, catchy phrase that appears below your restaurant name on the listing page.
                </p>
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
                <p className="mt-1 text-xs text-gray-500">
                  We recommend including the country code (e.g., +1 for US/Canada, +44 for UK)
                </p>
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

              {/* Business Links Section */}
              <BusinessLinksEditor
                businessLinks={formData.businessLinks}
                customLinks={formData.customLinks}
                onBusinessLinkChange={handleBusinessLinkChange}
                onCustomLinkAdd={addCustomLink}
                onCustomLinkRemove={removeCustomLink}
                onCustomLinkUpdate={updateCustomLink}
                phone={formData.phone}
                website={formData.website}
                address={formData.address}
              />

              {/* Old Business Links Section - REMOVED */}
              {false && <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Business Card Links</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which links to display and their order. All clicks are tracked and shown in your dashboard.
                </p>
                
                {/* Enabled Links Ordering (Pro/Business only) */}
                {subscription && (subscription.plan === 'pro' || subscription.plan === 'business') && (() => {
                  const enabledLinks = Object.entries(formData.businessLinks)
                    .filter(([_, link]) => link.enabled && link.url.trim())
                    .sort(([_, a], [__, b]) => (a.order || 999) - (b.order || 999))
                  
                  if (enabledLinks.length > 1) {
                    return (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Link Display Order</label>
                        <div className="space-y-2">
                          {enabledLinks.map(([type, link], index) => (
                            <div key={type} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                              <button
                                type="button"
                                onClick={() => {
                                  if (index > 0) {
                                    const prevType = enabledLinks[index - 1][0]
                                    const prevOrder = formData.businessLinks[prevType].order
                                    handleBusinessLinkChange(type, 'order', prevOrder)
                                    handleBusinessLinkChange(prevType, 'order', link.order)
                                  }
                                }}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (index < enabledLinks.length - 1) {
                                    const nextType = enabledLinks[index + 1][0]
                                    const nextOrder = formData.businessLinks[nextType].order
                                    handleBusinessLinkChange(type, 'order', nextOrder)
                                    handleBusinessLinkChange(nextType, 'order', link.order)
                                  }
                                }}
                                disabled={index === enabledLinks.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move down"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <span className="flex-1 text-sm font-medium text-gray-700">
                                {linkTypeLabels[type] || type}
                              </span>
                              <span className="text-xs text-gray-400">#{link.order}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
                
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
              </div>}

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
                {formData.features.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {formData.features.join(', ')}
                  </p>
                )}
              </div>

              {/* Opening Hours */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opening Hours
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
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>📝 This description appears on your public BiteReserve listing page.</strong> Write a compelling description that helps diners understand what makes your restaurant special.
                  </p>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your restaurant's cuisine, atmosphere, specialties, and what makes it unique. This will be visible to potential diners on your BiteReserve page."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function EditPage() {
  return (
    <ProtectedRoute>
      <EditPageContent />
    </ProtectedRoute>
  )
}
