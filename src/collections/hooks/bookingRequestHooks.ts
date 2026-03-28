import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'
import { generateRequestRef } from '@/lib/booking'
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

  // No auto-send emails on admin status change.
  // Admin uses "Send Offer" / "Send Email" button manually for declined/cancelled/confirmed.
  // Stripe webhook handles payment confirmation emails automatically.

  return doc
}
