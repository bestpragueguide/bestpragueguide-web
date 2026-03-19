import { z } from 'zod'

export const bookingRequestSchema = z.object({
  tourId: z.number(),
  tourName: z.string(),
  preferredDate: z.string().refine(
    (val) => {
      const date = new Date(val)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      return date >= tomorrow
    },
    { message: 'Date must be tomorrow or later' },
  ),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  guests: z.number().min(1).max(50),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(20).optional().default(''),
  specialRequests: z.string().max(1000).optional().default(''),
  totalPrice: z.number().nullable().optional(),
  pricingModel: z.enum(['GROUP_TIERS', 'PER_PERSON', 'FLAT_RATE', 'ON_REQUEST']).optional(),
  isOnRequest: z.boolean().optional(),
  currency: z.enum(['EUR', 'CZK', 'USD']).optional().default('EUR'),
  paymentMethod: z.enum(['stripe_deposit', 'stripe_full', 'cash_only', 'none']).optional().default('cash_only'),
  locale: z.enum(['en', 'ru']),
})

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>

export async function generateRequestRef(): Promise<string> {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `BPG-${year}-${random}`
}

export const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
]
