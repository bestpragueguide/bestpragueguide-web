import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const results: string[] = []

    // Fetch all published tours
    const allTours = await payload.find({
      collection: 'tours',
      where: { _status: { equals: 'published' } },
      limit: 200,
      depth: 0,
      locale: 'en',
    })

    const tours = allTours.docs.map((t: any) => ({
      id: t.id,
      title: t.title || '',
      slug: t.slug || '',
      category: t.category || '',
      subcategory: t.subcategory || '',
      publishedLocales: t.publishedLocales || [],
      relatedTours: t.relatedTours || [],
    }))

    for (const tour of tours) {
      // Skip if already has 3+ related tours
      if (tour.relatedTours && tour.relatedTours.length >= 3) {
        results.push(`SKIP: ${tour.title} (already has ${tour.relatedTours.length} related)`)
        continue
      }

      // Score other tours by relevance
      const scored = tours
        .filter((t: any) => t.id !== tour.id)
        .map((t: any) => {
          let score = 0

          // Same category = high relevance
          if (t.category && t.category === tour.category) score += 10

          // Same subcategory = highest relevance
          if (t.subcategory && t.subcategory === tour.subcategory) score += 5

          // Same published locale = relevant to same audience
          const tourLocales = new Set(tour.publishedLocales)
          const otherLocales = t.publishedLocales || []
          for (const loc of otherLocales) {
            if (tourLocales.has(loc)) score += 3
          }

          // Different category = some variety is good (small bonus)
          if (t.category && t.category !== tour.category) score += 1

          return { id: t.id, title: t.title, score }
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3)

      if (scored.length === 0) continue

      const relatedIds = scored.map((s: any) => s.id)

      await payload.update({
        collection: 'tours',
        id: tour.id,
        data: {
          relatedTours: relatedIds,
        },
        locale: 'en',
      })

      results.push(`OK: ${tour.title} → ${scored.map((s: any) => s.title).join(', ')}`)
    }

    return NextResponse.json({
      success: true,
      total: tours.length,
      updated: results.filter(r => r.startsWith('OK')).length,
      skipped: results.filter(r => r.startsWith('SKIP')).length,
      results,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
