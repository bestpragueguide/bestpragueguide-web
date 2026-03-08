import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tourSlug: string }> }
) {
  const { tourSlug } = await params
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // Expected: YYYY-MM

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: 'month parameter required in YYYY-MM format' },
      { status: 400 }
    )
  }

  const [yearStr, monStr] = month.split('-')
  const year = parseInt(yearStr, 10)
  const mon = parseInt(monStr, 10)

  // First and last moment of the requested month
  const dateFrom = new Date(year, mon - 1, 1).toISOString()
  const dateTo = new Date(year, mon, 0, 23, 59, 59).toISOString()

  const payload = await getPayload({ config: configPromise })

  // Find tour by slug — use `equals` not `contains` (see SYSTEM-SPECIFICATION §15)
  const tours = await payload.find({
    collection: 'tours',
    where: { slug: { equals: tourSlug } },
    limit: 1,
    depth: 0,
  })

  if (!tours.docs.length) {
    return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
  }

  const tour = tours.docs[0]

  const dates = await payload.find({
    collection: 'tour-dates',
    where: {
      and: [
        { tour: { equals: tour.id } },
        { date: { greater_than_equal: dateFrom } },
        { date: { less_than_equal: dateTo } },
        { status: { not_in: ['private', 'unavailable'] } },
      ],
    },
    limit: 62, // max days in 2 months
    sort: 'date',
    depth: 0,
  })

  const result = dates.docs.map((d) => ({
    date: String(d.date).slice(0, 10), // YYYY-MM-DD
    startTime: d.startTime,
    status: d.status,
    availableSpots: Math.max(0, (d.maxCapacity ?? 12) - (d.confirmedGuests ?? 0)),
    maxCapacity: d.maxCapacity ?? 12,
    priceNote: d.priceNote ?? null,
  }))

  return NextResponse.json(
    { dates: result },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  )
}
