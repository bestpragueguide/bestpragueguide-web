'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { bookingRequestSchema, generateRequestRef } from '@/lib/booking'
import { sendEmail, sendAdminEmail } from '@/lib/email'
import { RequestReceivedEmail } from '@/emails/request-received'
import { NewRequestAdminEmail } from '@/emails/new-request-admin'
import { sendTelegramMessage, formatBookingTelegramMessage } from '@/lib/telegram'
import { sendWhatsAppMessage, formatBookingWhatsAppMessage } from '@/lib/whatsapp'
import { getIpInfo, formatLocation } from '@/lib/ip'
import { sendSlackMessage, formatBookingSlackMessage } from '@/lib/slack'
import { n8n } from '@/lib/n8n'
import { isRateLimited } from '@/lib/rate-limit'
import { isDisposableEmail } from '@/lib/email-validation'
import { getEmailTemplates, resolveTemplate, getNotificationEmail } from '@/lib/cms-data'
import { z } from 'zod'
import { textToLexicalJson } from '@/lib/lexical-helpers'

export type BookingActionResult = {
  success: boolean
  requestRef?: string
  error?: string
  details?: Array<{ path: (string | number)[]; message: string }>
  rateLimited?: boolean
}

export async function submitBookingRequest(formData: unknown): Promise<BookingActionResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (await isRateLimited(ip, 'booking')) {
    return { success: false, rateLimited: true, error: 'Too many requests' }
  }

  try {
    const data = bookingRequestSchema.parse(formData)

    if (isDisposableEmail(data.customerEmail)) {
      return {
        success: false,
        error: 'Please use a valid email address',
        details: [{ path: ['customerEmail'], message: 'Disposable email addresses are not accepted' }],
      }
    }

    const requestRef = await generateRequestRef()
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
    const vars = { name: data.customerName, tour: data.tourName, date: data.preferredDate, ref: requestRef }

    // Fire and forget notifications
    Promise.allSettled([
      sendEmail({
        to: data.customerEmail,
        subject: resolveTemplate(tpl.receivedSubject || (data.locale === 'ru' ? 'Запрос получен — {ref}' : 'Request received — {ref}'), vars),
        react: RequestReceivedEmail({
          customerName: data.customerName,
          tourName: data.tourName,
          preferredDate: data.preferredDate,
          requestRef,
          locale: data.locale,
          cmsBody: tpl.receivedBody ? resolveTemplate(tpl.receivedBody, vars) : undefined,
          cmsNote: tpl.receivedNote ? resolveTemplate(tpl.receivedNote, vars) : undefined,
          cmsFooter: tpl.footer || undefined,
        }),
      }),
      sendAdminEmail({
        to: notificationEmail,
        subject: resolveTemplate(tpl.adminSubject || 'New booking: {ref} — {tour}', vars),
        react: RequestReceivedEmail({
          customerName: data.customerName,
          tourName: data.tourName,
          preferredDate: data.preferredDate,
          requestRef,
          locale: data.locale,
          cmsBody: tpl.receivedBody ? resolveTemplate(tpl.receivedBody, vars) : undefined,
          cmsNote: tpl.receivedNote ? resolveTemplate(tpl.receivedNote, vars) : undefined,
          cmsFooter: tpl.footer || undefined,
        }),
        replyTo: data.customerEmail,
      }),
      sendTelegramMessage(formatBookingTelegramMessage(notificationData)),
      sendWhatsAppMessage(formatBookingWhatsAppMessage(notificationData)),
      sendSlackMessage(formatBookingSlackMessage(notificationData)),
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
    ]).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error('[Booking Action] Notification failed:', result.reason)
        }
      }
    })

    console.log('[Booking Action] New request created:', {
      requestRef,
      tour: data.tourName,
      date: data.preferredDate,
      customer: data.customerName,
    })

    return { success: true, requestRef }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid form data',
        details: error.issues.map(i => ({ path: i.path.map(p => String(p)), message: i.message })),
      }
    }
    console.error('[Booking Action] Error:', error)
    return { success: false, error: 'Internal server error' }
  }
}
