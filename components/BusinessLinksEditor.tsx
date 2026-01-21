'use client'

import { useState } from 'react'

// Icon components for each link type (in green/accent color)
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
    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  ),
  yelp: (
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.505 13.18c-.186-2.027-1.182-3.767-2.889-4.77 0 0-.09-.063-.186-.032l-1.295.399a.134.134 0 00-.078.159c.366 1.182.399 2.306.2 3.255-.19.916-.59 1.71-1.157 2.333a.124.124 0 00-.022.102.119.119 0 00.078.082l1.895.614c.046.015.093.01.135-.016.636-.398 1.155-.912 1.522-1.506.255-.413.439-.865.61-1.354a.114.114 0 00-.013-.107zM13.044 3.25c1.025-.317 1.99-.476 2.853-.476 1.585 0 2.77.559 3.469 1.648.686 1.073.879 2.571.544 4.416a.116.116 0 01-.15.09l-1.92-.558a.115.115 0 01-.08-.104c.032-1.238-.29-2.378-.956-3.333-.681-.984-1.66-1.615-2.884-1.884a.12.12 0 01-.092-.053.118.118 0 01-.018-.11l.623-1.764a.11.11 0 01.074-.066c.02-.006.04-.006.057-.012zm-.013 17.706c-.352 1.977-1.073 3.534-2.11 4.603-1.056 1.09-2.52 1.643-4.312 1.643-1.48 0-3.255-.476-5.22-1.412a.118.118 0 01-.07-.1.115.115 0 01.045-.109l1.542-1.144a.115.115 0 01.135-.013c1.593 1.017 3.017 1.49 4.198 1.49 1.318 0 2.393-.426 3.157-1.26.776-.846 1.33-2.062 1.642-3.614a.12.12 0 01.089-.09l2.02-.264a.118.118 0 01.124.098c.022.16.044.32.044.485 0 .031-.006.062-.006.094 0 .031 0 .063.006.094zm-2.245-5.973c-.9.063-1.815-.062-2.706-.375-1.01-.345-1.893-.908-2.57-1.643-.08-.086-.155-.18-.224-.28-1.027-1.498-1.378-3.29-.967-5.253.448-2.132 1.775-3.888 3.855-5.151a.112.112 0 01.1-.017l1.632.514c.046.015.08.05.092.097.156.602.453 1.123.87 1.543.526.53 1.18.888 1.907 1.046.057.012.11.05.132.107.024.066.008.136-.045.184l-1.05 1.17a.09.09 0 01-.05.032c-.016 0-.032.006-.05.006-.026 0-.05-.006-.075-.015-.89-.263-1.684-.24-2.34.072-.703.334-1.12.93-1.217 1.767-.118 1.016.276 2.132 1.128 3.255.414.558.94 1.047 1.548 1.442.625.408 1.315.71 2.044.893.058.016.116.032.178.045.02.006.04.006.057.006.028 0 .05-.01.072-.024l1.595-.89a.116.116 0 01.119-.01c.043.025.072.07.08.12 0 .015.006.032.006.05-.032.398-.128.767-.29 1.093-.013.024-.02.05-.02.078 0 .032.01.06.028.085.02.03.05.05.085.057l.18.024z"/>
    </svg>
  ),
  email: (
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  website: (
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  maps: (
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  ),
  book: (
    <svg className="w-5 h-5 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
}

interface BusinessLink {
  url: string
  enabled: boolean
  order: number
  section: number
  label?: string
  icon?: string
  is_custom?: boolean
}

interface BusinessLinksEditorProps {
  businessLinks: Record<string, BusinessLink>
  customLinks: Array<{ id: string; url: string; label: string; icon: string; enabled: boolean; order: number; section: number }>
  onBusinessLinkChange: (type: string, field: string, value: any) => void
  onCustomLinkAdd: () => void
  onCustomLinkRemove: (id: string) => void
  onCustomLinkUpdate: (id: string, field: string, value: any) => void
  phone?: string
  website?: string
  address?: string
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

const iconOptions = [
  { value: 'link', label: 'Link' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'website', label: 'Website' },
]

export default function BusinessLinksEditor({
  businessLinks,
  customLinks,
  onBusinessLinkChange,
  onCustomLinkAdd,
  onCustomLinkRemove,
  onCustomLinkUpdate,
  phone,
  website,
  address,
}: BusinessLinksEditorProps) {
  // Get Section 1 links (Call, Map, Web, Book - max 4)
  const section1Links = Object.entries(businessLinks)
    .filter(([type, link]) => link.section === 1 && (link.enabled || type === 'phone' || type === 'maps' || type === 'website' || type === 'opentable' || type === 'resy'))
    .sort(([_, a], [__, b]) => (a.order || 999) - (b.order || 999))
    .slice(0, 4); // Max 4

  // Get Section 2 links (max 8 total including custom)
  // Include all possible Section 2 standard link types
  const section2StandardTypes = ['opentable', 'resy', 'whatsapp', 'instagram', 'facebook', 'tripadvisor', 'yelp', 'email', 'phone', 'website', 'maps']
  const section2StandardLinks = section2StandardTypes
    .map((type, index) => {
      const link = businessLinks[type]
      // Only include if it's in section 2 or has no section (defaults to section 2)
      if (link && (link.section === 2 || !link.section)) {
        return [type, link, index] as [string, BusinessLink, number]
      }
      // Include if it doesn't exist yet
      if (!link) {
        return [type, { url: '', enabled: false, order: 999, section: 2 }, index] as [string, BusinessLink, number]
      }
      // Include if it's in section 1 but disabled (can be moved to section 2)
      if (link.section === 1 && !link.enabled) {
        return [type, { url: '', enabled: false, order: 999, section: 2 }, index] as [string, BusinessLink, number]
      }
      // Exclude if it's enabled in section 1 (it's being used there)
      if (link.section === 1 && link.enabled) {
        return null
      }
      // Include anything else
      return [type, { url: '', enabled: false, order: 999, section: 2 }, index] as [string, BusinessLink, number]
    })
    .filter((entry): entry is [string, BusinessLink, number] => entry !== null)
    .sort(([_, a, indexA], [__, b, indexB]) => {
      // Sort enabled links by order, disabled links at the end (in fixed order)
      if (a.enabled && !b.enabled) return -1
      if (!a.enabled && b.enabled) return 1
      if (a.enabled && b.enabled) {
        return (a.order || 999) - (b.order || 999)
      }
      // Both disabled - keep original order
      return indexA - indexB
    })
    .map(([type, link]) => [type, link] as [string, BusinessLink]);

  const section2CustomLinks = customLinks
    .filter(link => link.section === 2)
    .sort((a, b) => a.order - b.order);

  const section2CustomLinksFormatted: [string, BusinessLink & { id: string }][] = section2CustomLinks.map(link => {
    const linkData = { ...link, is_custom: true, id: link.id };
    return [`custom_${link.id}`, linkData] as [string, BusinessLink & { id: string }];
  });
  
  const section2AllLinks: [string, BusinessLink & { id?: string }][] = [
    ...section2StandardLinks, 
    ...section2CustomLinksFormatted
  ]
    .sort(([_, a], [__, b]) => (a.order || 999) - (b.order || 999))
    .slice(0, 8); // Max 8

  const moveLink = (type: string, direction: 'up' | 'down', section: number) => {
    let enabledLinks: [string, BusinessLink & { id?: string }][];
    if (section === 1) {
      enabledLinks = section1Links.filter(([_, link]) => link.enabled);
    } else {
      enabledLinks = section2AllLinks.filter(([_, link]) => link.enabled);
    }
    const currentIndex = enabledLinks.findIndex(([t]) => t === type || (type.startsWith('custom_') && t === type));
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex > 0) {
      const prevType = enabledLinks[currentIndex - 1][0];
      const prevLink = enabledLinks[currentIndex - 1][1];
      const currentLink = enabledLinks[currentIndex][1];
      const prevOrder = prevLink.order || 0;
      const currentOrder = currentLink.order || 0;
      if ((prevLink as any).is_custom && (prevLink as any).id) {
        onCustomLinkUpdate((prevLink as any).id, 'order', currentOrder);
      } else {
        onBusinessLinkChange(prevType, 'order', currentOrder);
      }
      if ((currentLink as any).is_custom && (currentLink as any).id) {
        const customId = type.replace('custom_', '');
        onCustomLinkUpdate(customId, 'order', prevOrder);
      } else {
        onBusinessLinkChange(type, 'order', prevOrder);
      }
    } else if (direction === 'down' && currentIndex < enabledLinks.length - 1) {
      const nextType = enabledLinks[currentIndex + 1][0];
      const nextLink = enabledLinks[currentIndex + 1][1];
      const currentLink = enabledLinks[currentIndex][1];
      const nextOrder = nextLink.order || 0;
      const currentOrder = currentLink.order || 0;
      if ((nextLink as any).is_custom && (nextLink as any).id) {
        onCustomLinkUpdate((nextLink as any).id, 'order', currentOrder);
      } else {
        onBusinessLinkChange(nextType, 'order', currentOrder);
      }
      if ((currentLink as any).is_custom && (currentLink as any).id) {
        const customId = type.replace('custom_', '');
        onCustomLinkUpdate(customId, 'order', nextOrder);
      } else {
        onBusinessLinkChange(type, 'order', nextOrder);
      }
    }
  }

  // Helper function to render a Section 1 link
  const renderSection1Link = (type: string, link: BusinessLink) => {
    const enabledSection1 = section1Links.filter(([_, l]) => l.enabled);
    const currentIndex = enabledSection1.findIndex(([t]) => t === type);

    if (type === 'phone') {
      return (
        <div key={type} className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={link.enabled || false}
              onChange={(e) => {
                onBusinessLinkChange('phone', 'enabled', e.target.checked)
                if (e.target.checked) {
                  onBusinessLinkChange('phone', 'section', 1)
                  onBusinessLinkChange('phone', 'url', phone ? `tel:${phone}` : '')
                  onBusinessLinkChange('phone', 'order', section1Links.length + 1)
                }
              }}
              className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
            />
            <div className="flex items-center gap-2 flex-1">
              {LinkIcons.phone}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Call</label>
                <p className="text-xs text-gray-500">Auto-filled from phone number</p>
              </div>
            </div>
            {link.enabled && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveLink('phone', 'up', 1)}
                  disabled={currentIndex === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveLink('phone', 'down', 1)}
                  disabled={currentIndex === enabledSection1.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (type === 'maps') {
      return (
        <div key={type} className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={link.enabled || false}
              onChange={(e) => {
                onBusinessLinkChange('maps', 'enabled', e.target.checked)
                if (e.target.checked) {
                  onBusinessLinkChange('maps', 'section', 1)
                  onBusinessLinkChange('maps', 'url', '')
                  onBusinessLinkChange('maps', 'order', section1Links.length + 1)
                }
              }}
              className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
            />
            <div className="flex items-center gap-2 flex-1">
              {LinkIcons.maps}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Map</label>
                <p className="text-xs text-gray-500">Auto-filled from address</p>
              </div>
            </div>
            {link.enabled && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveLink('maps', 'up', 1)}
                  disabled={currentIndex === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveLink('maps', 'down', 1)}
                  disabled={currentIndex === enabledSection1.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (type === 'website') {
      return (
        <div key={type} className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={link.enabled || false}
              onChange={(e) => {
                onBusinessLinkChange('website', 'enabled', e.target.checked)
                if (e.target.checked) {
                  onBusinessLinkChange('website', 'section', 1)
                  onBusinessLinkChange('website', 'url', website || '')
                  onBusinessLinkChange('website', 'order', section1Links.length + 1)
                }
              }}
              className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
            />
            <div className="flex items-center gap-2 flex-1">
              {LinkIcons.website}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Web</label>
                <p className="text-xs text-gray-500">Auto-filled from website</p>
              </div>
            </div>
            {link.enabled && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveLink('website', 'up', 1)}
                  disabled={currentIndex === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveLink('website', 'down', 1)}
                  disabled={currentIndex === enabledSection1.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Handle Book button - simple URL input
    if (type === 'opentable' || type === 'resy') {
      // Use opentable as the book link type (but treat it as generic "book")
      const bookLink = businessLinks.opentable || businessLinks.resy || { 
        url: '', 
        enabled: false, 
        order: 999, 
        section: 1 
      }
      const isBookEnabled = (businessLinks.opentable?.enabled && businessLinks.opentable?.section === 1) || 
                           (businessLinks.resy?.enabled && businessLinks.resy?.section === 1)
      const bookType = businessLinks.opentable?.enabled ? 'opentable' : 'resy'
      const actualBookLink = businessLinks.opentable || businessLinks.resy || bookLink
      
      return (
        <div key="book" className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isBookEnabled || false}
              onChange={(e) => {
                if (e.target.checked) {
                  // Enable opentable as the book link (we'll use it generically)
                  onBusinessLinkChange('opentable', 'enabled', true)
                  onBusinessLinkChange('opentable', 'section', 1)
                  onBusinessLinkChange('opentable', 'order', section1Links.length + 1)
                  // Disable resy if it was enabled
                  if (businessLinks.resy?.section === 1) {
                    onBusinessLinkChange('resy', 'enabled', false)
                  }
                } else {
                  // Disable book
                  if (businessLinks.opentable?.section === 1) {
                    onBusinessLinkChange('opentable', 'enabled', false)
                  }
                  if (businessLinks.resy?.section === 1) {
                    onBusinessLinkChange('resy', 'enabled', false)
                  }
                }
              }}
              className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
            />
            <div className="flex items-center gap-2 flex-1">
              {LinkIcons.book}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Book</label>
                <p className="text-xs text-gray-500">Booking link</p>
              </div>
            </div>
            {isBookEnabled && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveLink(bookType, 'up', 1)}
                  disabled={currentIndex === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveLink(bookType, 'down', 1)}
                  disabled={currentIndex === enabledSection1.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {isBookEnabled && (
            <div className="ml-7 mt-2">
              <input
                type="url"
                value={actualBookLink.url || ''}
                onChange={(e) => onBusinessLinkChange(bookType, 'url', e.target.value)}
                placeholder="https://your-booking-link.com"
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500"
              />
            </div>
          )}
        </div>
      )
    }

    // Handle all other standard link types (whatsapp, instagram, facebook, etc.)
    return (
      <div key={type} className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={link.enabled || false}
            onChange={(e) => {
              onBusinessLinkChange(type, 'enabled', e.target.checked)
              if (e.target.checked) {
                onBusinessLinkChange(type, 'section', 1)
                if (!link.order) {
                  onBusinessLinkChange(type, 'order', section1Links.length + 1)
                }
              }
            }}
            className="mt-1 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
          />
          <div className="flex items-center gap-2 flex-1">
            {LinkIcons[type as keyof typeof LinkIcons] || LinkIcons.website}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {linkTypeLabels[type] || type}
              </label>
              {type === 'whatsapp' ? (
                <input
                  type="text"
                  value={link?.url?.replace('https://wa.me/', '') || ''}
                  onChange={(e) => {
                    const phoneNumber = e.target.value.replace(/\D/g, '')
                    onBusinessLinkChange(type, 'url', phoneNumber ? `https://wa.me/${phoneNumber}` : '')
                  }}
                  placeholder="Phone number (e.g., +14155550123)"
                  disabled={!link?.enabled}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500 disabled:bg-gray-100"
                />
              ) : type === 'email' ? (
                <input
                  type="email"
                  value={link?.url?.replace('mailto:', '') || ''}
                  onChange={(e) => onBusinessLinkChange(type, 'url', `mailto:${e.target.value}`)}
                  placeholder="contact@yourrestaurant.com"
                  disabled={!link?.enabled}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500 disabled:bg-gray-100"
                />
              ) : (
                <input
                  type="url"
                  value={link?.url || ''}
                  onChange={(e) => onBusinessLinkChange(type, 'url', e.target.value)}
                  placeholder={`https://${type === 'instagram' ? 'instagram.com' : type === 'facebook' ? 'facebook.com' : type === 'tripadvisor' ? 'tripadvisor.com' : 'yelp.com'}/...`}
                  disabled={!link?.enabled}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500 disabled:bg-gray-100"
                />
              )}
            </div>
          </div>
          {link.enabled && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveLink(type, 'up', 1)}
                disabled={currentIndex === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveLink(type, 'down', 1)}
                disabled={currentIndex === enabledSection1.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Business Card Links</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose which links to display and their order. All clicks are tracked and shown in your dashboard.
        </p>
      </div>

      {/* Section 1: Call, Map, Web, Book (Max 4) */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Section 1: Hero Buttons</h3>
            <p className="text-xs text-gray-600 mt-1">Call, Map, Web, Book (max 4 buttons)</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded">
            {section1Links.filter(([_, link]) => link.enabled).length}/4
          </span>
        </div>

        {/* Section 1 Links - Rendered in order */}
        <div className="space-y-3">
          {(() => {
            // Create entries for the 4 Section 1 buttons: phone, maps, website, book
            // Use opentable as the book type (but treat it generically)
            const bookType = (businessLinks.opentable?.enabled && businessLinks.opentable?.section === 1) ? 'opentable' :
                           (businessLinks.resy?.enabled && businessLinks.resy?.section === 1) ? 'resy' : 'opentable'
            const bookLink = businessLinks.opentable || businessLinks.resy || { 
              url: '', 
              enabled: false, 
              order: 999, 
              section: 1 
            }
            
            const section1Buttons = [
              ['phone', businessLinks.phone || { url: '', enabled: false, order: 999, section: 1 }],
              ['maps', businessLinks.maps || { url: '', enabled: false, order: 999, section: 1 }],
              ['website', businessLinks.website || { url: '', enabled: false, order: 999, section: 1 }],
              [bookType, bookLink]
            ] as [string, BusinessLink][]

            // Separate enabled and disabled
            const enabled = section1Buttons
              .filter(([type, link]) => {
                // For book, check if opentable or resy is enabled in section 1
                if (type === 'opentable' || type === 'resy') {
                  return (businessLinks.opentable?.enabled && businessLinks.opentable?.section === 1) ||
                         (businessLinks.resy?.enabled && businessLinks.resy?.section === 1)
                }
                return link.enabled
              })
              .sort(([_, a], [__, b]) => (a.order || 999) - (b.order || 999))

            const disabled = section1Buttons
              .filter(([type, link]) => {
                // For book, check if no book option is enabled
                if (type === 'opentable' || type === 'resy') {
                  return !(businessLinks.opentable?.enabled && businessLinks.opentable?.section === 1) &&
                         !(businessLinks.resy?.enabled && businessLinks.resy?.section === 1)
                }
                return !link.enabled
              })
              // Keep disabled in a fixed order: phone, maps, website, book
              .sort(([a], [b]) => {
                const order = ['phone', 'maps', 'website', 'opentable', 'resy']
                return order.indexOf(a) - order.indexOf(b)
              })

            // Combine: enabled first (sorted by order), then disabled
            const ordered = [...enabled, ...disabled]

            // Remove duplicates - ensure each button type appears only once
            const seen = new Set<string>()
            return ordered
              .filter(([type]) => {
                // opentable and resy should only appear once as "book"
                if (type === 'opentable' || type === 'resy') {
                  if (seen.has('book')) return false
                  seen.add('book')
                  return true
                }
                if (seen.has(type)) return false
                seen.add(type)
                return true
              })
              .map(([type, link]) => renderSection1Link(type, link))
          })()}
        </div>
      </div>

      {/* Section 2: Other Links (Max 8) */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Section 2: Connect Links</h3>
            <p className="text-xs text-gray-600 mt-1">Social media, email, and custom links (max 8 total)</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded">
            {section2AllLinks.filter(([_, link]) => link.enabled).length}/8
          </span>
        </div>

        <div className="space-y-3">
          {/* All Section 2 Links - Rendered in order */}
          {section2AllLinks.map(([type, link]) => {
            const isCustom = type.startsWith('custom_')
            const customLink = isCustom ? customLinks.find(cl => cl.id === type.replace('custom_', '')) : null
            const enabledSection2 = section2AllLinks.filter(([_, l]) => l.enabled)
            const currentIndex = enabledSection2.findIndex(([t]) => t === type)

            if (isCustom && customLink) {
              // Render custom link
              return (
                <div key={type} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={customLink.enabled}
                      onChange={(e) => onCustomLinkUpdate(customLink.id, 'enabled', e.target.checked)}
                      className="mt-1 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customLink.label}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 20) // Max 20 chars
                            onCustomLinkUpdate(customLink.id, 'label', value)
                          }}
                          placeholder="Link name (max 20 chars)"
                          maxLength={20}
                          className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500"
                        />
                        <select
                          value={customLink.icon}
                          onChange={(e) => onCustomLinkUpdate(customLink.id, 'icon', e.target.value)}
                          className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500"
                        >
                          {iconOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => onCustomLinkRemove(customLink.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="url"
                        value={customLink.url}
                        onChange={(e) => onCustomLinkUpdate(customLink.id, 'url', e.target.value)}
                        placeholder="https://..."
                        disabled={!customLink.enabled}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500 disabled:bg-gray-100"
                      />
                    </div>
                    {customLink.enabled && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLink(type, 'up', 2)}
                          disabled={currentIndex === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(type, 'down', 2)}
                          disabled={currentIndex === enabledSection2.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            } else {
              // Render standard link
              return (
                <div key={type} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={link?.enabled || false}
                      onChange={(e) => {
                        onBusinessLinkChange(type, 'enabled', e.target.checked)
                        if (e.target.checked) {
                          onBusinessLinkChange(type, 'section', 2)
                          if (!link?.order) {
                            onBusinessLinkChange(type, 'order', section2AllLinks.length + 1)
                          }
                        }
                      }}
                      className="mt-1 w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {LinkIcons[type as keyof typeof LinkIcons] || LinkIcons.website}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {linkTypeLabels[type] || type}
                        </label>
                        {type === 'whatsapp' ? (
                          <input
                            type="text"
                            value={link?.url?.replace('https://wa.me/', '') || ''}
                            onChange={(e) => {
                              const phoneNumber = e.target.value.replace(/\D/g, '')
                              onBusinessLinkChange(type, 'url', phoneNumber ? `https://wa.me/${phoneNumber}` : '')
                            }}
                            placeholder="Phone number (e.g., +14155550123)"
                            disabled={!link?.enabled}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500 disabled:bg-gray-100"
                          />
                        ) : type === 'email' ? (
                          <input
                            type="email"
                            value={link?.url?.replace('mailto:', '') || ''}
                            onChange={(e) => onBusinessLinkChange(type, 'url', `mailto:${e.target.value}`)}
                            placeholder="contact@yourrestaurant.com"
                            disabled={!link?.enabled}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500 disabled:bg-gray-100"
                          />
                        ) : (
                          <input
                            type="url"
                            value={link?.url || ''}
                            onChange={(e) => onBusinessLinkChange(type, 'url', e.target.value)}
                            placeholder={`https://${type === 'instagram' ? 'instagram.com' : type === 'facebook' ? 'facebook.com' : type === 'tripadvisor' ? 'tripadvisor.com' : 'yelp.com'}/...`}
                            disabled={!link?.enabled}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500 disabled:bg-gray-100"
                          />
                        )}
                      </div>
                    </div>
                    {link?.enabled && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLink(type, 'up', 2)}
                          disabled={currentIndex === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(type, 'down', 2)}
                          disabled={currentIndex === enabledSection2.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
          })}

          {/* Add Custom Link Button */}
          {section2AllLinks.length < 8 && (
            <button
              type="button"
              onClick={onCustomLinkAdd}
              className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-accent-500 hover:text-accent-600 transition-colors"
            >
              + Add Custom Link
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
