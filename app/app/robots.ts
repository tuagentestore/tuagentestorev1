import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/onboarding',
          '/api/',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: 'https://tuagentestore.com/sitemap.xml',
  }
}
