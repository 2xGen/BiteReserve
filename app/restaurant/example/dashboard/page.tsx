'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Time period options
const timePeriods = [
  { label: '24h', value: '24h', days: 1 },
  { label: '7d', value: '7d', days: 7 },
  { label: '14d', value: '14d', days: 14 },
  { label: '28d', value: '28d', days: 28 },
  { label: '3m', value: '3m', days: 90 },
  { label: '6m', value: '6m', days: 180 },
]

// Campaign link types
const campaignTypes = [
  { value: 'hotel', label: 'Hotel / Concierge' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'social', label: 'Social Media' },
  { value: 'email', label: 'Email' },
  { value: 'qr', label: 'QR Code' },
  { value: 'ads', label: 'Paid Ads' },
  { value: 'other', label: 'Other' },
]

// Icon component for campaign types
const CampaignIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    hotel: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    influencer: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    social: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    email: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    qr: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    ads: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    other: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  }
  return <>{icons[type] || icons.other}</>
}

// Icon component for activity types
const ActivityIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    reservation: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    phone: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    view: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    website: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    address: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }
  return <>{icons[type] || icons.view}</>
}

// Initial campaign links
const initialCampaignLinks = [
  { id: '1', name: 'Grand Hotel Lobby', type: 'hotel', clicks: 234, reservations: 18, created: '2026-01-10', url: 'bite.reserve/...?ref=grand-hotel' },
  { id: '2', name: 'Instagram Bio Link', type: 'social', clicks: 567, reservations: 34, created: '2026-01-05', url: 'bite.reserve/...?ref=instagram' },
  { id: '3', name: '@foodie_adventures', type: 'influencer', clicks: 189, reservations: 12, created: '2026-01-12', url: 'bite.reserve/...?ref=foodie-adventures' },
  { id: '4', name: 'January Newsletter', type: 'email', clicks: 98, reservations: 8, created: '2026-01-15', url: 'bite.reserve/...?ref=jan-newsletter' },
  { id: '5', name: 'Table QR Code', type: 'qr', clicks: 45, reservations: 3, created: '2026-01-08', url: 'bite.reserve/...?ref=table-qr' },
]

// Static data for each time period
const staticData: Record<string, {
  pageViews: number
  phoneClicks: number
  addressClicks: number
  websiteClicks: number
  hoursClicks: number
  reservationRequests: number
  conversionRate: string
  avgTimeOnPage: string
}> = {
  '24h': { pageViews: 178, phoneClicks: 12, addressClicks: 22, websiteClicks: 33, hoursClicks: 6, reservationRequests: 9, conversionRate: '5.1', avgTimeOnPage: '2:34' },
  '7d': { pageViews: 1247, phoneClicks: 89, addressClicks: 156, websiteClicks: 234, hoursClicks: 45, reservationRequests: 67, conversionRate: '5.4', avgTimeOnPage: '2:47' },
  '14d': { pageViews: 2489, phoneClicks: 178, addressClicks: 312, websiteClicks: 468, hoursClicks: 91, reservationRequests: 134, conversionRate: '5.4', avgTimeOnPage: '2:52' },
  '28d': { pageViews: 4956, phoneClicks: 356, addressClicks: 623, websiteClicks: 934, hoursClicks: 182, reservationRequests: 267, conversionRate: '5.4', avgTimeOnPage: '2:45' },
  '3m': { pageViews: 16042, phoneClicks: 1142, addressClicks: 2003, websiteClicks: 3012, hoursClicks: 587, reservationRequests: 862, conversionRate: '5.4', avgTimeOnPage: '2:41' },
  '6m': { pageViews: 32156, phoneClicks: 2289, addressClicks: 4012, websiteClicks: 6034, hoursClicks: 1178, reservationRequests: 1729, conversionRate: '5.4', avgTimeOnPage: '2:38' },
}

