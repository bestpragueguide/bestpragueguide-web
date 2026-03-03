import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

async function safeQuery(fn: () => Promise<{ totalDocs: number; docs: any[] }>) {
  try {
    const result = await fn()
    return { totalDocs: result.totalDocs, firstTitle: result.docs[0]?.title }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const results: Record<string, any> = {}

    // Test 1: No filters at all
    results['1_no_filters'] = await safeQuery(() =>
      payload.find({ collection: 'tours', limit: 5 }),
    )

    // Test 2: Only status filter
    results['2_status_published'] = await safeQuery(() =>
      payload.find({
        collection: 'tours',
        where: { status: { equals: 'published' } },
        limit: 5,
      }),
    )

    // Test 3: publishedLocales with contains
    results['3_locales_contains'] = await safeQuery(() =>
      payload.find({
        collection: 'tours',
        where: { publishedLocales: { contains: 'en' } },
        limit: 5,
      }),
    )

    // Test 4: publishedLocales with in
    results['4_locales_in'] = await safeQuery(() =>
      payload.find({
        collection: 'tours',
        where: { publishedLocales: { in: ['en'] } },
        limit: 5,
      }),
    )

    // Test 5: publishedLocales with equals
    results['5_locales_equals'] = await safeQuery(() =>
      payload.find({
        collection: 'tours',
        where: { publishedLocales: { equals: 'en' } },
        limit: 5,
      }),
    )

    // Test 6: Both status + locales with in
    results['6_status_and_locales_in'] = await safeQuery(() =>
      payload.find({
        collection: 'tours',
        where: {
          status: { equals: 'published' },
          publishedLocales: { in: ['en'] },
        },
        limit: 5,
      }),
    )

    // Test 7: draft: false (respects _status)
    results['7_draft_false'] = await safeQuery(() =>
      payload.find({
        collection: 'tours',
        limit: 5,
        draft: false,
      }),
    )

    // Test 8: draft: true
    results['8_draft_true'] = await safeQuery(() =>
      payload.find({
        collection: 'tours',
        limit: 5,
        draft: true,
      }),
    )

    // Get first tour raw fields
    const allTours = await payload.find({ collection: 'tours', limit: 1, draft: true })
    const firstTour = allTours.docs[0]
    const tourFields = firstTour
      ? {
          id: firstTour.id,
          title: firstTour.title,
          status: (firstTour as any).status,
          _status: (firstTour as any)._status,
          publishedLocales: (firstTour as any).publishedLocales,
          category: firstTour.category,
          slug: firstTour.slug,
        }
      : null

    return NextResponse.json({ results, firstTour: tourFields })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
