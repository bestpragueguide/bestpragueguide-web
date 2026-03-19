import type { Payload } from 'payload'

export interface AuditActor {
  type: 'admin' | 'system' | 'customer' | 'stripe'
  id?: string
  name?: string
}

export interface AuditEventInput {
  bookingId: number | string
  eventType: string
  actor: AuditActor
  description: string
  ip?: string
  userAgent?: string
  ipGeo?: { city?: string; region?: string; country?: string; isp?: string }
  previousValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export async function logBookingEvent(input: AuditEventInput, payload?: Payload): Promise<void> {
  try {
    if (!payload) {
      const { getPayload } = await import('payload')
      const { default: configPromise } = await import('@payload-config')
      payload = await getPayload({ config: configPromise })
    }
    await payload.create({
      collection: 'booking-audit-log',
      data: {
        booking: Number(input.bookingId),
        eventType: input.eventType,
        actorType: input.actor.type,
        actorId: input.actor.id || '',
        actorName: input.actor.name || '',
        description: input.description,
        ipAddress: input.ip || '',
        userAgent: input.userAgent || '',
        ipGeo: input.ipGeo || {},
        previousValue: input.previousValue || {},
        newValue: input.newValue || {},
        metadata: input.metadata || {},
      },
    })
  } catch (err) {
    console.error('[AuditLog] Failed:', err)
  }
}

export const TRACKED_FIELDS = [
  'status', 'paymentStatus', 'preferredDate', 'preferredTime', 'guests',
  'customerName', 'customerEmail', 'customerPhone', 'totalPrice', 'currency',
  'confirmedDate', 'confirmedTime', 'confirmedPrice', 'confirmedGuests',
  'guideName', 'guidePhone', 'meetingPointAddress', 'meetingPointMapUrl',
  'paymentMethod', 'customDepositAmount', 'depositAmountEur', 'cashBalanceEur',
  'offerToken', 'offerSentAt', 'stripePaymentIntentId', 'paidAt',
]

export function computeFieldDiffs(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): { previous: Record<string, unknown>; updated: Record<string, unknown>; changed: string[] } {
  const previous: Record<string, unknown> = {}
  const updated: Record<string, unknown> = {}
  const changed: string[] = []
  for (const field of TRACKED_FIELDS) {
    const oldVal = prev[field]
    const newVal = next[field]
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      previous[field] = oldVal
      updated[field] = newVal
      changed.push(field)
    }
  }
  return { previous, updated, changed }
}

export function extractRequestMeta(req: { headers: Headers }): { ip: string; userAgent: string } {
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    userAgent: req.headers.get('user-agent') || '',
  }
}
