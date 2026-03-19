import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { logBookingEvent, extractRequestMeta } from '@/lib/audit'
import { getIpInfo } from '@/lib/ip'
import { isRateLimited } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const reqMeta = extractRequestMeta(request)

  if (await isRateLimited(reqMeta.ip, 'booking-view')) {
    return NextResponse.json({ ok: true })
  }

  try {
    const { offerToken } = await request.json()
    if (!offerToken) return NextResponse.json({ ok: true })

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'booking-requests',
      where: { offerToken: { equals: offerToken } },
      limit: 1,
      depth: 0,
    })
    const booking = result.docs[0]
    if (!booking) return NextResponse.json({ ok: true })

    // Check if return visit
    const existing = await payload.find({
      collection: 'booking-audit-log',
      where: {
        and: [
          { booking: { equals: booking.id } },
          { eventType: { in: ['page_view', 'page_view_return'] } },
          { ipAddress: { equals: reqMeta.ip } },
        ],
      },
      limit: 1,
      depth: 0,
    })
    const isReturn = existing.docs.length > 0

    const ipInfo = await getIpInfo(reqMeta.ip)

    await logBookingEvent({
      bookingId: booking.id,
      eventType: isReturn ? 'page_view_return' : 'page_view',
      actor: { type: 'customer', id: String(booking.customerEmail), name: String(booking.customerName) },
      description: isReturn
        ? `Return visit from ${ipInfo.city || reqMeta.ip}`
        : `Page opened from ${ipInfo.city || reqMeta.ip}`,
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
      ipGeo: { city: ipInfo.city, region: ipInfo.region, country: ipInfo.country, isp: ipInfo.org },
      metadata: { offerToken, referrer: request.headers.get('referer') || '' },
    }, payload)
  } catch (err) {
    console.error('[TrackView]', err)
  }

  return NextResponse.json({ ok: true })
}
