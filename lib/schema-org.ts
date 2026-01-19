/**
 * Schema.org Structured Data Generator
 * Generates JSON-LD for restaurant pages to improve SEO
 */

interface Restaurant {
  id: string
  name: string
  tagline: string | null
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  google_maps_url: string | null
  rating: number | null
  review_count: number | null
  price_level: string | null
  cuisine: string[] | null
  hours: Record<string, any> | null
  country_code: string
  restaurant_number: string
}

interface SchemaOrgProps {
  restaurant: Restaurant
  baseUrl?: string
}

/**
 * Convert hours object to Schema.org OpeningHoursSpecification format
 */
function formatOpeningHours(hours: Record<string, any> | null): any[] {
  if (!hours || typeof hours !== 'object') return []

  const dayMap: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }

  const openingHours: any[] = []

  Object.entries(hours).forEach(([day, time]) => {
    // Ensure time is a string
    if (!time) return
    const timeStr = typeof time === 'string' ? time : String(time)
    if (!timeStr || timeStr.trim() === '') return

    // Handle multiple time slots (e.g., "12:00 PM - 2:00 PM, 5:00 PM - 10:00 PM")
    const timeSlots = timeStr.split(',').map(slot => slot.trim()).filter(slot => slot.length > 0)

    timeSlots.forEach(slot => {
      // Parse time range (e.g., "12:00 PM - 2:00 PM")
      const match = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i)
      if (match) {
        const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = match
        
        // Convert to 24-hour format for Schema.org
        const formatTime = (hour: string, min: string, period: string): string => {
          let h = parseInt(hour)
          const m = parseInt(min)
          if (period.toUpperCase() === 'PM' && h !== 12) h += 12
          if (period.toUpperCase() === 'AM' && h === 12) h = 0
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        }

        openingHours.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: dayMap[day.toLowerCase()] || day,
          opens: formatTime(openHour, openMin, openPeriod),
          closes: formatTime(closeHour, closeMin, closePeriod),
        })
      }
    })
  })

  return openingHours
}

/**
 * Generate Schema.org JSON-LD for a restaurant
 */
export function generateRestaurantSchema({ restaurant, baseUrl = 'https://bite.reserve' }: SchemaOrgProps): object {
  const url = `${baseUrl}/r/${restaurant.country_code}/${restaurant.restaurant_number}`
  
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    url: url,
  }

  // Description
  if (restaurant.description) {
    schema.description = restaurant.description
  } else if (restaurant.tagline) {
    schema.description = restaurant.tagline
  }

  // Address
  if (restaurant.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
    }
  }

  // Phone
  if (restaurant.phone) {
    schema.telephone = restaurant.phone
  }

  // Website
  if (restaurant.website) {
    schema.sameAs = [restaurant.website]
    if (restaurant.google_maps_url) {
      schema.sameAs.push(restaurant.google_maps_url)
    }
  } else if (restaurant.google_maps_url) {
    schema.sameAs = [restaurant.google_maps_url]
  }

  // Aggregate Rating
  if (restaurant.rating && restaurant.review_count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: restaurant.rating.toString(),
      reviewCount: restaurant.review_count.toString(),
      bestRating: '5',
      worstRating: '1',
    }
  }

  // Price Range
  if (restaurant.price_level) {
    schema.priceRange = restaurant.price_level
  }

  // Serves Cuisine
  if (restaurant.cuisine && restaurant.cuisine.length > 0) {
    schema.servesCuisine = restaurant.cuisine
  }

  // Opening Hours
  const openingHours = formatOpeningHours(restaurant.hours)
  if (openingHours.length > 0) {
    schema.openingHoursSpecification = openingHours
  }

  // Additional LocalBusiness properties
  schema['@type'] = ['Restaurant', 'LocalBusiness']
  schema.image = `${baseUrl}/icon.svg` // Fallback image

  return schema
}

/**
 * Generate JSON-LD script tag content
 */
export function generateRestaurantSchemaScript(restaurant: Restaurant, baseUrl?: string): string {
  const schema = generateRestaurantSchema({ restaurant, baseUrl })
  return JSON.stringify(schema, null, 2)
}
