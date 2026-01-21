'use client'

import { trackEvent } from '@/lib/tracking'

interface BusinessLink {
  url: string
  enabled?: boolean
  label?: string
  order?: number
  section?: number // 1 or 2
  icon?: string // For custom links
  is_custom?: boolean // For custom links
}

interface BusinessLinks {
  opentable?: BusinessLink
  resy?: BusinessLink
  whatsapp?: BusinessLink
  tripadvisor?: BusinessLink
  instagram?: BusinessLink
  facebook?: BusinessLink
  twitter?: BusinessLink
  yelp?: BusinessLink
  email?: BusinessLink
  phone?: BusinessLink
  website?: BusinessLink
  maps?: BusinessLink
}

interface BusinessCardLinksProps {
  restaurantId: string
  businessLinks: BusinessLinks | null | undefined
  // Fallback URLs if business links not set up yet
  phone?: string | null
  website?: string | null
  googleMapsUrl?: string | null
  whatsappNumber?: string | null
  bookingUrl?: string | null
  bookingPlatform?: string | null
  disableLinks?: boolean // For demo/test pages - prevents navigation
}

// Icon components for each link type
const LinkIcons = {
  opentable: (
    <img 
      src="https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/opentable%20logo.png" 
      alt="OpenTable" 
      className="w-5 h-5 object-contain"
    />
  ),
  resy: (
    <img 
      src="https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/resy%20logo.png" 
      alt="Resy" 
      className="w-5 h-5 object-contain"
    />
  ),
  whatsapp: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  tripadvisor: (
    <img 
      src="https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/trip%20advisor.png" 
      alt="TripAdvisor" 
      className="w-5 h-5 object-contain"
    />
  ),
  instagram: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  ),
  yelp: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.505 13.18c-.186-2.027-1.182-3.767-2.889-4.77 0 0-.09-.063-.186-.032l-1.295.399a.134.134 0 00-.078.159c.366 1.182.399 2.306.2 3.255-.19.916-.59 1.71-1.157 2.333a.124.124 0 00-.022.102.119.119 0 00.078.082l1.895.614c.046.015.093.01.135-.016.636-.398 1.155-.912 1.522-1.506.255-.413.439-.865.61-1.354a.114.114 0 00-.013-.107zM13.044 3.25c1.025-.317 1.99-.476 2.853-.476 1.585 0 2.77.559 3.469 1.648.686 1.073.879 2.571.544 4.416a.116.116 0 01-.15.09l-1.92-.558a.115.115 0 01-.08-.104c.032-1.238-.29-2.378-.956-3.333-.681-.984-1.66-1.615-2.884-1.884a.12.12 0 01-.092-.053.118.118 0 01-.018-.11l.623-1.764a.11.11 0 01.074-.066c.02-.006.04-.006.057-.012zm-.013 17.706c-.352 1.977-1.073 3.534-2.11 4.603-1.056 1.09-2.52 1.643-4.312 1.643-1.48 0-3.255-.476-5.22-1.412a.118.118 0 01-.07-.1.115.115 0 01.045-.109l1.542-1.144a.115.115 0 01.135-.013c1.593 1.017 3.017 1.49 4.198 1.49 1.318 0 2.393-.426 3.157-1.26.776-.846 1.33-2.062 1.642-3.614a.12.12 0 01.089-.09l2.02-.264a.118.118 0 01.124.098c.022.16.044.32.044.485 0 .031-.006.062-.006.094 0 .031 0 .063.006.094zm-2.245-5.973c-.9.063-1.815-.062-2.706-.375-1.01-.345-1.893-.908-2.57-1.643-.08-.086-.155-.18-.224-.28-1.027-1.498-1.378-3.29-.967-5.253.448-2.132 1.775-3.888 3.855-5.151a.112.112 0 01.1-.017l1.632.514c.046.015.08.05.092.097.156.602.453 1.123.87 1.543.526.53 1.18.888 1.907 1.046.057.012.11.05.132.107.024.066.008.136-.045.184l-1.05 1.17a.09.09 0 01-.05.032c-.016 0-.032.006-.05.006-.026 0-.05-.006-.075-.015-.89-.263-1.684-.24-2.34.072-.703.334-1.12.93-1.217 1.767-.118 1.016.276 2.132 1.128 3.255.414.558.94 1.047 1.548 1.442.625.408 1.315.71 2.044.893.058.016.116.032.178.045.02.006.04.006.057.006.028 0 .05-.01.072-.024l1.595-.89a.116.116 0 01.119-.01c.043.025.072.07.08.12 0 .015.006.032.006.05-.032.398-.128.767-.29 1.093-.013.024-.02.05-.02.078 0 .032.01.06.028.085.02.03.05.05.085.057l.18.024z"/>
    </svg>
  ),
  email: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  website: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  maps: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
}

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

