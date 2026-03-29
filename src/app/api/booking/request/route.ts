import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { bookingRequestSchema, generateRequestRef } from '@/lib/booking'
import { sendEmail, sendAdminEmail } from '@/lib/email'
import { RequestReceivedEmail } from '@/emails/request-received'
import { formatEmailDate } from '@/emails/utils'
import { NewRequestAdminEmail } from '@/emails/new-request-admin'
import {
  sendTelegramMessage,
  formatBookingTelegramMessage,
} from '@/lib/telegram'
import {
  sendWhatsAppMessage,
  formatBookingWhatsAppMessage,
} from '@/lib/whatsapp'
import { getIpInfo, formatLocation } from '@/lib/ip'
import { sendSlackMessage, formatBookingSlackMessage } from '@/lib/slack'
import { n8n } from '@/lib/n8n'
import { isRateLimited } from '@/lib/rate-limit'
import { isDisposableEmail } from '@/lib/email-validation'
import { getEmailTemplates, resolveTemplate, getNotificationEmail } from '@/lib/cms-data'
import { z } from 'zod'
import { textToLexicalJson } from '@/lib/lexical-helpers'
import { logBookingEvent, extractRequestMeta } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (await isRateLimited(ip, 'booking')) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  try {
    const body = await request.json()
    const data = bookingRequestSchema.parse(body)

    if (isDisposableEmail(data.customerEmail)) {
      return NextResponse.json(
        { error: 'Please use a valid email address', details: [{ path: ['customerEmail'], message: 'Disposable email addresses are not accepted' }] },
        { status: 400 },
      )
    }

    const requestRef = await generateRequestRef()

    // Fetch IP geolocation
    const ipInfo = await getIpInfo(ip)
    const location = formatLocation(ipInfo)

    const payload = await getPayload({ config })

    const savedBooking = await payload.create({
      collection: 'booking-requests',
      data: {
        requestRef,
        tour: data.tourId,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        guests: data.guests,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || '',
        customerLanguage: data.locale,
        specialRequests: textToLexicalJson(data.specialRequests || '') as any,
        totalPrice: data.totalPrice ?? 0,
        currency: data.currency || 'EUR',
        paymentMethod: data.paymentMethod || 'cash_only',
        status: 'new',
        ipInfo: {
          ip: ipInfo.ip,
          city: ipInfo.city || '',
          region: ipInfo.region || '',
          country: ipInfo.country || '',
          isp: ipInfo.org || '',
        },
      },
    })

    // Log booking creation audit event
    const reqMeta = extractRequestMeta(request)
    logBookingEvent({
      bookingId: savedBooking.id,
      eventType: 'booking_created',
      actor: { type: 'customer', id: data.customerEmail, name: data.customerName },
      description: `Booking ${requestRef} created for ${data.tourName}`,
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
      ipGeo: { city: ipInfo.city, region: ipInfo.region, country: ipInfo.country, isp: ipInfo.org },
      metadata: { tourName: data.tourName, guests: data.guests, totalPrice: data.totalPrice, currency: data.currency },
    }, payload)

    // Send notifications (fire in parallel, don't block response)
    const notificationData = {
      requestRef,
      tourName: data.tourName,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      guests: data.guests,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || '',
      specialRequests: data.specialRequests || '',
      totalPrice: data.totalPrice ?? 0,
      isOnRequest: data.isOnRequest || false,
      pricingModel: data.pricingModel,
      currency: data.currency || 'EUR',
      locale: data.locale,
      ip: ipInfo.ip,
      location,
      isp: ipInfo.org || '',
    }

    // Fetch CMS email templates + notification email
    const [tpl, notificationEmail] = await Promise.all([
      getEmailTemplates(data.locale),
      getNotificationEmail(),
    ])
    const vars = {
      name: data.customerName,
      tour: data.tourName,
      date: formatEmailDate(data.preferredDate, data.locale as 'en' | 'ru'),
      time: data.preferredTime,
      guests: String(data.guests),
      phone: data.customerPhone || '',
      email: data.customerEmail,
      price: data.totalPrice != null ? String(data.totalPrice) : '',
      currency: data.currency || 'EUR',
      requests: data.specialRequests || '',
      ref: requestRef,
    }

    const emailProps = {
      customerName: data.customerName,
      tourName: data.tourName,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      guests: data.guests,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || '',
      specialRequests: data.specialRequests || '',
      totalPrice: data.totalPrice,
      currency: data.currency || 'EUR',
      paymentMethod: data.paymentMethod || 'cash_only',
      requestRef,
      locale: data.locale,
      cmsHeaderTitle: tpl.headerTitle || undefined,
      cmsGreeting: tpl.greeting ? resolveTemplate(tpl.greeting, vars) : undefined,
      cmsBody: tpl.receivedBody ? resolveTemplate(tpl.receivedBody, vars) : undefined,
      cmsSummaryTitle: tpl.receivedSummaryTitle || undefined,
      cmsSummaryBody: tpl.receivedSummaryBody ? resolveTemplate(tpl.receivedSummaryBody, vars) : undefined,
      cmsNote: tpl.receivedNote ? resolveTemplate(tpl.receivedNote, vars) : undefined,
      cmsFooter: tpl.footer || undefined,
      cmsHeaderContent: (tpl as any).headerContent || undefined,
      cmsFooterContent: (tpl as any).footerContent || undefined,
      summaryLabels: tpl.summaryLabels,
      summaryPaymentLabels: tpl.summaryPaymentLabels,
      summaryLanguageLabels: tpl.summaryLanguageLabels,
    }

    const notificationPromises = [
      sendEmail({
        to: data.customerEmail,
        subject: resolveTemplate(tpl.receivedSubject || (data.locale === 'ru' ? 'Запрос получен — {ref}' : 'Request received — {ref}'), vars),
        react: RequestReceivedEmail(emailProps),
      }),
      sendAdminEmail({
        to: notificationEmail,
        subject: resolveTemplate(tpl.adminSubject || 'New booking: {ref} — {tour}', vars),
        react: RequestReceivedEmail(emailProps),
        replyTo: data.customerEmail,
      }),
      sendTelegramMessage(
        formatBookingTelegramMessage(notificationData),
      ),
      sendWhatsAppMessage(
        formatBookingWhatsAppMessage(notificationData),
      ),
      sendSlackMessage(
        formatBookingSlackMessage(notificationData),
      ),
      n8n.bookingNew({
        bookingId: String(savedBooking.id),
        requestRef,
        tourId: String(data.tourId),
        tourTitle: data.tourName,
        tourSlug: '',
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        guests: data.guests,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerLanguage: data.locale as 'en' | 'ru',
        specialRequests: data.specialRequests,
        totalPrice: data.totalPrice ?? undefined,
        currency: data.currency || 'EUR',
        ipCountry: ipInfo?.country,
        submittedAt: new Date().toISOString(),
      }),
    ]

    // Wait for email results to include in response for debugging
    const notificationResults = await Promise.allSettled(notificationPromises)
    const emailResult = notificationResults[0]
    const emailError = emailResult?.status === 'rejected'
      ? String(emailResult.reason)
      : emailResult?.status === 'fulfilled' && !(emailResult.value as any)?.success
        ? JSON.stringify((emailResult.value as any)?.error || 'unknown')
        : null
    for (const result of notificationResults) {
      if (result.status === 'rejected') {
        console.error('[Booking] Notification failed:', result.reason)
      }
    }

    console.log('[Booking] New request created:', {
      requestRef,
      tour: data.tourName,
      date: formatEmailDate(data.preferredDate, data.locale as 'en' | 'ru'),
      customer: data.customerName,
    })

    return NextResponse.json({ success: true, requestRef, ...(emailError ? { emailError } : {}) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 },
      )
    }
    console.error('[Booking] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
