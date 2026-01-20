import type { Metadata } from 'next'
import { generateSEOTitle, generateSEODescription, generateSEOKeywords } from '@/lib/seo-utils'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ country: string; id: string }> 
}): Promise<Metadata> {
  const { country, id } = await params
  
  // Fetch restaurant data for metadata with timeout
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/restaurants/${country}/${id}`,
      { 
        next: { revalidate: 300 }, // Cache for 5 minutes
        signal: controller.signal
      }
    )
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      const restaurant = data.restaurant
      
      if (restaurant) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bite.reserve'
        const title = generateSEOTitle(restaurant)
        const description = generateSEODescription(restaurant)
        const keywords = generateSEOKeywords(restaurant)
        
        return {
          title,
          description,
          keywords: keywords.join(', '),
          openGraph: {
            title: restaurant.name,
            description,
            type: 'website',
            url: `${baseUrl}/r/${restaurant.country_code}/${restaurant.restaurant_number}`,
            images: [
              {
                url: 'https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png',
                width: 1200,
                height: 630,
                alt: restaurant.name,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title: restaurant.name,
            description,
            images: ['https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png'],
          },
        }
      }
    }
  } catch (error) {
    // Silently fail - don't block page load for metadata
    console.error('Error generating metadata:', error)
  }

  // Fallback metadata
  return {
    title: 'Reserve Table | BiteReserve',
    description: 'Reserve your table online. Book restaurant reservations instantly.',
  }
}

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
