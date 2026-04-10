export const dynamic = 'force-dynamic'

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

  // Fetch last-modified dates from CMS globals
  const globalDates = new Map<string, Date>()
  try {
    const payload = await getPayload({ config })
    const globals = ['homepage', 'about-page', 'reviews-page', 'navigation', 'site-settings']
    for (const slug of globals) {
      const g = await payload.findGlobal({ slug: slug as any })
      if (g.updatedAt) globalDates.set(slug, new Date(g.updatedAt as string))
    }
  } catch { /* use fallback */ }

  const pageGlobalMap: Record<string, string> = {
    '': 'homepage',
    'tours': 'site-settings',
    'about': 'about-page',
    'reviews': 'reviews-page',
    'contact': 'site-settings',
    'faq': 'site-settings',
    'blog': 'site-settings',
    'privacy': 'site-settings',
    'terms': 'site-settings',
    'cancellation-policy': 'site-settings',
  }

  const fallbackDate = new Date()

  for (const page of staticPages) {
    const globalSlug = pageGlobalMap[page.path] || 'site-settings'
    const lastModified = globalDates.get(globalSlug) || fallbackDate

    entries.push({
      url: `${BASE_URL}/en/${page.en}`,
      lastModified,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/${page.en}`,
          ru: `${BASE_URL}/ru/${page.ru}`,
        },
      },
    })
    entries.push({
      url: `${BASE_URL}/ru/${page.ru}`,
      lastModified,
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

    // Fetch ALL published blog posts (increase limit for large sites)
    const enPosts = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 500,
      locale: 'en',
    })

    const ruPosts = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 500,
      locale: 'ru',
    })

    // Build maps for cross-referencing slugs
    const ruPostSlugMap = new Map<number, string>()
    for (const p of ruPosts.docs) {
      ruPostSlugMap.set(p.id as number, p.slug as string)
    }
    const enPostSlugMap = new Map<number, string>()
    for (const p of enPosts.docs) {
      enPostSlugMap.set(p.id as number, p.slug as string)
    }

    // Track which post IDs we've already added
    const addedPostIds = new Set<number>()

    // Process EN posts (adds EN URLs + RU URLs for bilingual posts)
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

      addedPostIds.add(post.id as number)
    }

    // Process RU-only posts not already covered by EN loop
    for (const post of ruPosts.docs) {
      if (addedPostIds.has(post.id as number)) continue
      const publishedLocales = (post as any).publishedLocales || []
      if (!publishedLocales.includes('ru')) continue

      const ruSlug = post.slug as string
      const lastMod = new Date((post.updatedAt as string) || (post as any).publishedAt)

      entries.push({
        url: `${BASE_URL}/ru/blog/${ruSlug}`,
        lastModified: lastMod,
        alternates: { languages: { ru: `${BASE_URL}/ru/blog/${ruSlug}` } },
      })
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch blog posts:', error)
  }

  return entries
}
