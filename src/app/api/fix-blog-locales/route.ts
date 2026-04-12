import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Fix publishedLocales for all blog posts.
 *
 * GET  — audit: count posts with wrong publishedLocales
 * POST — fix: set publishedLocales based on actual content presence
 *
 * Logic: if a post has title+content in EN locale → include 'en'
 *        if a post has title+content in RU locale → include 'ru'
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

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

    // Build maps of which posts have real content in each locale
    const enHasContent = new Map<number, boolean>()
    const ruHasContent = new Map<number, boolean>()

    for (const p of enPosts.docs) {
      const title = (p.title || '') as string
      enHasContent.set(p.id as number, title.length > 0)
    }

    for (const p of ruPosts.docs) {
      const title = (p.title || '') as string
      ruHasContent.set(p.id as number, title.length > 0)
    }

    let correctCount = 0
    let wrongCount = 0
    const wrongPosts: Array<{ id: number; slug: string; current: string[]; shouldBe: string[] }> = []

    for (const p of enPosts.docs) {
      const id = p.id as number
      const currentLocales = ((p as any).publishedLocales || []) as string[]
      const shouldBe: string[] = []
      if (enHasContent.get(id)) shouldBe.push('en')
      if (ruHasContent.get(id)) shouldBe.push('ru')

      const currentSorted = [...currentLocales].sort().join(',')
      const shouldSorted = [...shouldBe].sort().join(',')

      if (currentSorted === shouldSorted) {
        correctCount++
      } else {
        wrongCount++
        if (wrongPosts.length < 30) {
          wrongPosts.push({ id, slug: p.slug as string, current: currentLocales, shouldBe })
        }
      }
    }

    return NextResponse.json({
      total: enPosts.totalDocs,
      correct: correctCount,
      wrong: wrongCount,
      sample: wrongPosts,
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

    const enHasContent = new Map<number, boolean>()
    const ruHasContent = new Map<number, boolean>()

    for (const p of enPosts.docs) {
      enHasContent.set(p.id as number, ((p.title || '') as string).length > 0)
    }
    for (const p of ruPosts.docs) {
      ruHasContent.set(p.id as number, ((p.title || '') as string).length > 0)
    }

    let fixed = 0
    let skipped = 0
    let errors = 0

    for (const p of enPosts.docs) {
      const id = p.id as number
      const currentLocales = ((p as any).publishedLocales || []) as string[]
      const shouldBe: string[] = []
      if (enHasContent.get(id)) shouldBe.push('en')
      if (ruHasContent.get(id)) shouldBe.push('ru')

      const currentSorted = [...currentLocales].sort().join(',')
      const shouldSorted = [...shouldBe].sort().join(',')

      if (currentSorted === shouldSorted) {
        skipped++
        continue
      }

      try {
        // Use the locale that has content for the update
        const updateLocale = shouldBe.includes('en') ? 'en' : 'ru'
        await payload.update({
          collection: 'blog-posts',
          id,
          locale: updateLocale,
          data: {
            publishedLocales: shouldBe,
          } as any,
        })
        fixed++
      } catch (err: any) {
        errors++
      }
    }

    return NextResponse.json({ total: enPosts.totalDocs, fixed, skipped, errors })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
