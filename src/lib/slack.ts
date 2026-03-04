import { formatPrice, type Currency } from '@/lib/currency'

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

export async function sendSlackMessage(payload: Record<string, unknown>) {
  if (!WEBHOOK_URL) {
    console.log('[Slack] Skipping (no config)')
    return { success: true, skipped: true }
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[Slack] Send failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('[Slack] Error:', error)
    return { success: false, error }
  }
}

export function formatBookingSlackMessage({
  requestRef,
  tourName,
  preferredDate,
  preferredTime,
  guests,
  customerName,
  customerEmail,
  customerPhone,
  specialRequests,
  totalPrice,
  currency,
  ip,
  location,
  isp,
}: {
  requestRef: string
  tourName: string
  preferredDate: string
  preferredTime: string
  guests: number
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests: string
  totalPrice?: number
  currency?: string
  ip?: string
  location?: string
  isp?: string
}): Record<string, unknown> {
  const fields = [
    { type: 'mrkdwn', text: `*Ref:*\n${requestRef}` },
    { type: 'mrkdwn', text: `*Tour:*\n${tourName}` },
    { type: 'mrkdwn', text: `*Date:*\n${preferredDate}` },
    { type: 'mrkdwn', text: `*Time:*\n${preferredTime}` },
    { type: 'mrkdwn', text: `*Guests:*\n${guests}` },
    ...(totalPrice ? [{ type: 'mrkdwn', text: `*Price:*\n${formatPrice(totalPrice, (currency as Currency) || 'EUR')}` }] : []),
    { type: 'mrkdwn', text: `*Customer:*\n${customerName}` },
    { type: 'mrkdwn', text: `*Email:*\n${customerEmail}` },
  ]

  if (customerPhone) {
    fields.push({ type: 'mrkdwn', text: `*Phone:*\n${customerPhone}` })
  }

  const blocks: Record<string, unknown>[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🆕 New Booking Request', emoji: true },
    },
    {
      type: 'section',
      fields,
    },
  ]

  if (specialRequests) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Special Requests:*\n${specialRequests}` },
    })
  }

  if (ip) {
    const parts = [`IP: ${ip}`]
    if (location) parts.push(`Location: ${location}`)
    if (isp) parts.push(`ISP: ${isp}`)
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: parts.join('  ·  ') }],
    })
  }

  return {
    attachments: [
      {
        color: '#C4975C',
        blocks,
      },
    ],
  }
}

export function formatContactSlackMessage({
  name,
  email,
  phone,
  message,
  locale,
  ip,
  location,
  isp,
}: {
  name: string
  email: string
  phone: string
  message: string
  locale: string
  ip?: string
  location?: string
  isp?: string
}): Record<string, unknown> {
  const blocks: Record<string, unknown>[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '📩 New Contact Message', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Name:*\n${name}` },
        { type: 'mrkdwn', text: `*Email:*\n${email}` },
        { type: 'mrkdwn', text: `*Phone:*\n${phone}` },
        { type: 'mrkdwn', text: `*Language:*\n${locale.toUpperCase()}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Message:*\n>${message.replace(/\n/g, '\n>')}` },
    },
  ]

  if (ip) {
    const parts = [`IP: ${ip}`]
    if (location) parts.push(`Location: ${location}`)
    if (isp) parts.push(`ISP: ${isp}`)
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: parts.join('  ·  ') }],
    })
  }

  return {
    attachments: [
      {
        color: '#2563EB',
        blocks,
      },
    ],
  }
}