// Static chart data for 24h (hourly)
const hourlyChartData = [
  { label: '00:00', pageViews: 3, reservations: 0 },
  { label: '01:00', pageViews: 2, reservations: 0 },
  { label: '02:00', pageViews: 1, reservations: 0 },
  { label: '03:00', pageViews: 1, reservations: 0 },
  { label: '04:00', pageViews: 2, reservations: 0 },
  { label: '05:00', pageViews: 3, reservations: 0 },
  { label: '06:00', pageViews: 5, reservations: 0 },
  { label: '07:00', pageViews: 8, reservations: 1 },
  { label: '08:00', pageViews: 12, reservations: 1 },
  { label: '09:00', pageViews: 15, reservations: 1 },
  { label: '10:00', pageViews: 18, reservations: 1 },
  { label: '11:00', pageViews: 22, reservations: 2 },
  { label: '12:00', pageViews: 28, reservations: 2 },
  { label: '13:00', pageViews: 25, reservations: 2 },
  { label: '14:00', pageViews: 16, reservations: 1 },
  { label: '15:00', pageViews: 14, reservations: 1 },
  { label: '16:00', pageViews: 15, reservations: 1 },
  { label: '17:00', pageViews: 24, reservations: 2 },
  { label: '18:00', pageViews: 32, reservations: 3 },
  { label: '19:00', pageViews: 38, reservations: 4 },
  { label: '20:00', pageViews: 35, reservations: 3 },
  { label: '21:00', pageViews: 22, reservations: 2 },
  { label: '22:00', pageViews: 12, reservations: 1 },
  { label: '23:00', pageViews: 6, reservations: 0 },
]

// Static chart data for 7d
const weeklyChartData = [
  { label: '6d', pageViews: 45, reservations: 5 },
  { label: '5d', pageViews: 52, reservations: 6 },
  { label: '4d', pageViews: 38, reservations: 4 },
  { label: '3d', pageViews: 61, reservations: 7 },
  { label: '2d', pageViews: 55, reservations: 6 },
  { label: '1d', pageViews: 48, reservations: 5 },
  { label: 'Today', pageViews: 67, reservations: 8 },
]

// Static chart data for 14d
const biweeklyChartData = [
  { label: '13d', pageViews: 42, reservations: 4 },
  { label: '12d', pageViews: 48, reservations: 5 },
  { label: '11d', pageViews: 55, reservations: 6 },
  { label: '10d', pageViews: 51, reservations: 5 },
  { label: '9d', pageViews: 44, reservations: 4 },
  { label: '8d', pageViews: 58, reservations: 6 },
  { label: '7d', pageViews: 62, reservations: 7 },
  { label: '6d', pageViews: 45, reservations: 5 },
  { label: '5d', pageViews: 52, reservations: 6 },
  { label: '4d', pageViews: 38, reservations: 4 },
  { label: '3d', pageViews: 61, reservations: 7 },
  { label: '2d', pageViews: 55, reservations: 6 },
  { label: '1d', pageViews: 48, reservations: 5 },
  { label: 'Today', pageViews: 67, reservations: 8 },
]

// Static chart data for 28d
const monthlyChartData = [
  { label: '27d', pageViews: 38, reservations: 4 },
  { label: '25d', pageViews: 45, reservations: 5 },
  { label: '23d', pageViews: 52, reservations: 5 },
  { label: '21d', pageViews: 48, reservations: 5 },
  { label: '19d', pageViews: 55, reservations: 6 },
  { label: '17d', pageViews: 61, reservations: 6 },
  { label: '15d', pageViews: 58, reservations: 6 },
  { label: '13d', pageViews: 42, reservations: 4 },
  { label: '11d', pageViews: 49, reservations: 5 },
  { label: '9d', pageViews: 56, reservations: 6 },
  { label: '7d', pageViews: 62, reservations: 7 },
  { label: '5d', pageViews: 52, reservations: 6 },
  { label: '3d', pageViews: 58, reservations: 6 },
  { label: 'Today', pageViews: 67, reservations: 8 },
]

// Get chart data based on period
const getChartData = (period: string) => {
  switch (period) {
    case '24h': return hourlyChartData
    case '7d': return weeklyChartData
    case '14d': return biweeklyChartData
    case '28d': return monthlyChartData
    case '3m': return monthlyChartData
    case '6m': return monthlyChartData
    default: return weeklyChartData
  }
}

