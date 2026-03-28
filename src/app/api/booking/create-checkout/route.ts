import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createDepositSession } from '@/lib/stripe'
import { logBookingEvent, extractRequestMeta } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: { offerToken?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { offerToken } = body
  if (!offerToken || typeof offerToken !== 'string') {
    return NextResponse.json({ error: 'offerToken required' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  // Find booking by offerToken
  const result = await payload.find({
    collection: 'booking-requests',
    where: { offerToken: { equals: offerToken } },
    limit: 1,
    depth: 0,
  })

  const booking = result.docs[0]
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Validate status
  if (booking.status === 'declined') {
    return NextResponse.json({ error: 'Booking has been declined' }, { status: 400 })
  }

  // Check if fully paid with no balance due
  const balanceDue = (booking as any).balanceDue ?? 0
  const totalPaid = (booking as any).totalPaid ?? 0
  if (booking.paymentStatus === 'fully_paid' && balanceDue <= 0.01) {
    return NextResponse.json({ error: 'Payment already completed' }, { status: 400 })
  }

  // Check offer expiry
  if (booking.offerExpiresAt && new Date(booking.offerExpiresAt) < new Date()) {
    return NextResponse.json({ error: 'Offer has expired' }, { status: 400 })
  }

  // Check payment method — cash_only and none don't need checkout
  const paymentMethod = (booking as any).paymentMethod || 'stripe_deposit'
  if (paymentMethod === 'cash_only' || paymentMethod === 'none') {
    return NextResponse.json({ error: 'No online payment required for this booking' }, { status: 400 })
  }

  // Determine amount — use balance due if there's a prior payment (price change / partial refund)
  const confirmedPrice = (booking as any).confirmedPrice ?? booking.totalPrice ?? 0
  let amount: number

  if (totalPaid > 0 && balanceDue > 0.01) {
    // Additional payment after price change or partial refund
    amount = Math.round(balanceDue)
  } else if (paymentMethod === 'stripe_full') {
    amount = confirmedPrice
  } else {
    // stripe_deposit — first payment
    const customDeposit = (booking as any).customDepositAmount
    if (customDeposit && customDeposit > 0) {
      amount = customDeposit
    } else {
      const config = await payload.findGlobal({ slug: 'payment-config' })
      const depositPercent = config.depositPercent ?? 30
      amount = Math.round(confirmedPrice * depositPercent) / 100
    }
  }

  if (amount <= 0) {
    return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
  }

  // Resolve tour name
  let tourTitle = 'Tour'
  try {
    if (typeof booking.tour === 'number') {
      const tour = await payload.findByID({
        collection: 'tours',
        id: booking.tour,
        locale: (booking.customerLanguage || 'en') as 'en' | 'ru',
      })
      tourTitle = tour.title || tourTitle
    }
  } catch {
    // Use default
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://bestpragueguide.com'
  const locale = booking.customerLanguage || 'en'

  const bookingCurrency = ((booking as any).currency || 'EUR').toLowerCase()

  const session = await createDepositSession({
    bookingId: String(booking.id),
    requestRef: booking.requestRef,
    tourTitle,
    customerEmail: booking.customerEmail,
    depositAmount: amount,
    successUrl: `${baseUrl}/${locale}/booking/${offerToken}?payment=success`,
    cancelUrl: `${baseUrl}/${locale}/booking/${offerToken}?payment=cancelled`,
    currency: bookingCurrency,
  })

  if (!session) {
    return NextResponse.json(
      { error: 'Stripe not configured -- add STRIPE_SECRET_KEY to environment' },
      { status: 503 }
    )
  }

  // Log checkout created audit event
  const reqMeta = extractRequestMeta(req)
  logBookingEvent({
    bookingId: booking.id,
    eventType: 'checkout_created',
    actor: { type: 'customer', id: String(booking.customerEmail), name: String(booking.customerName) },
    description: `Checkout created: ${amount} ${bookingCurrency.toUpperCase()}`,
    ip: reqMeta.ip,
    userAgent: reqMeta.userAgent,
    metadata: { amount, currency: bookingCurrency, sessionUrl: session.url },
  }, payload)

  // Update booking — only set deposit/cashBalance on first payment
  const updateData: Record<string, unknown> = {
    paymentStatus: 'awaiting',
    stripePaymentLink: session.url,
    stripePaymentIntentId: session.paymentIntentId,
  }
  if (totalPaid === 0) {
    updateData.depositAmount = amount
    updateData.cashBalance = confirmedPrice - amount
  }
  await payload.update({
    collection: 'booking-requests',
    id: String(booking.id),
    data: updateData,
  })

  return NextResponse.json({ checkoutUrl: session.url })
}
