import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/** Backfill tourName on existing booking requests using customer's language */
export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db.drizzle
    const results: any[] = []

    // Get all bookings without tourName
    const bookings = await payload.find({
      collection: 'booking-requests',
      where: {
        or: [
          { tourName: { exists: false } },
          { tourName: { equals: '' } },
        ],
      },
      limit: 500,
      depth: 0,
    })

    for (const booking of bookings.docs) {
      const tourId = typeof booking.tour === 'object' ? (booking.tour as any).id : booking.tour
      const locale = ((booking as any).customerLanguage || 'en') as 'en' | 'ru'
      if (!tourId) continue

      try {
        const tour = await payload.findByID({
          collection: 'tours',
          id: tourId,
          locale,
          depth: 0,
        })
        if (tour?.title) {
          await db.execute(
            sql`UPDATE booking_requests SET tour_name = ${tour.title} WHERE id = ${booking.id}`
          )
          results.push({ id: booking.id, ref: (booking as any).requestRef, locale, tourName: tour.title })
        }
      } catch { /* skip */ }
    }

    return NextResponse.json({ success: true, updated: results.length, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