// Static source data for each period
const sourceData: Record<string, { name: string; shortName: string; visits: number; color: string }[]> = {
  '24h': [
    { name: 'Google Search', shortName: 'Google', visits: 60, color: 'bg-blue-500' },
    { name: 'Direct Link', shortName: 'Direct', visits: 45, color: 'bg-green-500' },
    { name: 'Hotel Concierge', shortName: 'Hotel', visits: 27, color: 'bg-purple-500' },
    { name: 'Instagram', shortName: 'Instagram', visits: 22, color: 'bg-pink-500' },
    { name: 'TripAdvisor', shortName: 'TripAdvisor', visits: 14, color: 'bg-yellow-500' },
    { name: 'Email Campaign', shortName: 'Email', visits: 10, color: 'bg-orange-500' },
  ],
  '7d': [
    { name: 'Google Search', shortName: 'Google', visits: 420, color: 'bg-blue-500' },
    { name: 'Direct Link', shortName: 'Direct', visits: 312, color: 'bg-green-500' },
    { name: 'Hotel Concierge', shortName: 'Hotel', visits: 189, color: 'bg-purple-500' },
    { name: 'Instagram', shortName: 'Instagram', visits: 156, color: 'bg-pink-500' },
    { name: 'TripAdvisor', shortName: 'TripAdvisor', visits: 98, color: 'bg-yellow-500' },
    { name: 'Email Campaign', shortName: 'Email', visits: 72, color: 'bg-orange-500' },
  ],
  '14d': [
    { name: 'Google Search', shortName: 'Google', visits: 840, color: 'bg-blue-500' },
    { name: 'Direct Link', shortName: 'Direct', visits: 624, color: 'bg-green-500' },
    { name: 'Hotel Concierge', shortName: 'Hotel', visits: 378, color: 'bg-purple-500' },
    { name: 'Instagram', shortName: 'Instagram', visits: 312, color: 'bg-pink-500' },
    { name: 'TripAdvisor', shortName: 'TripAdvisor', visits: 196, color: 'bg-yellow-500' },
    { name: 'Email Campaign', shortName: 'Email', visits: 144, color: 'bg-orange-500' },
  ],
  '28d': [
    { name: 'Google Search', shortName: 'Google', visits: 1680, color: 'bg-blue-500' },
    { name: 'Direct Link', shortName: 'Direct', visits: 1248, color: 'bg-green-500' },
    { name: 'Hotel Concierge', shortName: 'Hotel', visits: 756, color: 'bg-purple-500' },
    { name: 'Instagram', shortName: 'Instagram', visits: 624, color: 'bg-pink-500' },
    { name: 'TripAdvisor', shortName: 'TripAdvisor', visits: 392, color: 'bg-yellow-500' },
    { name: 'Email Campaign', shortName: 'Email', visits: 288, color: 'bg-orange-500' },
  ],
  '3m': [
    { name: 'Google Search', shortName: 'Google', visits: 5400, color: 'bg-blue-500' },
    { name: 'Direct Link', shortName: 'Direct', visits: 4012, color: 'bg-green-500' },
    { name: 'Hotel Concierge', shortName: 'Hotel', visits: 2430, color: 'bg-purple-500' },
    { name: 'Instagram', shortName: 'Instagram', visits: 2006, color: 'bg-pink-500' },
    { name: 'TripAdvisor', shortName: 'TripAdvisor', visits: 1260, color: 'bg-yellow-500' },
    { name: 'Email Campaign', shortName: 'Email', visits: 926, color: 'bg-orange-500' },
  ],
  '6m': [
    { name: 'Google Search', shortName: 'Google', visits: 10800, color: 'bg-blue-500' },
    { name: 'Direct Link', shortName: 'Direct', visits: 8024, color: 'bg-green-500' },
    { name: 'Hotel Concierge', shortName: 'Hotel', visits: 4860, color: 'bg-purple-500' },
    { name: 'Instagram', shortName: 'Instagram', visits: 4012, color: 'bg-pink-500' },
    { name: 'TripAdvisor', shortName: 'TripAdvisor', visits: 2520, color: 'bg-yellow-500' },
    { name: 'Email Campaign', shortName: 'Email', visits: 1852, color: 'bg-orange-500' },
  ],
}

