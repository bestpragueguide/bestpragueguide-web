import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'
import { generateRequestRef } from '@/lib/booking'
import { sendEmail } from '@/lib/email'
import { getEmailTemplates, resolveTemplate } from '@/lib/cms-data'
import { RequestDeclinedEmail } from '@/emails/request-declined'
import { BookingCancelledEmail } from '@/emails/booking-cancelled'
import { PaymentReceivedEmail } from '@/emails/payment-received'
import { logBookingEvent, computeFieldDiffs } from '@/lib/audit'

export const beforeChangeHook: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && !data.requestRef) {
    data.requestRef = await generateRequestRef()
  }

  // Auto-generate offer token and set defaults on create
  if (operation === 'create') {
    if (!data.offerToken) {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
      data.offerToken = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    }
    if (!data.guideName) data.guideName = 'Uliana'
    if (!data.guidePhone) data.guidePhone = '+420 776 306 858'
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

  // Auto-populate tourName in customer's language
  const tourId = data.tour || originalDoc?.tour
  const locale = (data.customerLanguage || originalDoc?.customerLanguage || 'en') as 'en' | 'ru'
  if (tourId && (!data.tourName || operation === 'create')) {
    try {
      const id = typeof tourId === 'object' ? (tourId as any).id : tourId
      const tour = await req.payload.findByID({
        collection: 'tours',
        id,
        locale,
        depth: 0,
      })
      if (tour?.title) data.tourName = tour.title as string
    } catch { /* keep existing tourName */ }
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
  // NOTE: confirmed status does NOT auto-send email. Admin uses "Send Offer" button manually.

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

  if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
    try {
      await sendEmail({
        to: doc.customerEmail,
        subject: resolveTemplate((tpl as any).cancelledSubject || (locale === 'ru' ? 'Бронирование отменено — {ref}' : 'Booking cancelled — {ref}'), vars),
        react: BookingCancelledEmail({
          customerName: doc.customerName,
          tourName,
          preferredDate: doc.confirmedDate || doc.preferredDate,
          requestRef: doc.requestRef,
          locale,
          cmsHeaderTitle: tpl.headerTitle || undefined,
          cmsGreeting: tpl.greeting ? resolveTemplate(tpl.greeting, vars) : undefined,
          cmsBody: (tpl as any).cancelledBody ? resolveTemplate((tpl as any).cancelledBody, vars) : undefined,
          cmsNote: (tpl as any).cancelledNote ? resolveTemplate((tpl as any).cancelledNote, vars) : undefined,
          cmsFooter: tpl.footer || undefined,
        }),
      })
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_sent',
        actor: { type: 'system' },
        description: `Cancelled email sent to ${doc.customerEmail}`,
        metadata: { template: 'booking-cancelled', to: doc.customerEmail },
      }, req.payload)
    } catch (err) {
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_failed',
        actor: { type: 'system' },
        description: `Failed to send cancelled email to ${doc.customerEmail}`,
        metadata: { template: 'booking-cancelled', to: doc.customerEmail, error: String(err) },
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
