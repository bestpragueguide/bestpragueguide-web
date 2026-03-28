import React from 'react'
import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sendEmail, sendAdminEmail } from '@/lib/email'
import { getEmailTemplates, resolveTemplate, getNotificationEmail } from '@/lib/cms-data'
import { BookingOfferEmail } from '@/emails/booking-offer'
import { RequestDeclinedEmail } from '@/emails/request-declined'
import { BookingCancelledEmail } from '@/emails/booking-cancelled'
import { n8n } from '@/lib/n8n'
import { logBookingEvent } from '@/lib/audit'
import { formatEmailDate } from '@/emails/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  // Require Payload admin auth
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookingId } = (await req.json()) as { bookingId: string }
  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId required' }, { status: 400 })
  }

  const booking = await payload.findByID({
    collection: 'booking-requests',
    id: bookingId,
    depth: 2,
  })

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (!(booking as any).offerToken) {
    return NextResponse.json(
      { error: 'Booking must be confirmed first (no offer token)' },
      { status: 400 }
    )
  }

  const locale = (booking.customerLanguage || 'en') as 'en' | 'ru'
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://bestpragueguide.com'
  const offerToken = (booking as any).offerToken as string
  const offerUrl = `${baseUrl}/${locale}/booking/${offerToken}`

  // Resolve tour title
  let tourTitle = 'Tour'
  let tourSlug = ''
  if (typeof booking.tour === 'object' && booking.tour !== null) {
    tourTitle = String((booking.tour as { title?: unknown }).title ?? 'Tour')
    tourSlug = String((booking.tour as { slug?: unknown }).slug ?? '')
  } else if (typeof booking.tour === 'number') {
    try {
      const tour = await payload.findByID({
        collection: 'tours',
        id: booking.tour,
        locale,
      })
      tourTitle = tour.title || tourTitle
      tourSlug = tour.slug || tourSlug
    } catch {
      // Use defaults
    }
  }

  // Fetch CMS email templates
  const tpl = await getEmailTemplates(locale)

  // Determine pricing values
  const confirmedPrice = (booking as any).confirmedPrice ?? booking.totalPrice ?? 0
  const paymentMethod = (booking as any).paymentMethod || 'stripe_deposit'
  const confirmedDate = (booking as any).confirmedDate || booking.preferredDate
  const confirmedTime = (booking as any).confirmedTime || booking.preferredTime
  const confirmedGuests = (booking as any).confirmedGuests || booking.guests

  // Calculate deposit if applicable
  let depositAmount: number | undefined
  let cashBalance: number | undefined
  if (paymentMethod === 'stripe_deposit') {
    const customDeposit = (booking as any).customDepositAmount
    if (customDeposit && customDeposit > 0) {
      depositAmount = customDeposit
    } else {
      try {
        const config = await payload.findGlobal({ slug: 'payment-config' })
        const depositPercent = config.depositPercent ?? 30
        depositAmount = Math.round(confirmedPrice * depositPercent) / 100
      } catch {
        depositAmount = Math.round(confirmedPrice * 30) / 100
      }
    }
    cashBalance = confirmedPrice - (depositAmount ?? 0)
  } else if (paymentMethod === 'stripe_full') {
    depositAmount = confirmedPrice
    cashBalance = 0
  }

  // Template variables
  const vars: Record<string, string> = {
    name: booking.customerName,
    tour: tourTitle,
    date: formatEmailDate(confirmedDate, locale),
    time: confirmedTime,
    guests: String(confirmedGuests),
    price: `${confirmedPrice}`,
    deposit: depositAmount != null ? `${depositAmount}` : '',
    ref: booking.requestRef,
  }

  // Determine email type based on current booking status
  const bookingStatus = booking.status || 'new'
  const isOffer = bookingStatus === 'confirmed' || bookingStatus === 'offer-sent'
  const isFirstOffer = isOffer && !booking.offerSentAt

  // Build subject and email content based on status
  let subject: string
  let emailReact: React.ReactElement

  const offerEmailProps = {
    customerName: booking.customerName,
    tourName: tourTitle,
    confirmedDate,
    confirmedTime,
    guests: confirmedGuests,
    confirmedPrice,
    depositAmount,
    cashBalance,
    currency: booking.currency || 'EUR',
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone || '',
    paymentMethod: booking.paymentMethod || 'cash_only',
    paymentStatus: booking.paymentStatus || undefined,
    requestRef: booking.requestRef,
    offerUrl,
    locale,
    cmsHeaderTitle: tpl.headerTitle || undefined,
    cmsGreeting: tpl.greeting ? resolveTemplate(tpl.greeting, vars) : undefined,
    cmsHeading: undefined as string | undefined,
    cmsBody: undefined as string | undefined,
    cmsCtaLabel: (tpl as any).offerCtaLabel || undefined,
    cmsNote: undefined as string | undefined,
    cmsFooter: tpl.footer || undefined,
    summaryLabels: tpl.summaryLabels,
    summaryPaymentLabels: tpl.summaryPaymentLabels,
    summaryLanguageLabels: tpl.summaryLanguageLabels,
  }

  if (bookingStatus === 'declined') {
    subject = resolveTemplate(tpl.declinedSubject || (locale === 'ru' ? 'Обновление запроса — {ref}' : 'Request update — {ref}'), vars)
    emailReact = RequestDeclinedEmail({
      customerName: booking.customerName,
      tourName: tourTitle,
      preferredDate: formatEmailDate(booking.preferredDate, locale),
      requestRef: booking.requestRef,
      locale,
      cmsBody: tpl.declinedBody ? resolveTemplate(tpl.declinedBody, vars) : undefined,
      cmsNote: tpl.declinedNote ? resolveTemplate(tpl.declinedNote, vars) : undefined,
      cmsFooter: tpl.footer || undefined,
    })
  } else if (bookingStatus === 'cancelled') {
    subject = resolveTemplate((tpl as any).cancelledSubject || (locale === 'ru' ? 'Бронирование отменено — {ref}' : 'Booking cancelled — {ref}'), vars)
    emailReact = BookingCancelledEmail({
      customerName: booking.customerName,
      tourName: tourTitle,
      preferredDate: formatEmailDate(booking.confirmedDate || booking.preferredDate, locale),
      requestRef: booking.requestRef,
      locale,
      cmsHeaderTitle: tpl.headerTitle || undefined,
      cmsGreeting: tpl.greeting ? resolveTemplate(tpl.greeting, vars) : undefined,
      cmsBody: (tpl as any).cancelledBody ? resolveTemplate((tpl as any).cancelledBody, vars) : undefined,
      cmsNote: (tpl as any).cancelledNote ? resolveTemplate((tpl as any).cancelledNote, vars) : undefined,
      cmsFooter: tpl.footer || undefined,
    })
  } else if (isFirstOffer) {
    subject = resolveTemplate((tpl as any).offerSubject || (locale === 'ru' ? 'Ваше бронирование подтверждено — {tour}' : 'Your booking is confirmed — {tour}'), vars)
    offerEmailProps.cmsHeading = (tpl as any).offerHeading ? resolveTemplate((tpl as any).offerHeading, vars) : undefined
    offerEmailProps.cmsBody = (tpl as any).offerBody ? resolveTemplate((tpl as any).offerBody, vars) : undefined
    offerEmailProps.cmsNote = (tpl as any).offerNote ? resolveTemplate((tpl as any).offerNote, vars) : undefined
    emailReact = BookingOfferEmail(offerEmailProps)
  } else {
    // Update for confirmed/offer-sent/paid/completed — use offer template with update subject
    subject = resolveTemplate(locale === 'ru' ? 'Обновление бронирования — {tour}' : 'Booking update — {tour}', vars)
    offerEmailProps.cmsHeading = (tpl as any).offerHeading ? resolveTemplate((tpl as any).offerHeading, vars) : undefined
    offerEmailProps.cmsBody = (tpl as any).offerBody ? resolveTemplate((tpl as any).offerBody, vars) : undefined
    offerEmailProps.cmsNote = (tpl as any).offerNote ? resolveTemplate((tpl as any).offerNote, vars) : undefined
    emailReact = BookingOfferEmail(offerEmailProps)
  }

  // Send customer email
  await sendEmail({
    to: booking.customerEmail,
    subject,
    react: emailReact,
  })

  // Send admin copy
  const adminEmail = await getNotificationEmail()
  await sendAdminEmail({
    to: adminEmail,
    subject: `[Admin Copy] ${subject}`,
    react: emailReact,
    replyTo: booking.customerEmail,
  })

  const templateName = bookingStatus === 'declined' ? 'request-declined'
    : bookingStatus === 'cancelled' ? 'booking-cancelled'
    : 'booking-offer'

  // Log audit event
  logBookingEvent({
    bookingId: bookingId,
    eventType: isFirstOffer ? 'offer_sent' : 'email_sent',
    actor: { type: 'admin', id: String(user.id), name: (user as any).email },
    description: `${isFirstOffer ? 'Offer' : 'Update'} (${bookingStatus}) sent to ${booking.customerEmail}`,
    metadata: { offerUrl, template: templateName, to: booking.customerEmail, status: bookingStatus },
  }, payload)

  // Update booking — only change status for confirmed offers
  const now = new Date().toISOString()
  const updateData: Record<string, unknown> = {}
  if (isFirstOffer) {
    updateData.offerSentAt = now
    if (paymentMethod === 'stripe_deposit' || paymentMethod === 'stripe_full') {
      updateData.status = 'offer-sent'
    }
  } else {
    updateData.lastUpdateSentAt = now
  }
  await payload.update({
    collection: 'booking-requests',
    id: bookingId,
    data: updateData,
  })

  // Fire n8n webhook
  await n8n.bookingConfirmed({
    bookingId,
    requestRef: booking.requestRef,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerLanguage: locale,
    tourTitle,
    tourSlug,
    confirmedDate,
    confirmedTime,
    guests: confirmedGuests,
    totalPrice: confirmedPrice,
    prepaymentRequired: paymentMethod !== 'cash_only' && paymentMethod !== 'none',
    depositAmount: depositAmount,
    stripeCheckoutUrl: undefined,
    paymentDeadlineDays: 3,
  }).catch(console.error)

  return NextResponse.json({
    success: true,
    offerUrl,
  })
}
