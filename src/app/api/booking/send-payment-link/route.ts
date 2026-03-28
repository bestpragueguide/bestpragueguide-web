import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createDepositSession } from '@/lib/stripe'
import { n8n } from '@/lib/n8n'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  // Require Payload admin auth
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookingId } = await req.json() as { bookingId: string }
  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId required' }, { status: 400 })
  }

  const booking = await payload.findByID({
    collection: 'booking-requests',
    id: bookingId,
    depth: 1,
  })

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.status !== 'confirmed') {
    return NextResponse.json(
      { error: 'Booking must be confirmed before sending payment link' },
      { status: 400 }
    )
  }

  const config = await payload.findGlobal({ slug: 'payment-config' })

  if (!config.depositEnabled) {
    return NextResponse.json({ error: 'Deposits not enabled in settings' }, { status: 400 })
  }

  const depositPercent = config.depositPercent ?? 30
  const totalEur = booking.totalPrice ?? 0
  const depositEur = Math.round(totalEur * depositPercent) / 100
  const cashBalance = totalEur - depositEur

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://bestpragueguide.com'
  const tourTitle =
    typeof booking.tour === 'object' && booking.tour !== null
      ? String((booking.tour as { title?: unknown }).title ?? 'Tour')
      : 'Tour'

  const session = await createDepositSession({
    bookingId,
    requestRef: booking.requestRef,
    tourTitle,
    customerEmail: booking.customerEmail,
    depositAmount: depositEur,
    successUrl: `${baseUrl}/${booking.customerLanguage}/booking/payment-success?ref=${booking.requestRef}`,
    cancelUrl: `${baseUrl}/${booking.customerLanguage}/booking/payment-cancelled?ref=${booking.requestRef}`,
  })

  if (!session) {
    return NextResponse.json(
      { error: 'Stripe not configured — add STRIPE_SECRET_KEY to environment' },
      { status: 503 }
    )
  }

  // Persist to booking record
  await payload.update({
    collection: 'booking-requests',
    id: bookingId,
    data: {
      stripePaymentLink: session.url,
      stripePaymentIntentId: session.paymentIntentId,
      depositAmount: depositEur,
      cashBalance,
      paymentStatus: 'link_sent',
    },
  })

  // Fire n8n confirmed workflow (handles customer email + Chatwoot note)
  await n8n.bookingConfirmed({
    bookingId,
    requestRef: booking.requestRef,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerLanguage: booking.customerLanguage as 'en' | 'ru',
    tourTitle,
    tourSlug: typeof booking.tour === 'object'
      ? String((booking.tour as { slug?: unknown }).slug ?? '')
      : '',
    confirmedDate: booking.preferredDate,
    confirmedTime: booking.preferredTime ?? '',
    guests: booking.guests,
    totalPrice: totalEur,
    prepaymentRequired: true,
    depositAmount: depositEur,
    depositPercent,
    stripeCheckoutUrl: session.url,
    paymentDeadlineDays: config.paymentDeadlineDays ?? 3,
  })

  return NextResponse.json({
    success: true,
    depositEur,
    cashBalance,
    checkoutUrl: session.url,
  })
}
