import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'
import { generateRequestRef } from '@/lib/booking'
import { sendEmail } from '@/lib/email'
import { getEmailTemplates, resolveTemplate } from '@/lib/cms-data'
import { RequestConfirmedEmail } from '@/emails/request-confirmed'
import { RequestDeclinedEmail } from '@/emails/request-declined'
import { PaymentReceivedEmail } from '@/emails/payment-received'
import { logBookingEvent, computeFieldDiffs } from '@/lib/audit'

export const beforeChangeHook: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation === 'create' && !data.requestRef) {
    data.requestRef = await generateRequestRef()
  }

  // Auto-generate offer token on create
  if (operation === 'create' && !data.offerToken) {
    const { randomBytes } = await import('crypto')
    data.offerToken = randomBytes(32).toString('hex')
  }

  // Auto-populate offer fields from booking request when status changes to 'confirmed'
  if (operation === 'update' && data.status === 'confirmed') {
    const doc = originalDoc || {}
    if (!data.confirmedDate) data.confirmedDate = data.preferredDate || doc.preferredDate
    if (!data.confirmedTime) data.confirmedTime = data.preferredTime || doc.preferredTime
    if (!data.confirmedPrice) data.confirmedPrice = data.totalPrice || doc.totalPrice
    if (!data.confirmedGuests) data.confirmedGuests = data.guests || doc.guests
  }

  // Auto-generate offer token when status changes to 'confirmed'
  if (operation === 'update' && data.status === 'confirmed' && !data.offerToken) {
    const { randomBytes } = await import('crypto')
    data.offerToken = randomBytes(32).toString('hex')
  }

  // Sync deposit and cash balance when customDepositAmount changes
  if (operation === 'update' && data.customDepositAmount != null) {
    const doc = originalDoc || {}
    const confirmedPrice = data.confirmedPrice || doc.confirmedPrice || data.totalPrice || doc.totalPrice || 0
    data.depositAmountEur = data.customDepositAmount
    data.cashBalanceEur = confirmedPrice - data.customDepositAmount
  }

  return data
}

