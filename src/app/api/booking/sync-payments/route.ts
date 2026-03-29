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

    // Collect all payment intents from existing transactions + current field
    const knownPIs = new Set<string>()
    const existingTxns = (booking as any).transactions || []
    for (const txn of existingTxns) {
      if (txn.stripeId) knownPIs.add(txn.stripeId)
    }
    if (booking.stripePaymentIntentId) {
      knownPIs.add(booking.stripePaymentIntentId)
    }

    if (knownPIs.size === 0) {
      return NextResponse.json({ success: true, message: 'No Stripe payment intents found', synced: 0 })
    }

    const newTransactions = [...existingTxns]
    const existingStripeIds = new Set(existingTxns.map((t: any) => t.stripeId))
    let added = 0

    for (const piId of knownPIs) {
      // Skip charge IDs (ch_...) — we look up via payment intent
      if (piId.startsWith('ch_')) continue

      try {
        // Get all charges for this payment intent
        const charges = await stripe.charges.list({ payment_intent: piId, limit: 10 })

        for (const charge of charges.data) {
          // Record successful payment if not already tracked
          if (charge.paid && charge.status === 'succeeded') {
            const chargeAmount = charge.amount / 100
            if (!existingStripeIds.has(piId) && !existingStripeIds.has(charge.id)) {
              newTransactions.push({
                type: 'payment',
                amount: chargeAmount,
                description: `Synced payment`,
                stripeId: piId,
                recordedAt: new Date(charge.created * 1000).toISOString(),
              })
              existingStripeIds.add(piId)
              added++
            }
          }

          // Record refunds
          if (charge.amount_refunded > 0) {
            const refunds = await stripe.refunds.list({ charge: charge.id, limit: 10 })
            for (const refund of refunds.data) {
              const refundId = refund.id
              if (!existingStripeIds.has(refundId)) {
                newTransactions.push({
                  type: 'refund',
                  amount: refund.amount / 100,
                  description: refund.reason === 'requested_by_customer' ? 'Customer refund' : 'Refund',
                  stripeId: refundId,
                  recordedAt: new Date(refund.created * 1000).toISOString(),
                })
                existingStripeIds.add(refundId)
                added++
              }
            }
          }
        }
      } catch (err) {
        console.error(`[sync-payments] Failed for PI ${piId}:`, err)
      }
    }

    if (added === 0) {
      return NextResponse.json({ success: true, message: 'Already in sync', synced: 0 })
    }

    // Recalculate totals
    const totalPaid = newTransactions
      .filter((t: any) => t.type === 'payment')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
    const totalRefunded = newTransactions
      .filter((t: any) => t.type === 'refund')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
    const netPaid = totalPaid - totalRefunded
    const confirmedPrice = (booking as any).confirmedPrice || booking.totalPrice || 0
    const balanceDue = confirmedPrice - netPaid

    // Determine payment status
    let paymentStatus = booking.paymentStatus
    if (totalRefunded > 0 && netPaid <= 0.01) {
      paymentStatus = 'refunded'
    } else if (totalRefunded > 0) {
      paymentStatus = 'refund_pending'
    } else if (balanceDue <= 0.01 && netPaid > 0) {
      paymentStatus = 'fully_paid'
    } else if (netPaid > 0) {
      paymentStatus = 'deposit_paid'
    }

    await payload.update({
      collection: 'booking-requests',
      id: bookingId,
      data: {
        transactions: newTransactions,
        totalPaid: netPaid,
        balanceDue,
        paymentStatus,
      },
    })

    logBookingEvent({
      bookingId,
      eventType: 'field_update',
      actor: { type: 'system' },
      description: `Synced ${added} Stripe transactions`,
      metadata: { added, totalPaid: netPaid, totalRefunded, balanceDue, paymentStatus },
    }, payload)

    return NextResponse.json({
      success: true,
      synced: added,
      totalPaid: netPaid,
      totalRefunded,
      balanceDue,
      paymentStatus,
      transactions: newTransactions.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
