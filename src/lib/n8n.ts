/**
 * n8n webhook client.
 * All functions are fire-and-forget — failures are logged, never thrown.
 * The booking flow works identically when N8N_WEBHOOK_* vars are absent.
 */

const TIMEOUT_MS = 4000

async function postWebhook(url: string | undefined, body: unknown): Promise<void> {
  if (!url) return
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) console.error(`[n8n] Webhook ${url} returned ${res.status}`)
  } catch (err) {
    console.error(`[n8n] Webhook failed (${url}):`, err)
  }
}

// ─── Payload types (keep in sync with BookingRequests collection) ─────────

export interface BookingNewPayload {
  bookingId: string          // Payload doc ID
  requestRef: string         // BPG-YYYY-NNNNN
  tourId: string
  tourTitle: string
  tourSlug: string
  preferredDate: string      // ISO date
  preferredTime: string      // HH:MM
  guests: number
  guestCategories?: { name: string; count: number }[]
  selectedServices?: string[]
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerLanguage: 'en' | 'ru'
  specialRequests?: string
  totalPrice?: number
  currency: string
  ipCountry?: string
  submittedAt: string        // ISO datetime
}

export interface BookingConfirmedPayload {
  bookingId: string
  requestRef: string
  customerName: string
  customerEmail: string
  customerLanguage: 'en' | 'ru'
  tourTitle: string
  tourSlug: string
  confirmedDate: string
  confirmedTime: string
  guests: number
  totalPrice?: number
  prepaymentRequired: boolean
  depositAmountEur?: number
  depositPercent?: number
  stripeCheckoutUrl?: string
  paymentDeadlineDays?: number
}

export interface TourCompletedPayload {
  bookingId: string
  requestRef: string
  customerName: string
  customerEmail: string
  customerLanguage: 'en' | 'ru'
  tourTitle: string
  mauticContactId?: number
  chatwootConversationId?: number
  completedAt: string
}

export interface PaymentReceivedPayload {
  bookingId: string
  requestRef: string
  customerName: string
  customerEmail: string
  customerLanguage: 'en' | 'ru'
  tourTitle: string
  depositPaidEur: number
  cashBalanceEur: number
  isFullyPaid: boolean
  chatwootConversationId?: number
  mauticContactId?: number
  paidAt: string
}

// ─── Public API ──────────────────────────────────────────────────────────

export const n8n = {
  bookingNew: (p: BookingNewPayload) =>
    postWebhook(process.env.N8N_WEBHOOK_BOOKING_NEW, p),

  bookingConfirmed: (p: BookingConfirmedPayload) =>
    postWebhook(process.env.N8N_WEBHOOK_BOOKING_CONFIRMED, p),

  tourCompleted: (p: TourCompletedPayload) =>
    postWebhook(process.env.N8N_WEBHOOK_TOUR_COMPLETED, p),

  paymentReceived: (p: PaymentReceivedPayload) =>
    postWebhook(process.env.N8N_WEBHOOK_PAYMENT_RECEIVED, p),
}