export const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Log booking_created for new bookings
  if (operation === 'create') {
    logBookingEvent({
      bookingId: doc.id,
      eventType: 'booking_created',
      actor: { type: 'system' },
      description: `Booking ${doc.requestRef} created`,
      metadata: { requestRef: doc.requestRef, tour: doc.tour, customerEmail: doc.customerEmail },
    }, req.payload)
  }

  // Log field changes for every update
  if (operation === 'update' && previousDoc) {
    const diffs = computeFieldDiffs(previousDoc as any, doc as any)
    if (diffs.changed.length > 0) {
      const actor = req.user
        ? { type: 'admin' as const, id: String(req.user.id), name: (req.user as any).email }
        : { type: 'system' as const }
      logBookingEvent({
        bookingId: doc.id,
        eventType: diffs.changed.includes('status') ? 'status_change' : 'field_update',
        actor,
        description: diffs.changed.includes('status')
          ? `Status: ${previousDoc.status} → ${doc.status}`
          : `Updated: ${diffs.changed.join(', ')}`,
        previousValue: diffs.previous,
        newValue: diffs.updated,
        metadata: { changedFields: diffs.changed },
      }, req.payload)
    }
  }

  if (operation !== 'update' || !previousDoc) return doc

  const oldStatus = previousDoc.status
  const newStatus = doc.status

  if (oldStatus === newStatus) return doc

  const locale = (doc.customerLanguage || 'en') as 'en' | 'ru'

  // Resolve tour title
  let tourName = 'Tour'
  try {
    if (typeof doc.tour === 'number') {
      const tour = await req.payload.findByID({
        collection: 'tours',
        id: doc.tour,
        locale,
      })
      tourName = tour.title || tourName
    } else if (typeof doc.tour === 'object' && doc.tour?.title) {
      tourName = doc.tour.title
    }
  } catch {
    // Use default
  }

  // Resolve meeting point for payment-received email
  let meetingPoint: string | undefined
  try {
    if (typeof doc.tour === 'number') {
      const tour = await req.payload.findByID({
        collection: 'tours',
        id: doc.tour,
        locale,
      })
      meetingPoint = (tour as any).meetingPoint?.address
    }
  } catch {
    // Skip
  }

  // Fetch CMS email templates
  const tpl = await getEmailTemplates(locale)
  const vars = { name: doc.customerName, tour: tourName, date: doc.preferredDate, ref: doc.requestRef, time: doc.preferredTime }

  // Status transitions → send emails
  if (oldStatus === 'new' && newStatus === 'confirmed') {
    try {
      await sendEmail({
        to: doc.customerEmail,
        subject: resolveTemplate(tpl.confirmedSubject || (locale === 'ru' ? 'Подтверждено — {tour}' : 'Confirmed — {tour}'), vars),
        react: RequestConfirmedEmail({
          customerName: doc.customerName,
          tourName,
          preferredDate: doc.preferredDate,
          preferredTime: doc.preferredTime,
          requestRef: doc.requestRef,
          paymentLink: doc.stripePaymentLink || undefined,
          locale,
          cmsHeading: tpl.confirmedHeading ? resolveTemplate(tpl.confirmedHeading, vars) : undefined,
          cmsBody: tpl.confirmedBody ? resolveTemplate(tpl.confirmedBody, vars) : undefined,
          cmsNote: tpl.confirmedNote ? resolveTemplate(tpl.confirmedNote, vars) : undefined,
          cmsFooter: tpl.footer || undefined,
        }),
      })
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_sent',
        actor: { type: 'system' },
        description: `Confirmation email sent to ${doc.customerEmail}`,
        metadata: { template: 'request-confirmed', to: doc.customerEmail },
      }, req.payload)
    } catch (err) {
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_failed',
        actor: { type: 'system' },
        description: `Failed to send confirmation email to ${doc.customerEmail}`,
        metadata: { template: 'request-confirmed', to: doc.customerEmail, error: String(err) },
      }, req.payload)
    }
  }

  if (oldStatus === 'new' && newStatus === 'declined') {
    try {
      await sendEmail({
        to: doc.customerEmail,
        subject: resolveTemplate(tpl.declinedSubject || (locale === 'ru' ? 'Обновление запроса — {ref}' : 'Request update — {ref}'), vars),
        react: RequestDeclinedEmail({
          customerName: doc.customerName,
          tourName,
          preferredDate: doc.preferredDate,
          requestRef: doc.requestRef,
          locale,
          cmsBody: tpl.declinedBody ? resolveTemplate(tpl.declinedBody, vars) : undefined,
          cmsNote: tpl.declinedNote ? resolveTemplate(tpl.declinedNote, vars) : undefined,
          cmsFooter: tpl.footer || undefined,
        }),
      })
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_sent',
        actor: { type: 'system' },
        description: `Declined email sent to ${doc.customerEmail}`,
        metadata: { template: 'request-declined', to: doc.customerEmail },
      }, req.payload)
    } catch (err) {
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_failed',
        actor: { type: 'system' },
        description: `Failed to send declined email to ${doc.customerEmail}`,
        metadata: { template: 'request-declined', to: doc.customerEmail, error: String(err) },
      }, req.payload)
    }
  }

  if (
    (oldStatus === 'payment-sent' || oldStatus === 'confirmed') &&
    newStatus === 'paid'
  ) {
    try {
      await sendEmail({
        to: doc.customerEmail,
        subject: resolveTemplate(tpl.paymentSubject || (locale === 'ru' ? 'Оплата получена — {tour}' : 'Payment received — {tour}'), vars),
        react: PaymentReceivedEmail({
          customerName: doc.customerName,
          tourName,
          preferredDate: doc.preferredDate,
          preferredTime: doc.preferredTime,
          meetingPoint,
          requestRef: doc.requestRef,
          locale,
          cmsHeading: tpl.paymentHeading ? resolveTemplate(tpl.paymentHeading, vars) : undefined,
          cmsBody: tpl.paymentBody ? resolveTemplate(tpl.paymentBody, vars) : undefined,
          cmsNote: tpl.paymentNote ? resolveTemplate(tpl.paymentNote, vars) : undefined,
          cmsFooter: tpl.footer || undefined,
        }),
      })
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_sent',
        actor: { type: 'system' },
        description: `Payment received email sent to ${doc.customerEmail}`,
        metadata: { template: 'payment-received', to: doc.customerEmail },
      }, req.payload)
    } catch (err) {
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_failed',
        actor: { type: 'system' },
        description: `Failed to send payment received email to ${doc.customerEmail}`,
        metadata: { template: 'payment-received', to: doc.customerEmail, error: String(err) },
      }, req.payload)
    }
  }

  return doc
}
