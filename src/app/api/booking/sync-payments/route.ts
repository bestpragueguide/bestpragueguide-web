import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { logBookingEvent } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/** POST /api/booking/sync-payments — Sync Stripe transactions for a booking */
export async function POST(req: NextRequest) {
  // Auth: JWT (admin panel) or x-init-secret (API)
  const payload = await getPayload({ config: configPromise })
  const secret = req.headers.get('x-init-secret')
  const { user } = await payload.auth({ headers: req.headers })
  if (!user && secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  let body: { bookingId?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { bookingId } = body
  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId required' }, { status: 400 })
  }

  try {
    const booking = await payload.findByID({
      collection: 'booking-requests',
      id: bookingId,
      depth: 0,
    })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Collect all payment intent IDs from existing transactions + current field
    const knownPIs = new Set<string>()
    const existingTxns = (booking as any).transactions || []
    for (const txn of existingTxns) {
      if (txn.stripeId && txn.stripeId.startsWith('pi_')) knownPIs.add(txn.stripeId)
    }
    if (booking.stripePaymentIntentId) {
      knownPIs.add(booking.stripePaymentIntentId)
    }

    if (knownPIs.size === 0) {
      return NextResponse.json({ success: true, message: 'No Stripe payment intents found', synced: 0 })
    }

    // Full rebuild from Stripe — replace all existing transactions
    const rebuiltTransactions: Array<{ type: string; amount: number; description: string; stripeId: string; recordedAt: string }> = []

    for (const piId of knownPIs) {
      try {
        const charges = await stripe.charges.list({ payment_intent: piId, limit: 10 })

        for (const charge of charges.data) {
          if (charge.paid && charge.status === 'succeeded') {
            rebuiltTransactions.push({
              type: 'payment',
              amount: charge.amount / 100,
              description: rebuiltTransactions.some(t => t.type === 'payment') ? 'Additional payment' : 'Initial payment',
              stripeId: piId,
              recordedAt: new Date(charge.created * 1000).toISOString(),
            })
          }

          if (charge.amount_refunded > 0) {
            const refunds = await stripe.refunds.list({ charge: charge.id, limit: 10 })
            for (const refund of refunds.data) {
              const isFullRefund = refund.amount === charge.amount
              rebuiltTransactions.push({
                type: 'refund',
                amount: refund.amount / 100,
                description: isFullRefund ? 'Full refund' : 'Partial refund',
                stripeId: refund.id,
                recordedAt: new Date(refund.created * 1000).toISOString(),
              })
            }
          }
        }
      } catch (err) {
        console.error(`[sync-payments] Failed for PI ${piId}:`, err)
      }
    }

    // Sort by date
    rebuiltTransactions.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())

    // Recalculate totals
    const totalPaid = rebuiltTransactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalRefunded = rebuiltTransactions
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + t.amount, 0)
    const netPaid = totalPaid - totalRefunded
    const confirmedPrice = (booking as any).confirmedPrice || booking.totalPrice || 0
    const balanceDue = confirmedPrice - netPaid

    // Determine payment status based on net balance
    let paymentStatus = booking.paymentStatus
    if (netPaid <= 0.01 && totalRefunded > 0) {
      paymentStatus = 'refunded'
    } else if (balanceDue <= 0.01 && netPaid > 0) {
      paymentStatus = 'fully_paid'
    } else if (netPaid > 0) {
      paymentStatus = 'deposit_paid'
    }

    await payload.update({
      collection: 'booking-requests',
      id: bookingId,
      data: {
        transactions: rebuiltTransactions,
        totalPaid: netPaid,
        balanceDue,
        paymentStatus,
      },
    })

    logBookingEvent({
      bookingId,
      eventType: 'field_update',
      actor: { type: 'system' },
      description: `Rebuilt ${rebuiltTransactions.length} Stripe transactions`,
      metadata: { count: rebuiltTransactions.length, totalPaid: netPaid, totalRefunded, balanceDue, paymentStatus },
    }, payload)

    return NextResponse.json({
      success: true,
      synced: rebuiltTransactions.length,
      totalPaid: netPaid,
      totalRefunded,
      balanceDue,
      paymentStatus,
      transactions: rebuiltTransactions.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
