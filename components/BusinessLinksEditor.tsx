'use client'

import { useState } from 'react'

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
    .slice(0, 4) // Max 4

  // Get Section 2 links (max 8 total including custom)
  const section2StandardLinks = Object.entries(businessLinks)
    .filter(([type, link]) => link.section === 2 || (!link.section && type !== 'phone' && type !== 'maps' && type !== 'website' && type !== 'opentable' && type !== 'resy'))
    .sort(([_, a], [__, b]) => (a.order || 999) - (b.order || 999))

  const section2CustomLinks = customLinks
    .filter(link => link.section === 2)
    .sort((a, b) => a.order - b.order)

  const section2AllLinks = [
    ...section2StandardLinks, 
    ...section2CustomLinks.map(link => [`custom_${link.id}`, { ...link, is_custom: true, id: link.id } as BusinessLink & { id: string }] as [string, BusinessLink & { id: string }])
  ]
    .slice(0, 8) // Max 8

  const moveLink = (type: string, direction: 'up' | 'down', section: number) => {
    const links = section === 1 ? section1Links : section2AllLinks
    const currentIndex = links.findIndex(([t]) => t === type)
    
    if (currentIndex === -1) return
    
    if (direction === 'up' && currentIndex > 0) {
      const prevType = links[currentIndex - 1][0]
      const prevLink = links[currentIndex - 1][1]
      const currentLink = links[currentIndex][1]
      
      const prevOrder = prevLink.order
      const currentOrder = currentLink.order
      
      if ((prevLink as any).is_custom && (prevLink as any).id) {
        onCustomLinkUpdate((prevLink as any).id, 'order', currentOrder)
      } else {
        onBusinessLinkChange(prevType, 'order', currentOrder)
      }
      
      if ((currentLink as any).is_custom && (currentLink as any).id) {
        const customId = type.replace('custom_', '')
        onCustomLinkUpdate(customId, 'order', prevOrder)
      } else {
        onBusinessLinkChange(type, 'order', prevOrder)
      }
    } else if (direction === 'down' && currentIndex < links.length - 1) {
      const nextType = links[currentIndex + 1][0]
      const nextLink = links[currentIndex + 1][1]
      const currentLink = links[currentIndex][1]
      
      const nextOrder = nextLink.order
      const currentOrder = currentLink.order
      
      if ((nextLink as any).is_custom && (nextLink as any).id) {
        onCustomLinkUpdate((nextLink as any).id, 'order', currentOrder)
      } else {
        onBusinessLinkChange(nextType, 'order', currentOrder)
      }
      
      if ((currentLink as any).is_custom && (currentLink as any).id) {
        const customId = type.replace('custom_', '')
        onCustomLinkUpdate(customId, 'order', nextOrder)
      } else {
        onBusinessLinkChange(type, 'order', nextOrder)
      }
    }
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

        {/* Section 1 Links */}
        <div className="space-y-3">
          {/* Phone */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={businessLinks.phone?.enabled || false}
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
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Call</label>
                <p className="text-xs text-gray-500">Auto-filled from phone number</p>
              </div>
              {businessLinks.phone?.enabled && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveLink('phone', 'up', 1)}
                    disabled={section1Links.findIndex(([t]) => t === 'phone') === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink('phone', 'down', 1)}
                    disabled={section1Links.findIndex(([t]) => t === 'phone') === section1Links.length - 1}
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

          {/* Maps */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={businessLinks.maps?.enabled || false}
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
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Map</label>
                <p className="text-xs text-gray-500">Auto-filled from address</p>
              </div>
              {businessLinks.maps?.enabled && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveLink('maps', 'up', 1)}
                    disabled={section1Links.findIndex(([t]) => t === 'maps') === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink('maps', 'down', 1)}
                    disabled={section1Links.findIndex(([t]) => t === 'maps') === section1Links.length - 1}
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

          {/* Website */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={businessLinks.website?.enabled || false}
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
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Web</label>
                <p className="text-xs text-gray-500">Auto-filled from website</p>
              </div>
              {businessLinks.website?.enabled && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveLink('website', 'up', 1)}
                    disabled={section1Links.findIndex(([t]) => t === 'website') === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink('website', 'down', 1)}
                    disabled={section1Links.findIndex(([t]) => t === 'website') === section1Links.length - 1}
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

          {/* Book (OpenTable or Resy) */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={(businessLinks.opentable?.enabled || businessLinks.resy?.enabled) || false}
                  onChange={(e) => {
                    if (e.target.checked && !businessLinks.opentable?.enabled && !businessLinks.resy?.enabled) {
                      onBusinessLinkChange('opentable', 'enabled', true)
                      onBusinessLinkChange('opentable', 'section', 1)
                      onBusinessLinkChange('opentable', 'order', section1Links.length + 1)
                    } else if (!e.target.checked) {
                      onBusinessLinkChange('opentable', 'enabled', false)
                      onBusinessLinkChange('resy', 'enabled', false)
                    }
                  }}
                  className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Book</label>
                  <p className="text-xs text-gray-500">OpenTable or Resy</p>
                </div>
                {(businessLinks.opentable?.enabled || businessLinks.resy?.enabled) && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveLink(businessLinks.opentable?.enabled ? 'opentable' : 'resy', 'up', 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLink(businessLinks.opentable?.enabled ? 'opentable' : 'resy', 'down', 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {(businessLinks.opentable?.enabled || businessLinks.resy?.enabled) && (
                <div className="ml-7 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="booking-platform"
                      checked={businessLinks.opentable?.enabled || false}
                      onChange={() => {
                        onBusinessLinkChange('opentable', 'enabled', true)
                        onBusinessLinkChange('resy', 'enabled', false)
                      }}
                      className="w-4 h-4 text-accent-600"
                    />
                    <label className="text-sm text-gray-700">OpenTable</label>
                    {businessLinks.opentable?.enabled && (
                      <input
                        type="url"
                        value={businessLinks.opentable?.url || ''}
                        onChange={(e) => onBusinessLinkChange('opentable', 'url', e.target.value)}
                        placeholder="https://www.opentable.com/..."
                        className="flex-1 ml-2 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="booking-platform"
                      checked={businessLinks.resy?.enabled || false}
                      onChange={() => {
                        onBusinessLinkChange('resy', 'enabled', true)
                        onBusinessLinkChange('opentable', 'enabled', false)
                      }}
                      className="w-4 h-4 text-accent-600"
                    />
                    <label className="text-sm text-gray-700">Resy</label>
                    {businessLinks.resy?.enabled && (
                      <input
                        type="url"
                        value={businessLinks.resy?.url || ''}
                        onChange={(e) => onBusinessLinkChange('resy', 'url', e.target.value)}
                        placeholder="https://resy.com/..."
                        className="flex-1 ml-2 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-accent-500"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
          {/* Standard Section 2 Links */}
          {['whatsapp', 'instagram', 'facebook', 'tripadvisor', 'yelp', 'email'].map((type) => {
            const link = businessLinks[type]
            if (!link && type !== 'whatsapp' && type !== 'instagram' && type !== 'facebook' && type !== 'tripadvisor' && type !== 'yelp' && type !== 'email') return null
            
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
                  {link?.enabled && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveLink(type, 'up', 2)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLink(type, 'down', 2)}
                        className="p-1 text-gray-400 hover:text-gray-600"
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
          })}

          {/* Custom Links */}
          {section2CustomLinks.map((customLink) => (
            <div key={customLink.id} className="bg-white rounded-lg p-3 border border-gray-200">
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
                      onClick={() => moveLink(`custom_${customLink.id}`, 'up', 2)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLink(`custom_${customLink.id}`, 'down', 2)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

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