// Helper to get icon for custom links
const getCustomIcon = (iconType: string = 'link') => {
  const iconMap: Record<string, JSX.Element> = {
    link: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    email: LinkIcons.email,
    phone: LinkIcons.phone,
    website: LinkIcons.website,
  }
  return iconMap[iconType] || iconMap.link
}

// Export helper to get section 1 links
export function getSection1Links(
  businessLinks: BusinessLinks | null | undefined,
  phone?: string | null,
  website?: string | null,
  googleMapsUrl?: string | null,
  bookingUrl?: string | null,
  bookingPlatform?: string | null
): Array<{ type: string; url: string; label: string; icon: JSX.Element; order: number }> {
  const section1Links: Array<{ type: string; url: string; label: string; icon: JSX.Element; order: number }> = []
  
  // Check if businessLinks has any enabled section 1 links
  let hasSection1Links = false
  if (businessLinks && typeof businessLinks === 'object' && Object.keys(businessLinks).length > 0) {
    Object.entries(businessLinks).forEach(([type, link]) => {
      if (link && link.enabled !== false && link.url && link.section === 1) {
        hasSection1Links = true
        // Determine icon - use book icon for any non-phone/maps/website link in section 1 (the book button)
        let icon = LinkIcons[type as keyof typeof LinkIcons] || LinkIcons.website
        if (type !== 'phone' && type !== 'maps' && type !== 'website' && link.section === 1) {
          icon = LinkIcons.book // Use generic book icon for booking button
        } else if (link.is_custom && link.icon) {
          icon = getCustomIcon(link.icon)
        }
        
        section1Links.push({
          type,
          url: link.url,
          label: link.label || linkTypeLabels[type] || type,
          icon,
          order: link.order || 999,
        })
      }
    })
    section1Links.sort((a, b) => a.order - b.order)
  }
  
  // If no section 1 links found in business_links, use fallback from restaurant data
  if (!hasSection1Links || section1Links.length === 0) {
    section1Links.length = 0 // Clear array
    if (phone) {
      section1Links.push({ type: 'phone', url: `tel:${phone}`, label: 'Call Us', icon: LinkIcons.phone, order: 1 })
    }
    if (googleMapsUrl) {
      section1Links.push({ type: 'maps', url: googleMapsUrl, label: 'View on Map', icon: LinkIcons.maps, order: 2 })
    }
    if (website) {
      section1Links.push({ type: 'website', url: website.startsWith('http') ? website : `https://${website}`, label: 'Visit Website', icon: LinkIcons.website, order: 3 })
    }
    if (bookingUrl) {
      const platform = bookingPlatform?.toLowerCase() || 'booking'
      section1Links.push({
        type: platform === 'opentable' ? 'opentable' : platform === 'resy' ? 'resy' : 'website',
        url: bookingUrl,
        label: platform === 'opentable' ? 'Book on OpenTable' : platform === 'resy' ? 'Reserve on Resy' : 'Book a Table',
        icon: LinkIcons[platform === 'opentable' ? 'opentable' : platform === 'resy' ? 'resy' : 'website'],
        order: 4,
      })
    }
    section1Links.sort((a, b) => a.order - b.order)
  }
  
  return section1Links
}

