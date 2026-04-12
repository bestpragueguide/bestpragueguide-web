import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET  — audit blog posts and tours missing hero/OG images
 * POST — assign hero images to blog posts based on keyword matching with existing media
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    // Blog posts
    const enPosts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      locale: 'en',
      depth: 0,
    })

    let blogWithHero = 0
    let blogWithoutHero = 0
    const missingHeroPosts: Array<{ id: number; slug: string; title: string }> = []

    for (const post of enPosts.docs) {
      if (post.heroImage) {
        blogWithHero++
      } else {
        blogWithoutHero++
        missingHeroPosts.push({
          id: post.id as number,
          slug: post.slug as string,
          title: (post.title as string || '').substring(0, 60),
        })
      }
    }

    // Tours
    const tours = await payload.find({
      collection: 'tours',
      limit: 0,
      locale: 'en',
      depth: 0,
    })

    let toursWithHero = 0
    let toursWithoutHero = 0
    const missingHeroTours: Array<{ id: number; slug: string; title: string }> = []

    for (const tour of tours.docs) {
      if (tour.heroImage) {
        toursWithHero++
      } else {
        toursWithoutHero++
        missingHeroTours.push({
          id: tour.id as number,
          slug: tour.slug as string,
          title: (tour.title as string || '').substring(0, 60),
        })
      }
    }

    // Available media images
    const media = await payload.find({
      collection: 'media',
      limit: 0,
      depth: 0,
    })

    return NextResponse.json({
      blog: {
        total: enPosts.totalDocs,
        withHero: blogWithHero,
        withoutHero: blogWithoutHero,
        missingList: missingHeroPosts,
      },
      tours: {
        total: tours.totalDocs,
        withHero: toursWithHero,
        withoutHero: toursWithoutHero,
        missingList: missingHeroTours,
      },
      media: {
        total: media.totalDocs,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    // Get all media with their filenames and alt texts for keyword matching
    const media = await payload.find({
      collection: 'media',
      limit: 0,
      locale: 'en',
      depth: 0,
    })

    // Build searchable media index
    const mediaItems = media.docs.map((m: any) => ({
      id: m.id as number,
      filename: (m.filename || '') as string,
      alt: (m.alt || '') as string,
      url: (m.url || '') as string,
      hasOg: !!(m.sizes?.og?.url),
    }))

    // Get blog posts without hero images
    const enPosts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      locale: 'en',
      depth: 0,
    })

    const ruPosts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      locale: 'ru',
      depth: 0,
    })

    // Build RU slug map
    const ruSlugMap = new Map<number, string>()
    for (const p of ruPosts.docs) {
      ruSlugMap.set(p.id as number, p.slug as string)
    }

    const postsWithoutHero = enPosts.docs.filter((p: any) => !p.heroImage)

    // Keyword matching: extract keywords from slug and try to find matching media
    function findMatchingMedia(slug: string, title: string): number | null {
      const words = new Set([
        ...slug.split('-').filter(w => w.length > 3),
        ...title.toLowerCase().split(/\s+/).filter(w => w.length > 4),
      ])

      // Score each media item
      let bestScore = 0
      let bestId: number | null = null

      for (const m of mediaItems) {
        const searchText = `${m.filename} ${m.alt}`.toLowerCase()
        let score = 0
        for (const word of words) {
          if (searchText.includes(word)) score++
        }
        if (score > bestScore) {
          bestScore = score
          bestId = m.id
        }
      }

      return bestScore >= 2 ? bestId : null
    }

    let assigned = 0
    let noMatch = 0
    const results: Array<{ id: number; slug: string; status: string; mediaId?: number }> = []

    for (const post of postsWithoutHero) {
      const slug = post.slug as string
      const title = (post.title as string) || ''
      const ruSlug = ruSlugMap.get(post.id as number) || ''

      // Try matching with EN slug, then RU slug
      let mediaId = findMatchingMedia(slug, title)
      if (!mediaId && ruSlug && ruSlug !== slug) {
        mediaId = findMatchingMedia(ruSlug, '')
      }

      if (mediaId) {
        try {
          // Determine which locale to use for the update
          const publishedLocales = ((post as any).publishedLocales || []) as string[]
          const locale = publishedLocales.includes('en') ? 'en' : 'ru'

          await payload.update({
            collection: 'blog-posts',
            id: post.id,
            locale,
            data: {
              heroImage: mediaId,
            } as any,
          })
          assigned++
          results.push({ id: post.id as number, slug, status: 'assigned', mediaId })
        } catch (err: any) {
          results.push({ id: post.id as number, slug, status: 'error: ' + err.message?.substring(0, 80) })
        }
      } else {
        noMatch++
        results.push({ id: post.id as number, slug, status: 'no-match' })
      }
    }

    return NextResponse.json({
      totalWithoutHero: postsWithoutHero.length,
      assigned,
      noMatch,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
