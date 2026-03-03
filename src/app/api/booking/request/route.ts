import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { bookingRequestSchema, generateRequestRef } from '@/lib/booking'
import { sendEmail, sendAdminEmail } from '@/lib/email'
import { RequestReceivedEmail } from '@/emails/request-received'
import { NewRequestAdminEmail } from '@/emails/new-request-admin'
import {
  sendTelegramMessage,
  formatBookingTelegramMessage,
} from '@/lib/telegram'
import {
  sendWhatsAppMessage,
  formatBookingWhatsAppMessage,
} from '@/lib/whatsapp'
import { z } from 'zod'

const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const maxRequests = 5

  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < windowMs)

  if (recent.length >= maxRequests) {
    return true
  }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  try {
    const body = await request.json()
    const data = bookingRequestSchema.parse(body)
    const requestRef = await generateRequestRef()

    const payload = await getPayload({ config })

    await payload.create({
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
        specialRequests: data.specialRequests || '',
        status: 'new',
      },
    })

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
    }

    const notificationPromises = [
      sendEmail({
        to: data.customerEmail,
        subject:
          data.locale === 'ru'
            ? `Запрос получен — ${requestRef}`
            : `Request received — ${requestRef}`,
        react: RequestReceivedEmail({
          customerName: data.customerName,
          tourName: data.tourName,
          preferredDate: data.preferredDate,
          requestRef,
          locale: data.locale,
        }),
      }),
      sendAdminEmail({
        subject: `New booking: ${requestRef} — ${data.tourName}`,
        react: NewRequestAdminEmail({
          ...notificationData,
          locale: data.locale,
        }),
      }),
      sendTelegramMessage(
        formatBookingTelegramMessage(notificationData),
      ),
      sendWhatsAppMessage(
        formatBookingWhatsAppMessage(notificationData),
      ),
    ]

    // Fire and forget — don't block the response
    Promise.allSettled(notificationPromises).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error('[Booking] Notification failed:', result.reason)
        }
      }
    })

    console.log('[Booking] New request created:', {
      requestRef,
      tour: data.tourName,
      date: data.preferredDate,
      customer: data.customerName,
    })

    return NextResponse.json({ success: true, requestRef })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
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
