/**
 * Chatwoot API helper.
 * Used by n8n via HTTP Request nodes — not called directly from Next.js routes.
 * This file provides message formatters used by n8n Code nodes.
 * Also exports a direct client for the admin booking detail note.
 */

const BASE = () => process.env.CHATWOOT_BASE_URL
const TOKEN = () => process.env.CHATWOOT_API_TOKEN
const ACCOUNT = () => process.env.CHATWOOT_ACCOUNT_ID ?? '1'

async function cw(path: string, opts: RequestInit = {}) {
  const base = BASE()
  const token = TOKEN()
  if (!base || !token) return null

  try {
    const res = await fetch(`${base}/api/v1/accounts/${ACCOUNT()}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': token,
        ...opts.headers,
      },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) { console.error(`[chatwoot] ${path}: ${res.status}`); return null }
    return res.json() as Promise<unknown>
  } catch (err) {
    console.error('[chatwoot] request failed:', err)
    return null
  }
}

/**
 * Post a private note to an existing conversation.
 * Called from the booking API when admin performs manual actions.
 */
export async function addNote(conversationId: number, content: string): Promise<void> {
  await cw(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, message_type: 'outgoing', private: true }),
  })
}

/**
 * Build the internal note content for a new booking.
 * This string is sent by n8n W-01 as the initial conversation note.
 */
export function bookingNote(params: {
  requestRef: string
  tourTitle: string
  preferredDate: string
  preferredTime: string
  guests: number
  language: string
  totalPrice?: number
  specialRequests?: string
  adminUrl: string
}): string {
  const lines = [
    `📋 New booking — ${params.requestRef}`,
    `🗺️ ${params.tourTitle}`,
    `📅 ${params.preferredDate} at ${params.preferredTime}`,
    `👥 ${params.guests} guest${params.guests !== 1 ? 's' : ''} · Language: ${params.language.toUpperCase()}`,
    params.totalPrice ? `💰 Estimated: €${params.totalPrice}` : null,
    params.specialRequests ? `📝 Notes: ${params.specialRequests}` : null,
    `🔗 Admin: ${params.adminUrl}`,
  ]
  return lines.filter(Boolean).join('\n')
}
