/**
 * Slug utilities for restaurant URLs
 * Format: /r/[country-code]/[5-digit-number]
 * Example: /r/nl/04480
 */

/**
 * Extract country code from address or use default
 * This is a simple implementation - you may want to use a geocoding service
 */
export function extractCountryCode(address: string | null): string {
  if (!address) return 'us' // Default to US
  
  const addressLower = address.toLowerCase()
  
  // Simple country detection (you may want to use a proper geocoding service)
  if (addressLower.includes('netherlands') || addressLower.includes('nederland') || addressLower.includes('amsterdam')) return 'nl'
  if (addressLower.includes('united states') || addressLower.includes('usa') || addressLower.includes('us,')) return 'us'
  if (addressLower.includes('france') || addressLower.includes('paris')) return 'fr'
  if (addressLower.includes('germany') || addressLower.includes('deutschland') || addressLower.includes('berlin')) return 'de'
  if (addressLower.includes('spain') || addressLower.includes('españa') || addressLower.includes('madrid')) return 'es'
  if (addressLower.includes('italy') || addressLower.includes('italia') || addressLower.includes('rome')) return 'it'
  if (addressLower.includes('united kingdom') || addressLower.includes('uk') || addressLower.includes('london')) return 'gb'
  if (addressLower.includes('canada') || addressLower.includes('toronto') || addressLower.includes('vancouver')) return 'ca'
  if (addressLower.includes('australia') || addressLower.includes('sydney') || addressLower.includes('melbourne')) return 'au'
  
  // Default to US
  return 'us'
}

/**
 * Generate restaurant slug
 * Format: /r/[country-code]/[5-digit-number]
 * restaurantNumber can be number or string (VARCHAR from database)
 */
export function generateRestaurantSlug(countryCode: string, restaurantNumber: number | string): string {
  const paddedNumber = typeof restaurantNumber === 'string' 
    ? restaurantNumber.padStart(5, '0')
    : restaurantNumber.toString().padStart(5, '0')
  return `/r/${countryCode}/${paddedNumber}`
}

/**
 * Parse restaurant slug to extract country and number
 * Returns restaurantNumber as string to preserve leading zeros
 */
export function parseRestaurantSlug(slug: string): { countryCode: string; restaurantNumber: string } | null {
  // Format: /r/nl/04480 or r/nl/04480
  const match = slug.match(/^\/?r\/([a-z]{2})\/(\d{5})$/)
  if (!match) return null
  
  return {
    countryCode: match[1],
    restaurantNumber: match[2] // Keep as string to preserve leading zeros
  }
}

/**
 * Validate country code (ISO 3166-1 alpha-2)
 */
export function isValidCountryCode(code: string): boolean {
  return /^[a-z]{2}$/.test(code.toLowerCase())
}
