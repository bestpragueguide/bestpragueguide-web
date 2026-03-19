import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — payment features disabled')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
  : null

/**
 * Create a Stripe Checkout session for a booking deposit.
 * Returns null when Stripe is not configured (dev/staging without keys).
 */
export async function createDepositSession(params: {
  bookingId: string
  requestRef: string
  tourTitle: string
  customerEmail: string
  depositAmountEur: number
  successUrl: string
  cancelUrl: string
  currency?: string
}): Promise<{ sessionId: string; url: string; paymentIntentId: string } | null> {
  if (!stripe) return null

  // Stripe requires integer amounts in smallest unit (cents for EUR/USD, hellers for CZK).
  const amountCents = Math.round(params.depositAmountEur * 100)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: params.customerEmail,
    metadata: {
      bookingId: params.bookingId,
      requestRef: params.requestRef,
      depositEur: params.depositAmountEur.toFixed(2),
    },
    line_items: [
      {
        price_data: {
          currency: params.currency || 'eur',
          unit_amount: amountCents,
          product_data: {
            name: `Deposit — ${params.tourTitle}`,
            description: `Booking ref: ${params.requestRef}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
  })

  return {
    sessionId: session.id,
    url: session.url!,
    paymentIntentId: session.payment_intent as string,
  }
}

/**
 * Refund a payment intent, full or partial.
 * Pass refundPercent = 100 for full refund.
 */
export async function refundPayment(params: {
  paymentIntentId: string
  refundPercent: number   // 0–100
  originalCents: number
  reason?: string
}): Promise<{ refundId: string } | null> {
  if (!stripe) return null

  const refundCents = Math.round(params.originalCents * params.refundPercent / 100)
  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: refundCents > 0 ? refundCents : undefined,
    reason: 'requested_by_customer',
    metadata: { reason: params.reason ?? 'booking_cancellation' },
  })

  return { refundId: refund.id }
}
