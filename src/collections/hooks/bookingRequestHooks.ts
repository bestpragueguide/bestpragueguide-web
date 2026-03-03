import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'
import { generateRequestRef } from '@/lib/booking'
import { sendEmail } from '@/lib/email'
import { RequestConfirmedEmail } from '@/emails/request-confirmed'
import { RequestDeclinedEmail } from '@/emails/request-declined'
import { PaymentReceivedEmail } from '@/emails/payment-received'

export const beforeChangeHook: CollectionBeforeChangeHook = async ({
  data,
  operation,
}) => {
  if (operation === 'create' && !data.requestRef) {
    data.requestRef = await generateRequestRef()
  }
  return data
}

export const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
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

  // Status transitions → send emails
  if (oldStatus === 'new' && newStatus === 'confirmed') {
    await sendEmail({
      to: doc.customerEmail,
      subject:
        locale === 'ru'
          ? `Подтверждено — ${tourName}`
          : `Confirmed — ${tourName}`,
      react: RequestConfirmedEmail({
        customerName: doc.customerName,
        tourName,
        preferredDate: doc.preferredDate,
        preferredTime: doc.preferredTime,
        requestRef: doc.requestRef,
        paymentLink: doc.stripePaymentLink || undefined,
        locale,
      }),
    })
  }

  if (oldStatus === 'new' && newStatus === 'declined') {
    await sendEmail({
      to: doc.customerEmail,
      subject:
        locale === 'ru'
          ? `Обновление запроса — ${doc.requestRef}`
          : `Request update — ${doc.requestRef}`,
      react: RequestDeclinedEmail({
        customerName: doc.customerName,
        tourName,
        preferredDate: doc.preferredDate,
        requestRef: doc.requestRef,
        locale,
      }),
    })
  }

  if (
    (oldStatus === 'payment-sent' || oldStatus === 'confirmed') &&
    newStatus === 'paid'
  ) {
    await sendEmail({
      to: doc.customerEmail,
      subject:
        locale === 'ru'
          ? `Оплата получена — ${tourName}`
          : `Payment received — ${tourName}`,
      react: PaymentReceivedEmail({
        customerName: doc.customerName,
        tourName,
        preferredDate: doc.preferredDate,
        preferredTime: doc.preferredTime,
        meetingPoint,
        requestRef: doc.requestRef,
        locale,
      }),
    })
  }

  return doc
}
