import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// This sitemap is generated at BUILD TIME (static), not on each request
// It will only regenerate when you rebuild the site
export const revalidate = false // Static generation - no revalidation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bitereserve.com'
  const now = new Date()
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/claim`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
  
  // Fetch all active restaurants from database (with pagination)
  let restaurantPages: MetadataRoute.Sitemap = []
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Fetch all active restaurants with pagination (Supabase max 1000 per page)
      let allRestaurants: any[] = []
      let page = 0
      const pageSize = 1000
      let hasMore = true
      
      while (hasMore) {
        const { data: restaurants, error } = await supabase
          .from('restaurants')
          .select('country_code, restaurant_number, updated_at')
          .eq('is_active', true)
          .not('country_code', 'is', null)
          .not('restaurant_number', 'is', null)
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('id', { ascending: true })
        
        if (error) {
          console.error('Error fetching restaurants for sitemap:', error)
          break
        }
        
        if (restaurants && restaurants.length > 0) {
          allRestaurants = [...allRestaurants, ...restaurants]
          hasMore = restaurants.length === pageSize
          page++
        } else {
          hasMore = false
        }
      }
      
      // Generate sitemap entries for all restaurants
      restaurantPages = allRestaurants.map((restaurant) => ({
        url: `${baseUrl}/r/${restaurant.country_code.toLowerCase()}/${restaurant.restaurant_number}`,
        lastModified: restaurant.updated_at ? new Date(restaurant.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    // Silently fail - don't break sitemap if database fetch fails
    console.error('Error fetching restaurants for sitemap:', error)
  }
  
  // Combine static pages with restaurant pages
  return [...staticPages, ...restaurantPages]
}
