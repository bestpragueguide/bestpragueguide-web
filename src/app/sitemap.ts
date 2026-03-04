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
  { path: 'blog', en: 'blog', ru: 'blog' },
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

    // Fetch tours in EN locale for English slugs
    const enTours = await payload.find({
      collection: 'tours',
      where: { status: { equals: 'published' } },
      limit: 200,
      locale: 'en',
    })

    // Fetch tours in RU locale for Russian slugs
    const ruTours = await payload.find({
      collection: 'tours',
      where: { status: { equals: 'published' } },
      limit: 200,
      locale: 'ru',
    })

    // Build a map of id → ruSlug
    const ruSlugMap = new Map<number, string>()
    for (const t of ruTours.docs) {
      ruSlugMap.set(t.id as number, t.slug)
    }

    for (const tour of enTours.docs) {
      const publishedLocales = (tour as any).publishedLocales || []
      const enSlug = tour.slug
      const ruSlug = ruSlugMap.get(tour.id as number) || enSlug
      const lastMod = new Date(tour.updatedAt as string)

      if (publishedLocales.includes('en')) {
        const alternates: Record<string, string> = {
          en: `${BASE_URL}/en/tours/${enSlug}`,
        }
        if (publishedLocales.includes('ru')) {
          alternates.ru = `${BASE_URL}/ru/ekskursii/${ruSlug}`
        }
        entries.push({
          url: `${BASE_URL}/en/tours/${enSlug}`,
          lastModified: lastMod,
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
          lastModified: lastMod,
          alternates: { languages: alternates },
        })
      }
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch tours:', error)
  }

  // Dynamic blog post pages
  try {
    const payload = await getPayload({ config })

    const enPosts = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 200,
      locale: 'en',
    })

    const ruPosts = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 200,
      locale: 'ru',
    })

    const ruPostSlugMap = new Map<number, string>()
    for (const p of ruPosts.docs) {
      ruPostSlugMap.set(p.id as number, p.slug as string)
    }

    for (const post of enPosts.docs) {
      const publishedLocales = (post as any).publishedLocales || []
      const enSlug = post.slug
      const ruSlug = ruPostSlugMap.get(post.id as number) || enSlug
      const lastMod = new Date((post.updatedAt as string) || (post as any).publishedAt)

      if (publishedLocales.includes('en')) {
        const alternates: Record<string, string> = {
          en: `${BASE_URL}/en/blog/${enSlug}`,
        }
        if (publishedLocales.includes('ru')) {
          alternates.ru = `${BASE_URL}/ru/blog/${ruSlug}`
        }
        entries.push({
          url: `${BASE_URL}/en/blog/${enSlug}`,
          lastModified: lastMod,
          alternates: { languages: alternates },
        })
      }

      if (publishedLocales.includes('ru')) {
        const alternates: Record<string, string> = {
          ru: `${BASE_URL}/ru/blog/${ruSlug}`,
        }
        if (publishedLocales.includes('en')) {
          alternates.en = `${BASE_URL}/en/blog/${enSlug}`
        }
        entries.push({
          url: `${BASE_URL}/ru/blog/${ruSlug}`,
          lastModified: lastMod,
          alternates: { languages: alternates },
        })
      }
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch blog posts:', error)
  }

  return entries
}
