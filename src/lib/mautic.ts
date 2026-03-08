/**
 * Mautic REST API client (OAuth2 client credentials).
 * Used directly from app code for contact creation.
 * Sequence emails are triggered by n8n via Mautic API HTTP nodes.
 * All functions are fire-and-forget safe.
 */

let _token: { value: string; expiresAt: number } | null = null

async function getToken(): Promise<string | null> {
  const base = process.env.MAUTIC_BASE_URL
  const id = process.env.MAUTIC_CLIENT_ID
  const secret = process.env.MAUTIC_CLIENT_SECRET
  if (!base || !id || !secret) return null

  if (_token && _token.expiresAt > Date.now() + 60_000) return _token.value

  try {
    const res = await fetch(`${base}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: id,
        client_secret: secret,
      }),
    })
    if (!res.ok) { console.error('[mautic] Token request failed:', res.status); return null }
    const data = await res.json() as { access_token: string; expires_in: number }
    _token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
    return _token.value
  } catch (err) {
    console.error('[mautic] Token error:', err)
    return null
  }
}

async function mauticFetch(path: string, opts: RequestInit = {}): Promise<unknown> {
  const base = process.env.MAUTIC_BASE_URL
  const token = await getToken()
  if (!base || !token) return null

  try {
    const res = await fetch(`${base}/api${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...opts.headers,
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) { console.error(`[mautic] ${path}: ${res.status}`); return null }
    return res.json()
  } catch (err) {
    console.error(`[mautic] ${path} failed:`, err)
    return null
  }
}

export interface MauticContactParams {
  email: string
  name: string
  phone?: string
  language: 'en' | 'ru'
  tourTitle?: string
  tourDate?: string
  tourTime?: string
  bookingRef?: string
  meetingPoint?: string
}

/**
 * Create or update a Mautic contact.
 * Returns the Mautic contact ID, or null on failure.
 */
export async function upsertMauticContact(params: MauticContactParams): Promise<number | null> {
  const [firstname, ...rest] = params.name.trim().split(' ')
  const lastname = rest.join(' ')

  const data = await mauticFetch('/contacts/new', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      firstname,
      lastname,
      phone: params.phone,
      language: params.language,
      tour_title: params.tourTitle ?? '',
      tour_date: params.tourDate ?? '',
      tour_time: params.tourTime ?? '',
      booking_ref: params.bookingRef ?? '',
      meeting_point: params.meetingPoint ?? '',
    }),
  }) as { contact?: { id?: number } } | null

  return data?.contact?.id ?? null
}
