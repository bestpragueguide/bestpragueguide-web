import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Test 1: No filters at all
    const all = await payload.find({
      collection: 'tours',
      limit: 5,
    })

    // Test 2: Only status filter
    const statusOnly = await payload.find({
      collection: 'tours',
      where: { status: { equals: 'published' } },
      limit: 5,
    })

    // Test 3: Only publishedLocales filter with contains
    const localesContains = await payload.find({
      collection: 'tours',
      where: { publishedLocales: { contains: 'en' } },
      limit: 5,
    })

    // Test 4: publishedLocales with in operator
    const localesIn = await payload.find({
      collection: 'tours',
      where: { publishedLocales: { in: ['en'] } },
      limit: 5,
    })

    // Test 5: Both filters
    const both = await payload.find({
      collection: 'tours',
      where: {
        status: { equals: 'published' },
        publishedLocales: { contains: 'en' },
      },
      limit: 5,
    })

    // Test 6: Check _status field (drafts)
    const draftsStatus = await payload.find({
      collection: 'tours',
      where: { _status: { equals: 'published' } },
      limit: 5,
      draft: false,
    })

    // Get first tour raw data for inspection
    const firstTour = all.docs[0]
    const tourData = firstTour
      ? {
          id: firstTour.id,
          title: firstTour.title,
          status: (firstTour as any).status,
          _status: (firstTour as any)._status,
          publishedLocales: (firstTour as any).publishedLocales,
          category: firstTour.category,
        }
      : null

    return NextResponse.json({
      tests: {
        'no_filters': all.totalDocs,
        'status_only': statusOnly.totalDocs,
        'locales_contains': localesContains.totalDocs,
        'locales_in': localesIn.totalDocs,
        'both_filters': both.totalDocs,
        'drafts_status': draftsStatus.totalDocs,
      },
      firstTour: tourData,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
