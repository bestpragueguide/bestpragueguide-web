import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { logBookingEvent } from '@/lib/audit'
import { sendEmail } from '@/lib/email'
import { getEmailTemplates, resolveTemplate, getNotificationEmail } from '@/lib/cms-data'
import { PaymentReceivedEmail } from '@/emails/payment-received'
import { RefundProcessedEmail } from '@/emails/refund-processed'
import { formatEmailDate } from '@/emails/utils'

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

  if (event.type === 'checkout.session.completed') {
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

      // Calculate running totals
      const existingTransactions = (booking as any).transactions || []
      const prevPaid = existingTransactions
        .filter((t: any) => t.type === 'payment')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
      const prevRefunded = existingTransactions
        .filter((t: any) => t.type === 'refund')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
      const newTotalPaid = prevPaid + paidEur - prevRefunded
      const confirmedPrice = booking.confirmedPrice || booking.totalPrice || totalEur
      const newBalance = confirmedPrice - newTotalPaid

      const newTransaction = {
        type: 'payment',
        amount: paidEur,
        description: prevPaid > 0 ? 'Additional payment' : 'Initial payment',
        stripeId: String(session.payment_intent ?? ''),
        recordedAt: new Date().toISOString(),
      }

      await payload.update({
        collection: 'booking-requests',
        id: bookingId,
        data: {
          paymentStatus: newBalance <= 0.01 ? 'fully_paid' : 'deposit_paid',
          stripePaymentIntentId: String(session.payment_intent ?? ''),
          stripeChargedCents: session.amount_total ?? 0,
          stripeChargeCurrency: session.currency?.toUpperCase() ?? 'EUR',
          cashBalance: Math.max(0, newBalance),
          totalPaid: newTotalPaid,
          balanceDue: newBalance,
          paidAt: new Date().toISOString(),
          transactions: [...existingTransactions, newTransaction],
        },
      })

      // Log payment success audit event
      logBookingEvent({
        bookingId: bookingId,
        eventType: 'payment_success',
        actor: { type: 'stripe', id: event.id },
        description: `Payment received: ${session.amount_total} ${session.currency}`,
        metadata: { stripeEventId: event.id, sessionId: session.id, amountTotal: session.amount_total, currency: session.currency },
      }, payload)

      // Send payment confirmation email to customer
      try {
        const locale = (booking.customerLanguage || 'en') as 'en' | 'ru'
        const tourObj = booking.tour && typeof booking.tour === 'object' ? (booking.tour as { title?: string }) : null
        const tourTitle = tourObj?.title || 'Tour'
        const tpl = await getEmailTemplates(locale)
        const vars = { name: booking.customerName, tour: tourTitle, date: formatEmailDate(booking.preferredDate, locale), ref: booking.requestRef, time: booking.preferredTime }

        // Resolve meeting point
        let meetingPoint: string | undefined
        if (typeof booking.tour === 'object' && booking.tour) {
          meetingPoint = (booking.tour as any).meetingPoint?.address
        }

        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
        const offerUrl = booking.offerToken ? `${baseUrl}/${locale}/booking/${booking.offerToken}` : undefined

        const paymentEmailProps = {
          customerName: booking.customerName,
          tourName: tourTitle,
          preferredDate: booking.confirmedDate || booking.preferredDate,
          preferredTime: booking.confirmedTime || booking.preferredTime,
          meetingPoint,
          requestRef: booking.requestRef,
          paidAmount: paidEur,
          currency: booking.currency || 'EUR',
          offerUrl,
          locale,
          cmsHeading: tpl.paymentHeading ? resolveTemplate(tpl.paymentHeading, vars) : undefined,
          cmsBody: tpl.paymentBody ? resolveTemplate(tpl.paymentBody, vars) : undefined,
          cmsNote: tpl.paymentNote ? resolveTemplate(tpl.paymentNote, vars) : undefined,
          cmsFooter: tpl.footer || undefined,
        }

        await sendEmail({
          to: booking.customerEmail,
          subject: resolveTemplate(tpl.paymentSubject || (locale === 'ru' ? 'Оплата получена — {tour}' : 'Payment received — {tour}'), vars),
          react: PaymentReceivedEmail(paymentEmailProps),
        })

        // Admin copy
        const adminEmail = await getNotificationEmail()
        await sendEmail({
          to: adminEmail,
          subject: `[Payment] ${booking.requestRef} — ${tourTitle}`,
          react: PaymentReceivedEmail(paymentEmailProps),
          replyTo: booking.customerEmail,
        })

        logBookingEvent({
          bookingId,
          eventType: 'email_sent',
          actor: { type: 'system' },
          description: `Payment confirmation email sent to ${booking.customerEmail}`,
          metadata: { template: 'payment-received', to: booking.customerEmail },
        }, payload)
      } catch (emailErr) {
        console.error('[stripe/webhook] Payment email failed:', emailErr)
        logBookingEvent({
          bookingId,
          eventType: 'email_failed',
          actor: { type: 'system' },
          description: `Failed to send payment email to ${booking.customerEmail}`,
          metadata: { error: String(emailErr) },
        }, payload)
      }

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
        depositPaid: paidEur,
        cashBalance: totalEur - paidEur,
        isFullyPaid,
        chatwootConversationId: booking.chatwootConversationId ?? undefined,
        mauticContactId: booking.mauticContactId ?? undefined,
        paidAt: new Date().toISOString(),
      }).catch(console.error)
    } catch (err) {
      console.error('[stripe/webhook] DB update failed:', err)
      // Return 200 anyway — Stripe should not retry for our DB errors
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const { bookingId } = session.metadata ?? {}
    if (bookingId) {
      try {
        const payload = await getPayload({ config: configPromise })
        // Clear expired payment link
        await payload.update({
          collection: 'booking-requests',
          id: bookingId,
          data: { stripePaymentLink: '' },
        })
        logBookingEvent({
          bookingId,
          eventType: 'checkout_expired',
          actor: { type: 'stripe', id: event.id },
          description: `Checkout session expired without payment`,
          metadata: { stripeEventId: event.id, sessionId: session.id },
        })
      } catch (err) {
        console.error('[stripe/webhook] Expired session handling failed:', err)
      }
    }
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : (charge.payment_intent as any)?.id
    // Find booking by payment intent ID or charge metadata
    let bookingId = charge.metadata?.bookingId
    try {
      const payload = await getPayload({ config: configPromise })

      if (!bookingId && paymentIntentId) {
        // Look up booking by stripePaymentIntentId
        const result = await payload.find({
          collection: 'booking-requests',
          where: { stripePaymentIntentId: { equals: paymentIntentId } },
          limit: 1,
          depth: 1,
        })
        if (result.docs[0]) {
          bookingId = String(result.docs[0].id)
        }
      }

      if (!bookingId) return NextResponse.json({ received: true })

      const booking = await payload.findByID({
        collection: 'booking-requests',
        id: bookingId,
        depth: 1,
      })
      if (!booking) return NextResponse.json({ received: true })

        const refundAmountCents = charge.amount_refunded ?? 0
        const refundCurrency = (charge.currency || 'eur').toUpperCase()
        const refundAmount = refundAmountCents / 100
        const isFullRefund = charge.refunded

        // Calculate running totals after refund
        const existingTxns = (booking as any).transactions || []
        const prevPaidTotal = existingTxns
          .filter((t: any) => t.type === 'payment')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
        const prevRefundTotal = existingTxns
          .filter((t: any) => t.type === 'refund')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
        const newTotalPaid = prevPaidTotal - prevRefundTotal - refundAmount
        const confirmedPrice = booking.confirmedPrice || booking.totalPrice || 0
        const newBalance = confirmedPrice - newTotalPaid

        const refundTxn = {
          type: 'refund',
          amount: refundAmount,
          description: isFullRefund ? 'Full refund' : 'Partial refund',
          stripeId: charge.id,
          recordedAt: new Date().toISOString(),
        }

        await payload.update({
          collection: 'booking-requests',
          id: bookingId,
          data: {
            paymentStatus: isFullRefund ? 'refunded' : 'refund_pending',
            refundedAt: new Date().toISOString(),
            totalPaid: Math.max(0, newTotalPaid),
            balanceDue: newBalance,
            transactions: [...existingTxns, refundTxn],
          },
        })

        logBookingEvent({
          bookingId,
          eventType: 'payment_success',
          actor: { type: 'stripe', id: event.id },
          description: `Refund processed: ${refundAmount} ${refundCurrency}${isFullRefund ? ' (full)' : ' (partial)'}`,
          metadata: { stripeEventId: event.id, chargeId: charge.id, refundAmount, refundCurrency, isFullRefund },
        }, payload)

        // Send refund email
        try {
          const locale = (booking.customerLanguage || 'en') as 'en' | 'ru'
          const tourObj = booking.tour && typeof booking.tour === 'object' ? (booking.tour as { title?: string }) : null
          const tourTitle = tourObj?.title || booking.tourName || 'Tour'
          const tpl = await getEmailTemplates(locale)
          const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
          const offerUrl = booking.offerToken ? `${baseUrl}/${locale}/booking/${booking.offerToken}` : undefined

          const refundEmailProps = {
            customerName: booking.customerName,
            tourName: tourTitle,
            preferredDate: booking.confirmedDate || booking.preferredDate,
            requestRef: booking.requestRef,
            refundAmount,
            currency: booking.currency || refundCurrency,
            offerUrl,
            locale,
            cmsFooter: tpl.footer || undefined,
          }

          await sendEmail({
            to: booking.customerEmail,
            subject: locale === 'ru'
              ? `Возврат обработан — ${booking.requestRef}`
              : `Refund processed — ${booking.requestRef}`,
            react: RefundProcessedEmail(refundEmailProps),
          })

          const adminEmail = await getNotificationEmail()
          await sendEmail({
            to: adminEmail,
            subject: `[Refund] ${booking.requestRef} — ${refundAmount} ${refundCurrency}`,
            react: RefundProcessedEmail(refundEmailProps),
            replyTo: booking.customerEmail,
          })

          logBookingEvent({
            bookingId,
            eventType: 'email_sent',
            actor: { type: 'system' },
            description: `Refund email sent to ${booking.customerEmail}`,
            metadata: { template: 'refund-processed', refundAmount },
          }, payload)
        } catch (emailErr) {
          console.error('[stripe/webhook] Refund email failed:', emailErr)
          logBookingEvent({
            bookingId,
            eventType: 'email_failed',
            actor: { type: 'system' },
            description: `Failed to send refund email`,
            metadata: { error: String(emailErr) },
          }, payload)
        }
      } catch (err) {
        console.error('[stripe/webhook] Refund handling failed:', err)
      }
  } else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    const bookingId = pi.metadata?.bookingId
    if (bookingId) {
      const errorMsg = pi.last_payment_error?.message || 'Unknown error'
      logBookingEvent({
        bookingId,
        eventType: 'payment_failed',
        actor: { type: 'stripe', id: event.id },
        description: `Payment failed: ${errorMsg}`,
        metadata: {
          stripeEventId: event.id,
          paymentIntentId: pi.id,
          errorCode: pi.last_payment_error?.code,
          errorMessage: errorMsg,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