// Recent activity data
const recentActivity = [
  { type: 'reservation', message: 'New reservation request for 4 guests', shortMessage: 'Reservation for 4', time: '2 min ago', shortTime: '2m' },
  { type: 'phone', message: 'Phone number viewed', shortMessage: 'Phone viewed', time: '5 min ago', shortTime: '5m' },
  { type: 'view', message: 'Page viewed from Google Search', shortMessage: 'From Google', time: '8 min ago', shortTime: '8m' },
  { type: 'website', message: 'Website link clicked', shortMessage: 'Website clicked', time: '12 min ago', shortTime: '12m' },
  { type: 'address', message: 'Directions requested', shortMessage: 'Directions opened', time: '15 min ago', shortTime: '15m' },
  { type: 'reservation', message: 'New reservation request for 2 guests', shortMessage: 'Reservation for 2', time: '23 min ago', shortTime: '23m' },
  { type: 'view', message: 'Page viewed from Instagram', shortMessage: 'From Instagram', time: '31 min ago', shortTime: '31m' },
  { type: 'phone', message: 'Phone number viewed', shortMessage: 'Phone viewed', time: '45 min ago', shortTime: '45m' },
]

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [showModal, setShowModal] = useState(false)
  const [campaignLinks, setCampaignLinks] = useState(initialCampaignLinks)
  const [newLink, setNewLink] = useState({ name: '', type: 'hotel' })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const currentPeriod = timePeriods.find(p => p.value === selectedPeriod) || timePeriods[1]
  
  const data = staticData[selectedPeriod] || staticData['7d']
  const chartData = getChartData(selectedPeriod)
  const currentSourceData = sourceData[selectedPeriod] || sourceData['7d']
  const totalSourceVisits = currentSourceData.reduce((sum, s) => sum + s.visits, 0)

  const maxPageViews = Math.max(...chartData.map(d => d.pageViews))

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleCreateLink = () => {
    if (!newLink.name.trim()) return
    
    const slug = generateSlug(newLink.name)
    const newCampaign = {
      id: Date.now().toString(),
      name: newLink.name,
      type: newLink.type,
      clicks: 0,
      reservations: 0,
      created: new Date().toISOString().split('T')[0],
      url: `bite.reserve/...?ref=${slug}`,
    }
    
    setCampaignLinks([newCampaign, ...campaignLinks])
    setNewLink({ name: '', type: 'hotel' })
    setShowModal(false)
  }

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(`https://${url}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteLink = (id: string) => {
    setCampaignLinks(campaignLinks.filter(link => link.id !== id))
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-10 sm:pt-12">
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
            <span className="text-xs sm:text-sm text-white/80 hidden sm:inline">Example dashboard</span>
          </div>
          <Link 
            href="/claim" 
            className="px-3 sm:px-4 py-1 sm:py-1.5 bg-accent-500 hover:bg-accent-400 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5"
          >
            Claim
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-10 sm:top-12 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/restaurant/example" className="text-gray-500 hover:text-gray-700 transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">La Terrazza del Mare</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Analytics Dashboard</p>
              </div>
            </div>
            <Link href="/" className="text-accent-600 font-bold text-sm sm:text-base hover:text-accent-700 transition-colors">
              BiteReserve
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Time Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Performance</h2>
            <p className="text-gray-500 text-xs sm:text-base mt-0.5 sm:mt-1 hidden sm:block">Track how guests engage</p>
          </div>
          <div className="flex bg-white rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-sm border border-gray-200 overflow-x-auto scrollbar-hide">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedPeriod === period.value
                    ? 'bg-accent-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <MetricCard
            title="Page Views"
            shortTitle="Views"
            value={data.pageViews.toLocaleString()}
            change="+12.5%"
            positive={true}
            icon={
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            color="blue"
          />
          <MetricCard
            title="Booking Attempts"
            shortTitle="Attempts"
            value={data.reservationRequests.toString()}
            change="+8.3%"
            positive={true}
            icon={
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="green"
          />
          <MetricCard
            title="Conversion Rate"
            shortTitle="Conv."
            value={`${data.conversionRate}%`}
            change="+0.8%"
            positive={true}
            icon={
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            color="purple"
          />
          <MetricCard
            title="Avg. Time on Page"
            shortTitle="Avg. Time"
            value={data.avgTimeOnPage}
            change="+15s"
            positive={true}
            icon={
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="orange"
          />
        </div>

        {/* Chart and Sources */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900">Traffic & Guest Actions</h3>
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-accent-500 rounded-full"></div>
                  <span className="text-gray-600 hidden sm:inline">Views</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 hidden sm:inline">Bookings</span>
                </div>
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="h-40 sm:h-64 flex items-end justify-between gap-0.5 sm:gap-1">
              {chartData.slice(currentPeriod.days === 1 ? 0 : -7).map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-accent-500 to-accent-400 rounded-t max-w-[16px] sm:max-w-[24px]"
                    style={{ height: `${Math.max((point.pageViews / maxPageViews) * 100, 4)}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-gray-400">
              <span>{currentPeriod.days === 1 ? '12am' : `${currentPeriod.days}d`}</span>
              <span>{currentPeriod.days === 1 ? '12pm' : ''}</span>
              <span>Now</span>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Traffic Sources</h3>
            <div className="space-y-3 sm:space-y-4">
              {currentSourceData.slice(0, 4).map((source, i) => (
                <div key={i} className="sm:hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{source.shortName}</span>
                    <span className="text-xs text-gray-500">{source.visits.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${source.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(source.visits / totalSourceVisits) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {currentSourceData.map((source, i) => (
                <div key={i} className="hidden sm:block">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                    <span className="text-sm text-gray-500">{source.visits.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${source.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(source.visits / totalSourceVisits) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement and Activity */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Engagement Breakdown */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Engagement</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <EngagementCard label="Phone" value={data.phoneClicks} color="green" />
              <EngagementCard label="Address" value={data.addressClicks} color="purple" />
              <EngagementCard label="Website" value={data.websiteClicks} color="blue" />
              <EngagementCard label="Hours" value={data.hoursClicks} color="orange" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900">Recent Activity</h3>
              <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">Live</span>
            </div>
            <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.slice(0, 5).map((activity, i) => {
                const activityColors: Record<string, string> = {
                  reservation: 'bg-accent-100 text-accent-600',
                  phone: 'bg-green-100 text-green-600',
                  view: 'bg-blue-100 text-blue-600',
                  website: 'bg-indigo-100 text-indigo-600',
                  address: 'bg-purple-100 text-purple-600',
                }
                return (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${activityColors[activity.type] || 'bg-gray-100 text-gray-600'}`}>
                      <ActivityIcon type={activity.type} className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate sm:hidden">{activity.shortMessage}</p>
                      <p className="text-sm font-medium text-gray-900 truncate hidden sm:block">{activity.message}</p>
                      <p className="text-xs text-gray-500 hidden sm:block">{activity.time}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 sm:hidden">{activity.shortTime}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Campaign Links Section */}
        <div className="mt-4 sm:mt-8">
          <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Campaign Links</h3>
                <p className="text-white/80 text-xs sm:text-base">Track where your guests come from</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-accent-600 font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Link
              </button>
            </div>
          </div>

          {/* Campaign Links - Card View on Mobile, Table on Desktop */}
          <div className="bg-white rounded-b-xl sm:rounded-b-2xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-100">
              {campaignLinks.map((link) => {
                const typeInfo = campaignTypes.find(t => t.value === link.type)
                const convRate = link.clicks > 0 ? ((link.reservations / link.clicks) * 100).toFixed(1) : '0.0'
                const typeColors: Record<string, string> = {
                  hotel: 'bg-purple-100 text-purple-600',
                  influencer: 'bg-yellow-100 text-yellow-600',
                  social: 'bg-pink-100 text-pink-600',
                  email: 'bg-blue-100 text-blue-600',
                  qr: 'bg-gray-100 text-gray-600',
                  ads: 'bg-orange-100 text-orange-600',
                  other: 'bg-slate-100 text-slate-600',
                }
                
                return (
                  <div key={link.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${typeColors[link.type]}`}>
                          <CampaignIcon type={link.type} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{link.name}</p>
                          <p className="text-[10px] text-gray-500">{typeInfo?.label}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Clicks</span>
                        <p className="font-bold text-gray-900">{link.clicks}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Bookings</span>
                        <p className="font-bold text-accent-600">{link.reservations}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Rate</span>
                        <p className="font-bold text-gray-900">{convRate}%</p>
                      </div>
                      <button
                        onClick={() => handleCopyLink(link.id, link.url)}
                        className={`ml-auto p-2 rounded-lg ${copiedId === link.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {copiedId === link.id ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Campaign</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Link</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Clicks</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Bookings</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Rate</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaignLinks.map((link) => {
                    const typeInfo = campaignTypes.find(t => t.value === link.type)
                    const convRate = link.clicks > 0 ? ((link.reservations / link.clicks) * 100).toFixed(1) : '0.0'
                    const typeColors: Record<string, string> = {
                      hotel: 'bg-purple-100 text-purple-600',
                      influencer: 'bg-yellow-100 text-yellow-600',
                      social: 'bg-pink-100 text-pink-600',
                      email: 'bg-blue-100 text-blue-600',
                      qr: 'bg-gray-100 text-gray-600',
                      ads: 'bg-orange-100 text-orange-600',
                      other: 'bg-slate-100 text-slate-600',
                    }
                    
                    return (
                      <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${typeColors[link.type]}`}>
                              <CampaignIcon type={link.type} className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{link.name}</p>
                              <p className="text-xs text-gray-500">{typeInfo?.label}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">{link.url}</code>
                            <button
                              onClick={() => handleCopyLink(link.id, link.url)}
                              className={`p-1.5 rounded-lg transition-colors ${copiedId === link.id ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'}`}
                            >
                              {copiedId === link.id ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-900">{link.clicks.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center font-bold text-accent-600">{link.reservations}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            parseFloat(convRate) >= 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {convRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create Campaign Link Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full sm:rounded-2xl sm:max-w-lg overflow-hidden animate-fade-in-scale rounded-t-2xl sm:rounded-b-2xl">
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-xl font-bold text-white">Create Campaign Link</h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-white/80 hover:text-white">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  placeholder="e.g., Grand Hotel, Newsletter"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm sm:text-base"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Source Type</label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {campaignTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewLink({ ...newLink, type: type.value })}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-xs sm:text-sm ${
                        newLink.type === type.value
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <CampaignIcon type={type.value} className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {newLink.name && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Preview</p>
                  <code className="text-xs sm:text-sm text-accent-600 font-mono break-all">
                    bite.reserve/...?ref={generateSlug(newLink.name)}
                  </code>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex items-center justify-end gap-2 sm:gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 sm:px-5 py-2 sm:py-2.5 text-gray-600 font-medium text-sm sm:text-base">
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                disabled={!newLink.name.trim()}
                className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all ${
                  newLink.name.trim()
                    ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Metric Card Component - Mobile optimized
function MetricCard({ 
  title, 
  shortTitle,
  value, 
  change, 
  positive, 
  icon, 
  color 
}: { 
  title: string
  shortTitle?: string
  value: string
  change: string
  positive: boolean
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
          positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1">{value}</p>
      <p className="text-xs text-gray-500 sm:hidden">{shortTitle || title}</p>
      <p className="text-sm text-gray-500 hidden sm:block">{title}</p>
    </div>
  )
}

// Engagement Card Component - Mobile optimized
function EngagementCard({ 
  label, 
  value, 
  color 
}: { 
  label: string
  value: number
  color: 'green' | 'purple' | 'blue' | 'orange'
}) {
  const bgClasses = {
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    blue: 'bg-blue-50 border-blue-100',
    orange: 'bg-orange-50 border-orange-100',
  }
  const textClasses = {
    green: 'text-green-600',
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
  }

  return (
    <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${bgClasses[color]}`}>
      <span className={`text-xs sm:text-sm font-medium ${textClasses[color]}`}>{label}</span>
      <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{value.toLocaleString()}</p>
    </div>
  )
}
