/**
 * Meta Conversions API (CAPI) — server-side event tracking.
 * Sends events directly to Meta's servers, bypassing ad blockers.
 * Fire-and-forget — failures are logged, never thrown.
 *
 * Requires: FB_CAPI_TOKEN + NEXT_PUBLIC_FB_PIXEL_ID env vars.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const ACCESS_TOKEN = process.env.FB_CAPI_TOKEN
const API_VERSION = 'v19.0'
const TIMEOUT_MS = 5000

interface CAPIEventData {
  eventName: string
  eventTime?: number
  sourceUrl?: string
  userEmail?: string
  userPhone?: string
  userIp?: string
  userAgent?: string
  contentName?: string
  contentCategory?: string
  contentIds?: string[]
  value?: number
  currency?: string
}

function hashSHA256(value: string): Promise<string> {
  return import('crypto').then(({ createHash }) =>
    createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
  )
}

export async function sendCAPIEvent(data: CAPIEventData): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return

  try {
    const userData: Record<string, string> = {}
    if (data.userEmail) userData.em = [await hashSHA256(data.userEmail)]  as unknown as string
    if (data.userPhone) userData.ph = [await hashSHA256(data.userPhone.replace(/[^0-9]/g, ''))] as unknown as string
    if (data.userIp) userData.client_ip_address = data.userIp
    if (data.userAgent) userData.client_user_agent = data.userAgent

    const eventData: Record<string, unknown> = {
      event_name: data.eventName,
      event_time: data.eventTime || Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: data.sourceUrl || 'https://bestpragueguide.com',
      user_data: userData,
    }

    const customData: Record<string, unknown> = {}
    if (data.contentName) customData.content_name = data.contentName
    if (data.contentCategory) customData.content_category = data.contentCategory
    if (data.contentIds) customData.content_ids = data.contentIds
    if (data.value != null) customData.value = data.value
    if (data.currency) customData.currency = data.currency
    if (Object.keys(customData).length > 0) eventData.custom_data = customData

    const body = JSON.stringify({
      data: [eventData],
      access_token: ACCESS_TOKEN,
    })

    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[Meta CAPI] Failed:', res.status, err)
    }
  } catch (err) {
    console.error('[Meta CAPI] Error:', err)
  }
}

/** Track booking form submission as Lead */
export async function capiTrackLead(opts: {
  email: string
  phone?: string
  tourName: string
  price?: number
  currency?: string
  ip?: string
  userAgent?: string
  url?: string
}): Promise<void> {
  await sendCAPIEvent({
    eventName: 'Lead',
    contentName: opts.tourName,
    contentCategory: 'Private Tour',
    value: opts.price,
    currency: opts.currency || 'EUR',
    userEmail: opts.email,
    userPhone: opts.phone,
    userIp: opts.ip,
    userAgent: opts.userAgent,
    sourceUrl: opts.url,
  })
}

/** Track contact form submission as Lead */
export async function capiTrackContactLead(opts: {
  email: string
  phone?: string
  ip?: string
  userAgent?: string
}): Promise<void> {
  await sendCAPIEvent({
    eventName: 'Lead',
    contentName: 'Contact Form',
    contentCategory: 'General Inquiry',
    userEmail: opts.email,
    userPhone: opts.phone,
    userIp: opts.ip,
    userAgent: opts.userAgent,
  })
}
