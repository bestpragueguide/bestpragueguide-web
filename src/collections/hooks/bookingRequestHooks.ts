import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'
import { generateRequestRef } from '@/lib/booking'
import { sendEmail } from '@/lib/email'
import { getEmailTemplates, resolveTemplate } from '@/lib/cms-data'
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

  // Auto-generate offer token when status changes to 'confirmed'
  if (operation === 'update' && data.status === 'confirmed' && !data.offerToken) {
    const { randomBytes } = await import('crypto')
    data.offerToken = randomBytes(32).toString('hex')
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

  // Fetch CMS email templates
  const tpl = await getEmailTemplates(locale)
  const vars = { name: doc.customerName, tour: tourName, date: doc.preferredDate, ref: doc.requestRef, time: doc.preferredTime }

  // Status transitions → send emails
  if (oldStatus === 'new' && newStatus === 'confirmed') {
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
  }

  if (oldStatus === 'new' && newStatus === 'declined') {
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
  }

  if (
    (oldStatus === 'payment-sent' || oldStatus === 'confirmed') &&
    newStatus === 'paid'
  ) {
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
  }

  return doc
}
