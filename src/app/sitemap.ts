import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

const staticPages = [
  { path: '', en: '', ru: '' },
  { path: 'tours', en: 'tours', ru: 'ekskursii' },
  { path: 'about', en: 'about', ru: 'o-nas' },
  { path: 'reviews', en: 'reviews', ru: 'otzyvy' },
  { path: 'contact', en: 'contact', ru: 'kontakty' },
  { path: 'faq', en: 'faq', ru: 'voprosy' },
  { path: 'privacy', en: 'privacy', ru: 'privacy' },
  { path: 'terms', en: 'terms', ru: 'terms' },
  {
    path: 'cancellation-policy',
    en: 'cancellation-policy',
    ru: 'cancellation-policy',
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages — both locales
  for (const page of staticPages) {
    entries.push({
      url: `${BASE_URL}/en/${page.en}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: `${BASE_URL}/en/${page.en}`,
          ru: `${BASE_URL}/ru/${page.ru}`,
        },
      },
    })
    entries.push({
      url: `${BASE_URL}/ru/${page.ru}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: `${BASE_URL}/en/${page.en}`,
          ru: `${BASE_URL}/ru/${page.ru}`,
        },
      },
    })
  }

  // Dynamic tour pages
  try {
    const payload = await getPayload({ config })
    const tours = await payload.find({
      collection: 'tours',
      where: { status: { equals: 'published' } },
      limit: 100,
      select: {
        slug: true,
        publishedLocales: true,
        updatedAt: true,
      },
    })

    for (const tour of tours.docs) {
      const publishedLocales = (tour as any).publishedLocales || []
      const enSlug = tour.slug
      const ruSlug = tour.slug // same slug for both locales

      if (publishedLocales.includes('en')) {
        const alternates: Record<string, string> = {
          en: `${BASE_URL}/en/tours/${enSlug}`,
        }
        if (publishedLocales.includes('ru')) {
          alternates.ru = `${BASE_URL}/ru/ekskursii/${ruSlug}`
        }
        entries.push({
          url: `${BASE_URL}/en/tours/${enSlug}`,
          lastModified: new Date(tour.updatedAt as string),
          alternates: { languages: alternates },
        })
      }

      if (publishedLocales.includes('ru')) {
        const alternates: Record<string, string> = {
          ru: `${BASE_URL}/ru/ekskursii/${ruSlug}`,
        }
        if (publishedLocales.includes('en')) {
          alternates.en = `${BASE_URL}/en/tours/${enSlug}`
        }
        entries.push({
          url: `${BASE_URL}/ru/ekskursii/${ruSlug}`,
          lastModified: new Date(tour.updatedAt as string),
          alternates: { languages: alternates },
        })
      }
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch tours:', error)
  }

  return entries
}
