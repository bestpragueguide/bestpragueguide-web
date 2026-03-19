import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { isRateLimited } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (await isRateLimited(ip, 'booking-lookup')) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  let body: { ref?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { ref, email } = body
  if (!ref || !email) {
    return NextResponse.json({ error: 'ref and email required' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'booking-requests',
    where: {
      and: [
        { requestRef: { equals: ref.trim().toUpperCase() } },
        { customerEmail: { equals: email.trim().toLowerCase() } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  const booking = result.docs[0]

  if (!booking) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  if (!(booking as any).offerToken) {
    return NextResponse.json({ error: 'pending' }, { status: 200 })
  }

  return NextResponse.json({
    redirectUrl: `/booking/${(booking as any).offerToken}`,
  })
}
