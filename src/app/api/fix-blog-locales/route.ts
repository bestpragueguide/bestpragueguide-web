import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Fix publishedLocales for all blog posts.
 *
 * GET  — audit: count posts with wrong publishedLocales
 * POST — fix: set publishedLocales based on actual content presence
 *
 * Detection: fetch with fallbackLocale:false — if title is null/empty,
 * that locale has no real content (Payload returns null instead of fallback).
 */

async function detectLocales(payload: any) {
  // fallbackLocale: false returns null for fields without locale-specific data
  const enPosts = await payload.find({
    collection: 'blog-posts',
    limit: 0,
    locale: 'en',
    fallbackLocale: false as any,
    depth: 0,
  })

  const ruPosts = await payload.find({
    collection: 'blog-posts',
    limit: 0,
    locale: 'ru',
    fallbackLocale: false as any,
    depth: 0,
  })

  const enTitles = new Map<number, string>()
  const ruTitles = new Map<number, string>()

  for (const p of enPosts.docs) {
    enTitles.set(p.id as number, (p.title || '') as string)
  }
  for (const p of ruPosts.docs) {
    ruTitles.set(p.id as number, (p.title || '') as string)
  }

  return { enPosts, enTitles, ruTitles }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const { enPosts, enTitles, ruTitles } = await detectLocales(payload)

    let correctCount = 0
    let wrongCount = 0
    const wrongPosts: Array<{ id: number; slug: string; enTitle: string; ruTitle: string; current: string[]; shouldBe: string[] }> = []

    for (const p of enPosts.docs) {
      const id = p.id as number
      const currentLocales = ((p as any).publishedLocales || []) as string[]
      const shouldBe: string[] = []
      if ((enTitles.get(id) || '').length > 0) shouldBe.push('en')
      if ((ruTitles.get(id) || '').length > 0) shouldBe.push('ru')

      const currentSorted = [...currentLocales].sort().join(',')
      const shouldSorted = [...shouldBe].sort().join(',')

      if (currentSorted === shouldSorted) {
        correctCount++
      } else {
        wrongCount++
        if (wrongPosts.length < 30) {
          wrongPosts.push({
            id,
            slug: p.slug as string,
            enTitle: (enTitles.get(id) || '').substring(0, 40),
            ruTitle: (ruTitles.get(id) || '').substring(0, 40),
            current: currentLocales,
            shouldBe,
          })
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
    const { enPosts, enTitles, ruTitles } = await detectLocales(payload)

    let fixed = 0
    let skipped = 0
    let errors = 0

    for (const p of enPosts.docs) {
      const id = p.id as number
      const currentLocales = ((p as any).publishedLocales || []) as string[]
      const shouldBe: string[] = []
      if ((enTitles.get(id) || '').length > 0) shouldBe.push('en')
      if ((ruTitles.get(id) || '').length > 0) shouldBe.push('ru')

      const currentSorted = [...currentLocales].sort().join(',')
      const shouldSorted = [...shouldBe].sort().join(',')

      if (currentSorted === shouldSorted) {
        skipped++
        continue
      }

      try {
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
