/**
 * Lightweight Analytics Tracking
 * - Non-blocking (uses sendBeacon when available)
 * - Batches events for efficiency
 * - Falls back gracefully on errors
 */

type EventType = 
  | 'page_view'
  | 'phone_click'
  | 'address_click'
  | 'website_click'
  | 'hours_click'
  | 'reservation_click'
  | 'opentable_click'
  | 'resy_click'
  | 'whatsapp_click'
  | 'tripadvisor_click'
  | 'instagram_click'
  | 'facebook_click'
  | 'twitter_click'
  | 'yelp_click'
  | 'email_click'
  | 'maps_click'

interface TrackingEvent {
  restaurantId: string
  eventType: EventType
  source?: string
  campaign?: string
  referrer?: string
}

// Queue for batching events
let eventQueue: TrackingEvent[] = []
let flushTimeout: NodeJS.Timeout | null = null
const FLUSH_INTERVAL = 1000 // 1 second batch window
const MAX_QUEUE_SIZE = 10

/**
 * Track an analytics event
 * Non-blocking, batched for efficiency
 */
export function trackEvent(
  restaurantId: string,
  eventType: EventType,
  options?: { source?: string; campaign?: string }
) {
  // Don't track in development (optional - remove if you want dev tracking)
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('[Track]', eventType, restaurantId, options)
  //   return
  // }

  const event: TrackingEvent = {
    restaurantId,
    eventType,
    source: options?.source || getSource(),
    campaign: options?.campaign || getCampaign(),
    referrer: typeof document !== 'undefined' ? document.referrer : undefined
  }

  // Add to queue
  eventQueue.push(event)

  // Flush immediately if queue is full
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents()
    return
  }

  // Schedule flush
  if (!flushTimeout) {
    flushTimeout = setTimeout(flushEvents, FLUSH_INTERVAL)
  }
}

/**
 * Flush queued events to server
 */
function flushEvents() {
  if (flushTimeout) {
    clearTimeout(flushTimeout)
    flushTimeout = null
  }

  if (eventQueue.length === 0) return

  const events = [...eventQueue]
  eventQueue = []

  // Send each event (could batch into single request in future)
  events.forEach(event => {
    sendEvent(event)
  })
}

/**
 * Send single event to server
 * Uses sendBeacon for reliability, falls back to fetch
 */
function sendEvent(event: TrackingEvent) {
  const payload = JSON.stringify(event)
  const url = '/api/track'

  // Try sendBeacon first (works even when page is closing)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' })
    const sent = navigator.sendBeacon(url, blob)
    if (sent) return
  }

  // Fallback to fetch with keepalive
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true // Allows request to outlive the page
  }).catch(() => {
    // Silently fail - tracking should never break the app
  })
}

/**
 * Get traffic source from URL or referrer
 */
function getSource(): string | undefined {
  if (typeof window === 'undefined') return undefined

  const params = new URLSearchParams(window.location.search)
  
  // Check UTM source
  const utmSource = params.get('utm_source')
  if (utmSource) return utmSource

  // Check referrer
  const referrer = document.referrer
  if (!referrer) return 'direct'

  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()

    if (hostname.includes('google')) return 'google'
    if (hostname.includes('facebook') || hostname.includes('fb.')) return 'facebook'
    if (hostname.includes('instagram')) return 'instagram'
    if (hostname.includes('tiktok')) return 'tiktok'
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'twitter'
    if (hostname.includes('tripadvisor')) return 'tripadvisor'
    if (hostname.includes('yelp')) return 'yelp'

    return hostname
  } catch {
    return 'unknown'
  }
}

/**
 * Get campaign from URL parameter
 */
function getCampaign(): string | undefined {
  if (typeof window === 'undefined') return undefined

  const params = new URLSearchParams(window.location.search)
  return params.get('c') || params.get('ref') || params.get('campaign') || undefined
}

/**
 * Track page view (call once on page load)
 */
export function trackPageView(restaurantId: string) {
  trackEvent(restaurantId, 'page_view')
}

/**
 * Flush events before page unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents()
    }
  })

  window.addEventListener('pagehide', flushEvents)
}
