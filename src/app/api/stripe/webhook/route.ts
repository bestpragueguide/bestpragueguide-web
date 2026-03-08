import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe/webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const { bookingId, depositEur } = session.metadata ?? {}
  if (!bookingId) return NextResponse.json({ received: true })

  try {
    const payload = await getPayload({ config: configPromise })
    const booking = await payload.findByID({
      collection: 'booking-requests',
      id: bookingId,
      depth: 1, // need tour object for title in n8n payload
    })
    if (!booking) return NextResponse.json({ received: true })

    const paidEur = parseFloat(depositEur ?? '0')
    const totalEur = booking.totalPrice ?? 0
    const isFullyPaid = paidEur >= totalEur * 0.999 // allow for rounding

    await payload.update({
      collection: 'booking-requests',
      id: bookingId,
      data: {
        paymentStatus: isFullyPaid ? 'fully_paid' : 'deposit_paid',
        stripePaymentIntentId: String(session.payment_intent ?? ''),
        stripeChargedCents: session.amount_total ?? 0,
        stripeChargeCurrency: session.currency?.toUpperCase() ?? 'EUR',
        cashBalanceEur: totalEur - paidEur,
        paidAt: new Date().toISOString(),
      },
    })

    // Notify n8n payment-received (n8n handles customer email + Chatwoot update)
    const { n8n } = await import('@/lib/n8n')
    const tourDoc = booking.tour && typeof booking.tour === 'object'
      ? (booking.tour as { title?: string })
      : null
    await n8n.paymentReceived({
      bookingId,
      requestRef: booking.requestRef,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerLanguage: booking.customerLanguage as 'en' | 'ru',
      tourTitle: String(tourDoc?.title ?? 'Tour'),
      depositPaidEur: paidEur,
      cashBalanceEur: totalEur - paidEur,
      isFullyPaid,
      chatwootConversationId: booking.chatwootConversationId ?? undefined,
      mauticContactId: booking.mauticContactId ?? undefined,
      paidAt: new Date().toISOString(),
    }).catch(console.error)
  } catch (err) {
    console.error('[stripe/webhook] DB update failed:', err)
    // Return 200 anyway — Stripe should not retry for our DB errors
  }

  return NextResponse.json({ received: true })
}
