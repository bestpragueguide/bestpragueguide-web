export const dynamic = 'force-dynamic'

import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

const staticPages = [
  { path: '', en: '', ru: '', changeFrequency: 'daily' as const, priority: 1.0 },
  { path: 'tours', en: 'tours', ru: 'ekskursii', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: 'about', en: 'prague-guide', ru: 'o-nas', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: 'reviews', en: 'reviews', ru: 'otzyvy', changeFrequency: 'weekly' as const, priority: 0.6 },
  { path: 'contact', en: 'contact', ru: 'kontakty', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: 'faq', en: 'faq', ru: 'voprosy', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: 'blog', en: 'blog', ru: 'blog', changeFrequency: 'daily' as const, priority: 0.8 },
  { path: 'privacy', en: 'privacy', ru: 'privacy', changeFrequency: 'monthly' as const, priority: 0.2 },
  { path: 'terms', en: 'terms', ru: 'terms', changeFrequency: 'monthly' as const, priority: 0.2 },
  {
    path: 'cancellation-policy',
    en: 'cancellation-policy',
    ru: 'cancellation-policy',
    changeFrequency: 'monthly' as const,
    priority: 0.2,
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
      changeFrequency: page.changeFrequency,
      priority: page.priority,
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
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/${page.en}`,
          ru: `${BASE_URL}/ru/${page.ru}`,
        },
      },
    })
  }

  // EN-only landing pages (no RU equivalent)
  const enOnlyPages = [
    'private-walking-tour-prague',
    'licensed-guide-prague',
    'prague-sightseeing-tour',
  ]
  for (const slug of enOnlyPages) {
    entries.push({
      url: `${BASE_URL}/en/${slug}`,
      lastModified: fallbackDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Dynamic tour pages
  try {
    const payload = await getPayload({ config })

    const enTours = await payload.find({
      collection: 'tours',
      where: { status: { equals: 'published' } },
      limit: 0,
      locale: 'en',
    })

    const ruTours = await payload.find({
      collection: 'tours',
      where: { status: { equals: 'published' } },
      limit: 0,
      locale: 'ru',
    })

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
          changeFrequency: 'weekly',
          priority: 0.8,
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
          changeFrequency: 'weekly',
          priority: 0.8,
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
      limit: 0,
      locale: 'en',
    })

    const ruPosts = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 0,
      locale: 'ru',
    })

    const ruPostSlugMap = new Map<number, string>()
    for (const p of ruPosts.docs) {
      ruPostSlugMap.set(p.id as number, p.slug as string)
    }
    const enPostSlugMap = new Map<number, string>()
    for (const p of enPosts.docs) {
      enPostSlugMap.set(p.id as number, p.slug as string)
    }

    const addedPostIds = new Set<number>()

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
          changeFrequency: 'weekly',
          priority: 0.6,
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
          changeFrequency: 'weekly',
          priority: 0.6,
          alternates: { languages: alternates },
        })
      }

      addedPostIds.add(post.id as number)
    }

    // RU-only posts
    for (const post of ruPosts.docs) {
      if (addedPostIds.has(post.id as number)) continue
      const publishedLocales = (post as any).publishedLocales || []
      if (!publishedLocales.includes('ru')) continue

      const ruSlug = post.slug as string
      const lastMod = new Date((post.updatedAt as string) || (post as any).publishedAt)

      entries.push({
        url: `${BASE_URL}/ru/blog/${ruSlug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: { languages: { ru: `${BASE_URL}/ru/blog/${ruSlug}` } },
      })
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch blog posts:', error)
  }

  return entries
}