export default function BusinessCardLinks({
  restaurantId,
  businessLinks,
  phone,
  website,
  googleMapsUrl,
  whatsappNumber,
  bookingUrl,
  bookingPlatform,
  disableLinks = false,
}: BusinessCardLinksProps) {
  const handleLinkClick = (linkType: string, url: string) => {
    // If links are disabled (for demo pages), prevent navigation
    if (disableLinks) {
      return
    }
    
    // Map link type to event type
    const eventTypeMap: Record<string, any> = {
      opentable: 'opentable_click',
      resy: 'resy_click',
      whatsapp: 'whatsapp_click',
      tripadvisor: 'tripadvisor_click',
      instagram: 'instagram_click',
      facebook: 'facebook_click',
      twitter: 'twitter_click',
      yelp: 'yelp_click',
      email: 'email_click',
      phone: 'phone_click',
      website: 'website_click',
      maps: 'maps_click',
    }
    
    const eventType = eventTypeMap[linkType] || 'website_click'
    
    // Get source from URL
    const getSource = () => {
      if (typeof window === 'undefined') return undefined
      const params = new URLSearchParams(window.location.search)
      return params.get('utm_source') || params.get('c') || undefined
    }
    
    // Track the click
    trackEvent(restaurantId, eventType, { source: getSource() })
    
    // Small delay to ensure tracking fires
    setTimeout(() => {
      // Open link in new tab (or handle phone/email specially)
      if (linkType === 'phone' && url.startsWith('tel:')) {
        window.location.href = url
      } else if (linkType === 'email' && url.startsWith('mailto:')) {
        window.location.href = url
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    }, 100)
  }

  // Build list of section 2 links only (section 1 handled separately)
  const section2Links: Array<{ type: string; url: string; label: string; icon: JSX.Element; order: number }> = []

  // Check business_links first, then fallback to legacy fields
  let hasSection2Links = false
  if (businessLinks && typeof businessLinks === 'object') {
    Object.entries(businessLinks).forEach(([type, link]) => {
      if (link && link.enabled !== false && link.url) {
        // Only include section 2 links (or links without section specified, default to section 2)
        const section = link.section || 2
        if (section === 2) {
          hasSection2Links = true
          section2Links.push({
            type,
            url: link.url,
            label: link.label || linkTypeLabels[type] || type,
            icon: link.is_custom && link.icon 
              ? getCustomIcon(link.icon)
              : LinkIcons[type as keyof typeof LinkIcons] || LinkIcons.website,
            order: link.order || 999,
          })
        }
      }
    })
    section2Links.sort((a, b) => a.order - b.order)
  }
  
  // Fallback: if no section 2 links found, check legacy fields
  if (!hasSection2Links || section2Links.length === 0) {
    if (whatsappNumber) {
      section2Links.push({
        type: 'whatsapp',
        url: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`,
        label: 'Message on WhatsApp',
        icon: LinkIcons.whatsapp,
        order: 1,
      })
    }
    section2Links.sort((a, b) => a.order - b.order)
  }

  // Section 2 can be empty for unclaimed restaurants - that's fine, just return null
  if (section2Links.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Connect with Us
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {section2Links.map((link) => (
          <button
            key={link.type}
            onClick={() => handleLinkClick(link.type, link.url)}
            className="flex flex-col items-center justify-center gap-2 p-4 sm:p-5 border-2 border-gray-200 rounded-xl hover:border-accent-500 hover:bg-accent-50 transition-all duration-200 active:scale-95 group"
          >
            <div className="text-accent-600 group-hover:text-accent-700">
              {link.icon}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-accent-700 text-center">
              {link.label}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500 text-center">
        All bookings and communication are handled directly by the restaurant
      </p>
    </div>
  )
}

// Export a component for Section 1 Hero Buttons
export function Section1HeroButtons({
  restaurantId,
  businessLinks,
  phone,
  website,
  googleMapsUrl,
  bookingUrl,
  bookingPlatform,
  onPhoneClick,
  onAddressClick,
  onWebsiteClick,
}: BusinessCardLinksProps & {
  onPhoneClick?: () => void
  onAddressClick?: () => void
  onWebsiteClick?: () => void
}) {
  const section1Links = getSection1Links(businessLinks, phone, website, googleMapsUrl, bookingUrl, bookingPlatform)
  
  const handleLinkClick = (linkType: string, url: string) => {
    // Track the click - handle all link types
    const eventTypeMap: Record<string, any> = {
      phone: 'phone_click',
      maps: 'maps_click',
      website: 'website_click',
      opentable: 'opentable_click',
      resy: 'resy_click',
      whatsapp: 'whatsapp_click',
      tripadvisor: 'tripadvisor_click',
      instagram: 'instagram_click',
      facebook: 'facebook_click',
      twitter: 'twitter_click',
      yelp: 'yelp_click',
      email: 'email_click',
    }
    // For custom links, use website_click as default
    const eventType = linkType.startsWith('custom_') ? 'website_click' : (eventTypeMap[linkType] || 'website_click')
    trackEvent(restaurantId, eventType, {})
    
    // Handle special cases
    if (linkType === 'phone' && onPhoneClick) {
      onPhoneClick()
      return
    }
    if (linkType === 'maps' && onAddressClick) {
      onAddressClick()
      return
    }
    if (linkType === 'website' && onWebsiteClick) {
      onWebsiteClick()
      return
    }
    
    // Default: open link
    setTimeout(() => {
      if (linkType === 'phone' && url.startsWith('tel:')) {
        window.location.href = url
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    }, 100)
  }

  if (section1Links.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
      {section1Links.map((link) => {
        const isPhone = link.type === 'phone'
        const isMaps = link.type === 'maps'
        const isWebsite = link.type === 'website'
        // Book button is any link that's not phone, maps, or website (the 4th position)
        // This includes opentable, resy, or any other link type used for booking
        const isBook = !isPhone && !isMaps && !isWebsite
        
        return (
          <button
            key={link.type}
            onClick={() => handleLinkClick(link.type, link.url)}
            className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95 sm:hover:scale-105 ${
              isBook 
                ? 'bg-accent-500 hover:bg-accent-600 text-white'
                : isPhone
                ? 'bg-green-50 hover:bg-green-100 text-green-700'
                : isMaps
                ? 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${
              isBook 
                ? 'bg-white/20' 
                : isPhone
                ? 'bg-green-100'
                : isMaps
                ? 'bg-purple-100'
                : 'bg-blue-100'
            }`}>
              <div className={
                isBook 
                  ? 'text-white' 
                  : isPhone
                  ? 'text-green-600'
                  : isMaps
                  ? 'text-purple-600'
                  : 'text-blue-600'
              }>
                {link.icon}
              </div>
            </div>
            <span className="font-bold text-xs sm:text-sm">
              {link.label.length > 10 ? link.label.split(' ')[0] : link.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
