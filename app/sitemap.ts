import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // In a real app, you'd fetch all restaurant slugs from your database
  // For now, this is a template that shows the structure
  
  const baseUrl = 'https://bitereserve.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Restaurant pages would be added here dynamically
    // Example:
    // {
    //   url: `${baseUrl}/restaurant/example-restaurant`,
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.9,
    // },
  ]
}
