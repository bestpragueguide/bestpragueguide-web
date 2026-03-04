import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail, sendAdminEmail } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'
import React from 'react'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  message: z.string().min(10).max(5000),
  locale: z.enum(['en', 'ru']),
})

interface IpInfo {
  ip: string
  city?: string
  region?: string
  country?: string
  org?: string
}

async function getIpInfo(ip: string): Promise<IpInfo> {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1') {
    return { ip }
  }
  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json`, {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      return {
        ip,
        city: data.city,
        region: data.region,
        country: data.country,
        org: data.org,
      }
    }
  } catch {
    // Geolookup failed, continue with IP only
  }
  return { ip }
}

const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 20

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
  phone,
  message,
  ipInfo,
}: {
  name: string
  email: string
  phone: string
  message: string
  ipInfo: IpInfo
}) {
  const tdLabel = { padding: '8px', fontWeight: 'bold' as const, color: '#777' }
  const tdValue = { padding: '8px' }
  const location = [ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(', ')

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
          React.createElement('td', { style: tdLabel }, 'Name'),
          React.createElement('td', { style: tdValue }, name),
        ),
        React.createElement(
          'tr',
          null,
          React.createElement('td', { style: tdLabel }, 'Email'),
          React.createElement(
            'td',
            { style: tdValue },
            React.createElement('a', { href: `mailto:${email}` }, email),
          ),
        ),
        React.createElement(
          'tr',
          null,
          React.createElement('td', { style: tdLabel }, 'Phone'),
          React.createElement(
            'td',
            { style: tdValue },
            React.createElement('a', { href: `tel:${phone}` }, phone),
          ),
        ),
        React.createElement(
          'tr',
          null,
          React.createElement('td', { style: { ...tdLabel, verticalAlign: 'top' } }, 'Message'),
          React.createElement('td', { style: { ...tdValue, whiteSpace: 'pre-wrap' } }, message),
        ),
        React.createElement(
          'tr',
          null,
          React.createElement('td', { style: { ...tdLabel, borderTop: '1px solid #eee', paddingTop: '12px' } }, 'IP'),
          React.createElement('td', { style: { ...tdValue, borderTop: '1px solid #eee', paddingTop: '12px', color: '#999' } }, ipInfo.ip),
        ),
        location &&
          React.createElement(
            'tr',
            null,
            React.createElement('td', { style: { ...tdLabel, color: '#999' } }, 'Location'),
            React.createElement('td', { style: { ...tdValue, color: '#999' } }, location),
          ),
        ipInfo.org &&
          React.createElement(
            'tr',
            null,
            React.createElement('td', { style: { ...tdLabel, color: '#999' } }, 'ISP'),
            React.createElement('td', { style: { ...tdValue, color: '#999' } }, ipInfo.org),
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
      phone: data.phone,
      message: data.message.slice(0, 100),
      locale: data.locale,
      ip,
    })

    // Fetch IP geolocation (non-blocking — won't fail the request)
    const ipInfo = await getIpInfo(ip)
    const location = [ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(', ')

    // Send notifications in parallel
    await Promise.allSettled([
      // Admin notification email
      sendAdminEmail({
        subject: `Contact form: ${data.name}`,
        react: React.createElement(ContactNotificationEmail, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          ipInfo,
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
        `📩 <b>Contact Form</b>\n\n<b>Name:</b> ${data.name}\n<b>Email:</b> ${data.email}\n<b>Phone:</b> ${data.phone}\n<b>Message:</b> ${data.message}\n\n<b>IP:</b> ${ip}${location ? `\n<b>Location:</b> ${location}` : ''}${ipInfo.org ? `\n<b>ISP:</b> ${ipInfo.org}` : ''}`,
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
