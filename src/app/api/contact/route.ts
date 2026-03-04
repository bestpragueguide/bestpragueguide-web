import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail, sendAdminEmail } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'
import React from 'react'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
  locale: z.enum(['en', 'ru']),
})

const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
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

function ContactNotificationEmail({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) {
  return React.createElement(
    'div',
    { style: { fontFamily: 'sans-serif', padding: '20px' } },
    React.createElement('h2', { style: { color: '#1A1A1A' } }, 'New Contact Form Message'),
    React.createElement(
      'table',
      { style: { borderCollapse: 'collapse', width: '100%' } },
      React.createElement(
        'tbody',
        null,
        React.createElement(
          'tr',
          null,
          React.createElement('td', { style: { padding: '8px', fontWeight: 'bold', color: '#777' } }, 'Name'),
          React.createElement('td', { style: { padding: '8px' } }, name),
        ),
        React.createElement(
          'tr',
          null,
          React.createElement('td', { style: { padding: '8px', fontWeight: 'bold', color: '#777' } }, 'Email'),
          React.createElement(
            'td',
            { style: { padding: '8px' } },
            React.createElement('a', { href: `mailto:${email}` }, email),
          ),
        ),
        React.createElement(
          'tr',
          null,
          React.createElement('td', { style: { padding: '8px', fontWeight: 'bold', color: '#777', verticalAlign: 'top' } }, 'Message'),
          React.createElement('td', { style: { padding: '8px', whiteSpace: 'pre-wrap' } }, message),
        ),
      ),
    ),
  )
}

function ContactConfirmationEmail({
  name,
  locale,
}: {
  name: string
  locale: string
}) {
  const isRu = locale === 'ru'
  return React.createElement(
    'div',
    { style: { fontFamily: 'sans-serif', padding: '20px' } },
    React.createElement(
      'h2',
      { style: { color: '#1A1A1A' } },
      isRu ? 'Спасибо за ваше сообщение!' : 'Thank you for your message!',
    ),
    React.createElement(
      'p',
      null,
      isRu
        ? `${name}, мы получили ваше сообщение и ответим в ближайшее время.`
        : `${name}, we received your message and will get back to you soon.`,
    ),
    React.createElement(
      'p',
      { style: { color: '#777', marginTop: '20px' } },
      'Best Prague Guide',
    ),
  )
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    console.log('[Contact Form]', {
      name: data.name,
      email: data.email,
      message: data.message.slice(0, 100),
      locale: data.locale,
    })

    // Send notifications in parallel
    await Promise.allSettled([
      // Admin notification email
      sendAdminEmail({
        subject: `Contact form: ${data.name}`,
        react: React.createElement(ContactNotificationEmail, {
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      }),
      // Confirmation email to customer
      sendEmail({
        to: data.email,
        subject:
          data.locale === 'ru'
            ? 'Мы получили ваше сообщение — Best Prague Guide'
            : 'We received your message — Best Prague Guide',
        react: React.createElement(ContactConfirmationEmail, {
          name: data.name,
          locale: data.locale,
        }),
      }),
      // Telegram notification
      sendTelegramMessage(
        `📩 <b>Contact Form</b>\n\n<b>Name:</b> ${data.name}\n<b>Email:</b> ${data.email}\n<b>Message:</b> ${data.message}`,
      ),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
