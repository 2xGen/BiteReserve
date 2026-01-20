import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/claim',
          '/privacy',
          '/terms',
          '/r/*', // Restaurant pages
        ],
        disallow: [
          '/destinations', // Not meant for indexing
          '/api/*', // API routes
          '/dashboard/*', // User dashboard (private)
          '/admin/*', // Admin pages (private)
          '/login',
          '/signup',
          '/reset-password',
          '/claim/complete', // Post-payment page (private)
          '/claim/success', // Post-payment page (private)
          '/signup/success', // Post-signup page (private)
        ],
      },
    ],
    sitemap: 'https://bitereserve.com/sitemap.xml',
  }
}
