import type { CollectionConfig } from 'payload'
import { simplifiedEditor, fullEditor } from '../lib/editors'
import {
  beforeChangeHook,
  afterChangeHook,
} from './hooks/bookingRequestHooks'

export const BookingRequests: CollectionConfig = {
  slug: 'booking-requests',
  admin: {
    useAsTitle: 'requestRef',
    defaultColumns: ['requestRef', 'customerName', 'tour', 'preferredDate', 'status', 'createdAt'],
    group: 'Bookings',
    listSearchableFields: ['requestRef', 'customerName', 'customerEmail'],
    components: {
      edit: {
        afterFields: ['@/components/admin/PaymentLinkButton#PaymentLinkButton'],
      },
    },
  },
  timestamps: true,
  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [
      afterChangeHook,
      async ({ doc, previousDoc }) => {
        // Fire n8n when status changes to 'completed'
        if (
          doc.status === 'completed' &&
          previousDoc?.status !== 'completed' &&
          process.env.N8N_WEBHOOK_TOUR_COMPLETED
        ) {
          const { n8n } = await import('@/lib/n8n')
          n8n.tourCompleted({
            bookingId: String(doc.id),
            requestRef: doc.requestRef,
            customerName: doc.customerName,
            customerEmail: doc.customerEmail,
            customerLanguage: doc.customerLanguage as 'en' | 'ru',
            tourTitle: String(
              typeof doc.tour === 'object' ? (doc.tour as { title?: string }).title : ''
            ),
            mauticContactId: doc.mauticContactId ?? undefined,
            chatwootConversationId: doc.chatwootConversationId ?? undefined,
            completedAt: new Date().toISOString(),
          }).catch(console.error)
        }
      },
      async ({ doc, previousDoc }) => {
        // Update TourDate.confirmedGuests when booking is confirmed or un-confirmed
        const becameConfirmed =
          doc.status === 'confirmed' && previousDoc?.status !== 'confirmed'
        const lostConfirmed =
          doc.status !== 'confirmed' &&
          (previousDoc?.status === 'confirmed' || previousDoc?.status === 'completed')

        if (!becameConfirmed && !lostConfirmed) return
        if (!doc.preferredDate) return

        const tourId =
          typeof doc.tour === 'object' && doc.tour !== null
            ? (doc.tour as { id: unknown }).id
            : doc.tour

        if (!tourId) return

        const { getPayload } = await import('payload')
        const { default: configPromise } = await import('@payload-config')
        const payload = await getPayload({ config: configPromise })

        const result = await payload.find({
          collection: 'tour-dates',
          where: {
            and: [
              { tour: { equals: tourId } },
              { date: { equals: doc.preferredDate } },
            ],
          },
          limit: 1,
          depth: 0,
        })

        if (!result.docs.length) return
        const tourDate = result.docs[0]

        const delta = becameConfirmed ? (doc.guests ?? 1) : -(doc.guests ?? 1)
        const newConfirmed = Math.max(0, (tourDate.confirmedGuests ?? 0) + delta)
        const available = (tourDate.maxCapacity ?? 12) - newConfirmed

        const newStatus =
          available <= 0 ? 'full' :
          available <= 2 ? 'limited' :
          'available'

        await payload.update({
          collection: 'tour-dates',
          id: String(tourDate.id),
          data: { confirmedGuests: newConfirmed, status: newStatus },
        })
      },
    ],
  },
  fields: [
    {
      name: 'requestRef',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated reference (BPG-YYYY-NNNNN)',
      },
    },
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
      required: true,
    },
    {
      name: 'preferredDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'preferredTime',
      type: 'text',
      required: true,
    },
    {
      name: 'guests',
      type: 'number',
      required: true,
      min: 1,
      max: 8,
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'customerPhone',
      type: 'text',
    },
    {
      name: 'customerLanguage',
      type: 'select',
      required: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Русский', value: 'ru' },
      ],
    },
    {
      name: 'specialRequests',
      type: 'richText',
      editor: simplifiedEditor,
    },
    {
      name: 'totalPrice',
      type: 'number',
      admin: {
        description: 'Calculated total price in EUR (including surcharge)',
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'EUR',
      options: [
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'CZK (Kč)', value: 'CZK' },
        { label: 'USD ($)', value: 'USD' },
      ],
      admin: {
        description: 'Currency selected by customer at booking time',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Payment Sent', value: 'payment-sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Completed', value: 'completed' },
        { label: 'Declined', value: 'declined' },
      ],
    },
    {
      name: 'stripePaymentLink',
      type: 'text',
      admin: {
        description: 'Manually added Stripe Payment Link',
      },
    },
    {
      name: 'ipInfo',
      type: 'group',
      admin: {
        description: 'IP geolocation data',
      },
      fields: [
        { name: 'ip', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'country', type: 'text' },
        { name: 'isp', type: 'text' },
      ],
    },
    {
      name: 'internalNotes',
      type: 'richText',
      editor: fullEditor,
      admin: {
        description: 'Internal notes (not visible to customer)',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'Payment Status',
      defaultValue: 'not_required',
      options: [
        { label: 'Not Required',   value: 'not_required' },
        { label: 'Awaiting',       value: 'awaiting' },
        { label: 'Link Sent',      value: 'link_sent' },
        { label: 'Deposit Paid',   value: 'deposit_paid' },
        { label: 'Fully Paid',     value: 'fully_paid' },
        { label: 'Refund Pending', value: 'refund_pending' },
        { label: 'Refunded',       value: 'refunded' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'depositAmountEur',
      type: 'number',
      label: 'Deposit (EUR)',
      admin: { readOnly: true },
    },
    {
      name: 'cashBalanceEur',
      type: 'number',
      label: 'Cash Balance (EUR)',
      admin: {
        readOnly: true,
        description: 'Amount guide collects on tour day',
      },
    },
    {
      name: 'npsScore',
      type: 'number',
      label: 'NPS Score (0–10)',
      min: 0,
      max: 10,
      admin: { readOnly: true },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'stripeChargedCents',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Amount charged in smallest currency unit',
      },
    },
    {
      name: 'stripeChargeCurrency',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'chatwootConversationId',
      type: 'number',
      admin: { readOnly: true, description: 'Chatwoot conversation ID' },
    },
    {
      name: 'mauticContactId',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'twentyContactId',
      type: 'text',
      admin: { readOnly: true, description: 'Twenty CRM person ID' },
    },
  ],
}
