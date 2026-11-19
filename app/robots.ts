import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/invoice/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/invoice/'],
      }
    ],
    sitemap: 'https://capsic.in/sitemap.xml',
    host: 'https://capsic.in',
  }
}