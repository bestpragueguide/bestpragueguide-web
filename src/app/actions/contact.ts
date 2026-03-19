'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendEmail, sendAdminEmail } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'
import { getIpInfo, formatLocation, type IpInfo } from '@/lib/ip'
import { sendSlackMessage, formatContactSlackMessage } from '@/lib/slack'
import { isRateLimited } from '@/lib/rate-limit'
import { isDisposableEmail } from '@/lib/email-validation'
import React from 'react'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(3).max(30),
  message: z.string().min(4).max(1000),
  locale: z.enum(['en', 'ru']),
})

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
  email,
  phone,
  message,
  locale,
}: {
  name: string
  email: string
  phone: string
  message: string
  locale: string
}) {
  const isRu = locale === 'ru'
  const labelStyle = { padding: '6px 8px', fontWeight: 'bold' as const, color: '#777', verticalAlign: 'top' as const }
  const valueStyle = { padding: '6px 8px' }

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
      { style: { color: '#777', marginTop: '20px', marginBottom: '8px', fontSize: '14px' } },
      isRu ? 'Копия вашего сообщения:' : 'A copy of your message:',
    ),
    React.createElement(
      'table',
      { style: { borderCollapse: 'collapse', width: '100%', fontSize: '14px', border: '1px solid #eee', borderRadius: '8px' } },
      React.createElement(
        'tbody',
        null,
        React.createElement('tr', null,
          React.createElement('td', { style: labelStyle }, isRu ? 'Имя' : 'Name'),
          React.createElement('td', { style: valueStyle }, name),
        ),
        React.createElement('tr', null,
          React.createElement('td', { style: labelStyle }, 'Email'),
          React.createElement('td', { style: valueStyle }, email),
        ),
        React.createElement('tr', null,
          React.createElement('td', { style: labelStyle }, isRu ? 'Телефон' : 'Phone'),
          React.createElement('td', { style: valueStyle }, phone),
        ),
        React.createElement('tr', null,
          React.createElement('td', { style: { ...labelStyle, verticalAlign: 'top' } }, isRu ? 'Сообщение' : 'Message'),
          React.createElement('td', { style: { ...valueStyle, whiteSpace: 'pre-wrap' } }, message),
        ),
      ),
    ),
    React.createElement(
      'p',
      { style: { color: '#777', marginTop: '20px' } },
      'Best Prague Guide',
    ),
  )
}

import { textToLexicalJson } from '@/lib/lexical-helpers'

export type ContactActionResult = {
  success: boolean
  error?: string
  rateLimited?: boolean
}

export async function submitContactForm(formData: unknown): Promise<ContactActionResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (await isRateLimited(ip, 'contact')) {
    // Still save the message marked as rate_limited (same as API route)
    try {
      const parsed = contactSchema.safeParse(formData)
      if (parsed.success) {
        const ipInfo = await getIpInfo(ip)
        const payload = await getPayload({ config })
        await payload.create({
          collection: 'contact-messages',
          data: {
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            message: textToLexicalJson(parsed.data.message) as any,
            locale: parsed.data.locale,
            status: 'error',
            ipInfo: {
              ip: ipInfo.ip,
              city: ipInfo.city || '',
              region: ipInfo.region || '',
              country: ipInfo.country || '',
              isp: ipInfo.org || '',
            },
          },
        })
      }
    } catch {
      // Best effort - don't fail the rate limit response
    }
    return { success: false, rateLimited: true, error: 'Too many requests' }
  }

  try {
    const data = contactSchema.parse(formData)

    if (isDisposableEmail(data.email)) {
      return { success: false, error: 'Please use a valid email address' }
    }

    const ipInfo = await getIpInfo(ip)
    const location = formatLocation(ipInfo)

    // Save to CMS
    try {
      const payload = await getPayload({ config })
      await payload.create({
        collection: 'contact-messages',
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: textToLexicalJson(data.message) as any,
          locale: data.locale,
          ipInfo: {
            ip: ipInfo.ip,
            city: ipInfo.city || '',
            region: ipInfo.region || '',
            country: ipInfo.country || '',
            isp: ipInfo.org || '',
          },
        },
      })
    } catch (err) {
      console.error('[Contact Action] Failed to save to CMS:', err)
    }

    // Send notifications (fire and forget)
    Promise.allSettled([
      sendAdminEmail({
        subject: `Contact form: ${data.name}`,
        react: React.createElement(ContactNotificationEmail, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          ipInfo,
        }),
        replyTo: data.email,
      }),
      sendEmail({
        to: data.email,
        subject: data.locale === 'ru'
          ? 'Мы получили ваше сообщение — Best Prague Guide'
          : 'We received your message — Best Prague Guide',
        react: React.createElement(ContactConfirmationEmail, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          locale: data.locale,
        }),
        replyTo: 'info@bestpragueguide.com',
      }),
      sendTelegramMessage(
        `📩 <b>Contact Form</b>\n\n<b>Name:</b> ${data.name}\n<b>Email:</b> ${data.email}\n<b>Phone:</b> ${data.phone}\n<b>Message:</b> ${data.message}\n\n<b>IP:</b> ${ip}${location ? `\n<b>Location:</b> ${location}` : ''}${ipInfo.org ? `\n<b>ISP:</b> ${ipInfo.org}` : ''}`,
      ),
      sendSlackMessage(
        formatContactSlackMessage({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          locale: data.locale,
          ip: ipInfo.ip,
          location,
          isp: ipInfo.org,
        }),
      ),
    ]).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error('[Contact Action] Notification failed:', result.reason)
        }
      }
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid form data' }
    }
    console.error('[Contact Action] Error:', error)
    return { success: false, error: 'Internal server error' }
  }
}
