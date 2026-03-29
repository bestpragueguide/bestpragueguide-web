import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'
import { generateRequestRef } from '@/lib/booking'
import { logBookingEvent, computeFieldDiffs } from '@/lib/audit'
import { sendEmail } from '@/lib/email'
import { getEmailTemplates, resolveTemplate } from '@/lib/cms-data'
import { BookingOfferEmail } from '@/emails/booking-offer'
import { formatEmailDate } from '@/emails/utils'

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
    data.depositAmount = data.customDepositAmount
    data.cashBalance = confirmedPrice - data.customDepositAmount
  }

  // Recalculate balanceDue and paymentStatus when confirmedPrice changes
  if (operation === 'update') {
    const doc = originalDoc || {}
    const newPrice = data.confirmedPrice || doc.confirmedPrice || data.totalPrice || doc.totalPrice || 0
    const totalPaid = data.totalPaid ?? doc.totalPaid ?? 0
    const newBalance = newPrice - totalPaid
    data.balanceDue = newBalance

    // Update paymentStatus when balance changes
    if (totalPaid > 0) {
      if (totalPaid <= 0.01) {
        data.paymentStatus = 'refunded'
      } else if (newBalance <= 0.01) {
        data.paymentStatus = 'fully_paid'
      } else {
        data.paymentStatus = 'deposit_paid'
      }
    }
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

  // No auto-send emails on admin status change.
  // Admin uses "Send Offer" / "Send Email" button manually for declined/cancelled/confirmed.

  // Auto-send update email when paymentStatus changes from Stripe webhook only (not admin)
  const oldPaymentStatus = previousDoc.paymentStatus
  const newPaymentStatus = doc.paymentStatus
  if (!req.user && oldPaymentStatus !== newPaymentStatus && newPaymentStatus &&
      (newPaymentStatus === 'deposit_paid' || newPaymentStatus === 'fully_paid')) {
    try {
      const locale = (doc.customerLanguage || 'en') as 'en' | 'ru'
      let tourName = doc.tourName || 'Tour'
      if (!tourName || tourName === 'Tour') {
        try {
          const tourId = typeof doc.tour === 'object' ? (doc.tour as any).id : doc.tour
          if (tourId) {
            const tour = await req.payload.findByID({ collection: 'tours', id: tourId, locale, depth: 0 })
            tourName = (tour.title as string) || tourName
          }
        } catch {}
      }

      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
      const offerUrl = doc.offerToken ? `${baseUrl}/${locale}/booking/${doc.offerToken}` : ''
      const confirmedDate = doc.confirmedDate || doc.preferredDate
      const confirmedTime = doc.confirmedTime || doc.preferredTime || ''
      const confirmedPrice = doc.confirmedPrice || doc.totalPrice || 0
      const tpl = await getEmailTemplates(locale)
      const vars: Record<string, string> = {
        name: doc.customerName, tour: tourName,
        date: formatEmailDate(confirmedDate, locale),
        time: confirmedTime, ref: doc.requestRef,
      }

      const subject = resolveTemplate(
        locale === 'ru' ? 'Обновление бронирования — {tour}' : 'Booking update — {tour}', vars
      )

      await sendEmail({
        to: doc.customerEmail,
        subject,
        react: BookingOfferEmail({
          customerName: doc.customerName,
          tourName,
          confirmedDate,
          confirmedTime,
          guests: doc.confirmedGuests || doc.guests || 1,
          confirmedPrice,
          depositAmount: doc.depositAmount || doc.customDepositAmount,
          cashBalance: doc.cashBalance,
          currency: doc.currency || 'EUR',
          customerEmail: doc.customerEmail,
          customerPhone: doc.customerPhone || '',
          paymentMethod: doc.paymentMethod || 'cash_only',
          paymentStatus: newPaymentStatus,
          requestRef: doc.requestRef,
          offerUrl,
          locale,
          cmsHeaderTitle: tpl.headerTitle || undefined,
          cmsGreeting: tpl.greeting ? resolveTemplate(tpl.greeting, vars) : undefined,
          cmsHeading: (tpl as any).offerHeading ? resolveTemplate((tpl as any).offerHeading, vars) : undefined,
          cmsBody: (tpl as any).offerBody ? resolveTemplate((tpl as any).offerBody, vars) : undefined,
          cmsNote: (tpl as any).offerNote ? resolveTemplate((tpl as any).offerNote, vars) : undefined,
          cmsFooter: tpl.footer || undefined,
          summaryLabels: tpl.summaryLabels,
          summaryPaymentLabels: tpl.summaryPaymentLabels,
          summaryLanguageLabels: tpl.summaryLanguageLabels,
        }),
      })

      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_sent',
        actor: { type: 'system' },
        description: `Payment status update email sent (${newPaymentStatus})`,
        metadata: { template: 'booking-offer', paymentStatus: newPaymentStatus, to: doc.customerEmail },
      }, req.payload)
    } catch (err) {
      logBookingEvent({
        bookingId: doc.id,
        eventType: 'email_failed',
        actor: { type: 'system' },
        description: `Failed to send payment status update email`,
        metadata: { paymentStatus: newPaymentStatus, error: String(err) },
      }, req.payload)
    }
  }

  return doc
}
