import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/restaurant/*',
        ],
        disallow: [
          '/destinations',
          '/api/*',
        ],
      },
    ],
    sitemap: 'https://bitereserve.com/sitemap.xml',
  }
}
