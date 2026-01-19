/**
 * SEO Utilities
 * Generates SEO-optimized titles and descriptions for restaurant pages
 */

interface Restaurant {
  name: string
  cuisine: string[] | null
  address: string | null
  country_code: string
  description: string | null
  tagline: string | null
  rating: number | null
  review_count: number | null
}

/**
 * Get country name from country code
 */
function getCountryName(countryCode: string): string | null {
  const countryNames: Record<string, string> = {
    'us': 'United States',
    'mx': 'Mexico',
    'ca': 'Canada',
    'uk': 'United Kingdom',
    'gb': 'United Kingdom',
    'fr': 'France',
    'it': 'Italy',
    'es': 'Spain',
    'de': 'Germany',
    'nl': 'Netherlands',
    'be': 'Belgium',
    'ch': 'Switzerland',
    'at': 'Austria',
    'pt': 'Portugal',
    'gr': 'Greece',
    'tr': 'Turkey',
    'jp': 'Japan',
    'cn': 'China',
    'in': 'India',
    'au': 'Australia',
    'nz': 'New Zealand',
    'br': 'Brazil',
    'ar': 'Argentina',
    'cl': 'Chile',
    'co': 'Colombia',
    'pe': 'Peru',
    'ph': 'Philippines',
    'th': 'Thailand',
    'vn': 'Vietnam',
    'sg': 'Singapore',
    'my': 'Malaysia',
    'id': 'Indonesia',
    'kr': 'South Korea',
    'ae': 'United Arab Emirates',
    'sa': 'Saudi Arabia',
    'za': 'South Africa',
    'eg': 'Egypt',
    'ma': 'Morocco',
    'tn': 'Tunisia',
  }

  return countryNames[countryCode.toLowerCase()] || null
}

/**
 * Extract city and country from address string
 */
export function extractLocation(address: string | null, countryCode?: string): { city: string | null; country: string | null } {
  if (!address) {
    const country = countryCode ? getCountryName(countryCode) : null
    return { city: null, country }
  }

  // Common patterns:
  // "123 Street, City, State ZIP, Country"
  // "123 Street, City, Country"
  // "City, Country"
  
  const parts = address.split(',').map(p => p.trim())
  
  // Try to extract city (usually second-to-last or last part)
  let city: string | null = null
  let country: string | null = null

  if (parts.length >= 2) {
    // Last part might be country
    const lastPart = parts[parts.length - 1]
    
    // Check if last part looks like a country (short, or common country names)
    const countryPattern = /^(USA|United States|US|UK|United Kingdom|Canada|Mexico|France|Italy|Spain|Germany|Netherlands|Belgium|Switzerland|Austria|Portugal|Greece|Turkey|Japan|China|India|Australia|New Zealand|Brazil|Argentina|Chile|Colombia|Peru|Philippines|Thailand|Vietnam|Singapore|Malaysia|Indonesia|South Korea|United Arab Emirates|UAE|Saudi Arabia|South Africa|Egypt|Morocco|Tunisia)$/i
    
    if (countryPattern.test(lastPart)) {
      country = lastPart
      // City is likely second-to-last
      if (parts.length >= 3) {
        city = parts[parts.length - 2]
      }
    } else {
      // Last part might be city
      city = lastPart
    }
  }

  // If we have country_code, use it to determine country name (more reliable)
  if (countryCode) {
    const countryFromCode = getCountryName(countryCode)
    if (countryFromCode) {
      country = countryFromCode
    }
  }

  return { city, country }
}

/**
 * Generate SEO-optimized title for restaurant page
 */
export function generateSEOTitle(restaurant: Restaurant): string {
  const { name, cuisine, address, country_code } = restaurant
  const { city, country } = extractLocation(address, country_code)
  
  const parts: string[] = []
  
  // Primary keyword: "Reserve"
  parts.push('Reserve Table at')
  
  // Restaurant name
  parts.push(name)
  
  // Cuisine (if available)
  if (cuisine && cuisine.length > 0) {
    parts.push(`- ${cuisine[0]} Restaurant`)
  }
  
  // Location
  if (city) {
    parts.push(`in ${city}`)
  } else if (country) {
    parts.push(`in ${country}`)
  }
  
  // Brand
  parts.push('| BiteReserve')
  
  return parts.join(' ')
}

/**
 * Generate SEO-optimized description for restaurant page
 */
export function generateSEODescription(restaurant: Restaurant): string {
  const { name, cuisine, address, description, tagline, rating, review_count, country_code } = restaurant
  const { city, country } = extractLocation(address, country_code)
  
  const parts: string[] = []
  
  // Primary action: Reserve
  parts.push('Reserve a table at')
  
  // Restaurant name
  parts.push(name)
  
  // Cuisine
  if (cuisine && cuisine.length > 0) {
    const cuisineList = cuisine.length === 1 
      ? cuisine[0] 
      : cuisine.length === 2
      ? `${cuisine[0]} and ${cuisine[1]}`
      : `${cuisine.slice(0, -1).join(', ')}, and ${cuisine[cuisine.length - 1]}`
    parts.push(`(${cuisineList})`)
  }
  
  // Location
  if (city) {
    parts.push(`in ${city}`)
  } else if (country) {
    parts.push(`in ${country}`)
  }
  
  // Rating (if available)
  if (rating && review_count) {
    parts.push(`- ${rating}-star rated`)
    if (review_count > 0) {
      parts.push(`(${review_count} reviews)`)
    }
  }
  
  // Call to action
  parts.push('Book your reservation online now.')
  
  // Add description/tagline if space allows (max 160 chars total)
  let descriptionText = parts.join(' ')
  
  if (description && descriptionText.length < 120) {
    const remaining = 160 - descriptionText.length - 3
    if (description.length <= remaining) {
      descriptionText = `${descriptionText} ${description}`
    } else {
      descriptionText = `${descriptionText} ${description.substring(0, remaining)}...`
    }
  } else if (tagline && descriptionText.length < 120) {
    const remaining = 160 - descriptionText.length - 3
    if (tagline.length <= remaining) {
      descriptionText = `${descriptionText} ${tagline}`
    }
  }
  
  // Ensure max 160 characters for meta description
  if (descriptionText.length > 160) {
    descriptionText = descriptionText.substring(0, 157) + '...'
  }
  
  return descriptionText
}

/**
 * Generate keywords array for meta keywords (optional, but some search engines use it)
 */
export function generateSEOKeywords(restaurant: Restaurant): string[] {
  const { name, cuisine, address, country_code } = restaurant
  const { city, country } = extractLocation(address, country_code)
  
  const keywords: string[] = []
  
  // Primary keywords
  keywords.push('reserve', 'reservation', 'book table', 'restaurant booking')
  
  // Restaurant name
  keywords.push(name.toLowerCase())
  
  // Cuisine
  if (cuisine) {
    cuisine.forEach(c => {
      keywords.push(c.toLowerCase(), `${c.toLowerCase()} restaurant`)
    })
  }
  
  // Location
  if (city) {
    keywords.push(city.toLowerCase(), `restaurant ${city.toLowerCase()}`, `dining ${city.toLowerCase()}`)
  }
  if (country) {
    keywords.push(country.toLowerCase())
  }
  
  // Additional intent keywords
  keywords.push('online reservation', 'table booking', 'make reservation')
  
  return [...new Set(keywords)] // Remove duplicates
}
