import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { pingUrls } from '@/lib/indexnow'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

/** POST /api/indexnow — Submit all published URLs to IndexNow */
export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const urls: string[] = []

    // Static pages
    const staticEN = ['', 'tours', 'about', 'reviews', 'contact', 'faq', 'blog', 'privacy', 'terms', 'cancellation-policy']
    const staticRU = ['', 'ekskursii', 'o-nas', 'otzyvy', 'kontakty', 'voprosy', 'blog', 'privacy', 'terms', 'cancellation-policy']
    for (const p of staticEN) urls.push(`${BASE_URL}/en/${p}`)
    for (const p of staticRU) urls.push(`${BASE_URL}/ru/${p}`)

    // Tours
    const enTours = await payload.find({ collection: 'tours', where: { status: { equals: 'published' } }, limit: 0, locale: 'en' })
    const ruTours = await payload.find({ collection: 'tours', where: { status: { equals: 'published' } }, limit: 0, locale: 'ru' })

    const ruSlugMap = new Map<number, string>()
    for (const t of ruTours.docs) ruSlugMap.set(t.id as number, t.slug)

    for (const tour of enTours.docs) {
      const locales = (tour as any).publishedLocales || []
      if (locales.includes('en')) urls.push(`${BASE_URL}/en/tours/${tour.slug}`)
      if (locales.includes('ru')) {
        const ruSlug = ruSlugMap.get(tour.id as number) || tour.slug
        urls.push(`${BASE_URL}/ru/ekskursii/${ruSlug}`)
      }
    }

    // Blog posts — use limit: 0 for unlimited
    const enPosts = await payload.find({ collection: 'blog-posts', where: { status: { equals: 'published' } }, limit: 0, locale: 'en' })
    const ruPosts = await payload.find({ collection: 'blog-posts', where: { status: { equals: 'published' } }, limit: 0, locale: 'ru' })

    const ruPostSlugMap = new Map<number, string>()
    for (const p of ruPosts.docs) ruPostSlugMap.set(p.id as number, p.slug as string)

    const addedPostIds = new Set<number>()

    for (const post of enPosts.docs) {
      const locales = (post as any).publishedLocales || []
      if (locales.includes('en')) urls.push(`${BASE_URL}/en/blog/${post.slug}`)
      if (locales.includes('ru')) {
        const ruSlug = ruPostSlugMap.get(post.id as number) || post.slug
        urls.push(`${BASE_URL}/ru/blog/${ruSlug}`)
      }
      addedPostIds.add(post.id as number)
    }

    // RU-only posts not covered by EN loop
    for (const post of ruPosts.docs) {
      if (addedPostIds.has(post.id as number)) continue
      const locales = (post as any).publishedLocales || []
      if (locales.includes('ru')) {
        urls.push(`${BASE_URL}/ru/blog/${post.slug}`)
      }
    }

    // IndexNow accepts max 10,000 URLs per request — batch if needed
    const BATCH_SIZE = 10000
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      await pingUrls(urls.slice(i, i + BATCH_SIZE))
    }

    return NextResponse.json({ success: true, submitted: urls.length, urls })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
