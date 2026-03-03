import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Yandex',
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://bestpragueguide.com/sitemap.xml',
  }
}
