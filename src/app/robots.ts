import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/report', '/map'], // Protect private routes while allowing auth/gateway
    },
    sitemap: 'https://civic-os-five.vercel.app/sitemap.xml',
  }
}
