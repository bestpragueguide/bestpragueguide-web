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
    defaultColumns: ['requestRef', 'customerName', 'tourName', 'preferredDate', 'status', 'customerLanguage', 'createdAt'],
    group: 'Bookings',
    listSearchableFields: ['requestRef', 'customerName', 'customerEmail', 'tourName'],
    components: {},
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
      type: 'tabs',
      tabs: [
        {
          label: 'Booking',
          fields: [
            {
              type: 'ui',
              name: 'bookingStatusBarUI',
              admin: {
                components: {
                  Field: '@/components/admin/BookingStatusBar#BookingStatusBar',
                },
              },
            },
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
              name: 'tourName',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Tour title in customer language (auto-filled)',
              },
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
              max: 1000,
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
              name: 'specialRequests',
              type: 'richText',
              editor: simplifiedEditor,
            },
            // guestCategoryBreakdown and selectedServices fields added after fix-schema creates columns
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
                { label: 'Offer Sent', value: 'offer-sent' },
                { label: 'Paid', value: 'paid' },
                { label: 'Completed', value: 'completed' },
                { label: 'No Show', value: 'no-show' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Declined', value: 'declined' },
              ],
            },
            {
              name: 'paymentMethod',
              type: 'select',
              defaultValue: 'cash_only',
              options: [
                { label: 'Stripe Deposit', value: 'stripe_deposit' },
                { label: 'Stripe Full Payment', value: 'stripe_full' },
                { label: 'Cash Only', value: 'cash_only' },
                { label: 'No Payment Required', value: 'none' },
              ],
              admin: { description: 'How the customer should pay' },
            },
            {
              name: 'customDepositAmount',
              type: 'number',
              admin: { description: 'Custom deposit in EUR. Leave empty for default %.' },
            },
          ],
        },
        {
          label: 'Tour Info',
          fields: [
            {
              name: 'guideName',
              type: 'text',
              admin: { description: 'Assigned guide name' },
            },
            {
              name: 'guidePhone',
              type: 'text',
              admin: { description: 'Guide phone (shown to customer after payment)' },
            },
            {
              name: 'meetingPointAddress',
              type: 'text',
              localized: true,
              admin: { description: 'Custom meeting point. Leave empty to use tour default.' },
            },
            {
              name: 'meetingPointInstructions',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: { description: 'Custom meeting instructions for this booking' },
            },
            {
              name: 'meetingPointMapUrl',
              type: 'text',
              admin: { description: 'Google Maps link. Leave empty to use tour default.' },
            },
            {
              name: 'customerNotes',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: { description: 'Notes visible to the customer on the booking page' },
            },
          ],
        },
        {
          label: 'Offer Details',
          fields: [
            {
              name: 'offerToken',
              type: 'text',
              unique: true,
              admin: { readOnly: true, description: 'Auto-generated secure token for booking page URL' },
            },
            {
              name: 'offerSentAt',
              type: 'date',
              admin: { readOnly: true, description: 'First offer sent' },
            },
            {
              name: 'lastUpdateSentAt',
              type: 'date',
              admin: { readOnly: true, description: 'Last update email sent' },
            },
            {
              name: 'offerExpiresAt',
              type: 'date',
              admin: { description: 'Optional offer expiry date', date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'confirmedDate',
              type: 'date',
              admin: { description: 'Final confirmed date (may differ from preferred)', date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' } },
            },
            {
              name: 'confirmedTime',
              type: 'text',
              admin: { description: 'Final confirmed time (HH:MM)' },
            },
            {
              name: 'confirmedPrice',
              type: 'number',
              admin: { description: 'Final confirmed price in booking currency' },
            },
            {
              name: 'confirmedGuests',
              type: 'number',
              admin: { description: 'Final confirmed guest count' },
            },
          ],
        },
        {
          label: 'Payment',
          fields: [
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
              name: 'stripePaymentLink',
              type: 'text',
              admin: { description: 'Stripe Payment Link' },
            },
            {
              name: 'depositAmount',
              type: 'number',
              label: 'Prepayment',
              admin: { readOnly: true },
            },
            {
              name: 'cashBalance',
              type: 'number',
              label: 'Balance on tour day',
              admin: {
                readOnly: true,
                description: 'Amount guide collects on tour day',
              },
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
              name: 'refundedAt',
              type: 'date',
              admin: { readOnly: true },
            },
            {
              name: 'totalPaid',
              type: 'number',
              label: 'Total Paid',
              admin: { readOnly: true, description: 'Running total of all payments minus refunds' },
            },
            {
              name: 'balanceDue',
              type: 'number',
              label: 'Balance Due',
              admin: { readOnly: true, description: 'Positive = customer owes more. Negative = refund available. Zero = settled.' },
            },
            {
              name: 'transactions',
              type: 'array',
              label: 'Transaction Ledger',
              admin: { description: 'All payments and refunds for this booking' },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Payment', value: 'payment' },
                    { label: 'Refund', value: 'refund' },
                  ],
                },
                {
                  name: 'amount',
                  type: 'number',
                  required: true,
                  label: 'Amount',
                },
                {
                  name: 'description',
                  type: 'text',
                },
                {
                  name: 'stripeId',
                  type: 'text',
                  label: 'Stripe ID',
                  admin: { readOnly: true },
                },
                {
                  name: 'recordedAt',
                  type: 'date',
                  admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
                },
              ],
            },
            {
              name: 'syncPayments',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/SyncPaymentsButton#SyncPaymentsButton',
                },
              },
            },
          ],
        },
        {
          label: 'CRM',
          fields: [
            {
              name: 'npsScore',
              type: 'number',
              label: 'NPS Score (0–10)',
              min: 0,
              max: 10,
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
              admin: { readOnly: true, description: 'Mautic contact ID' },
            },
            {
              name: 'twentyContactId',
              type: 'text',
              admin: { readOnly: true, description: 'Twenty CRM person ID' },
            },
          ],
        },
        {
          label: 'Metadata',
          fields: [
            {
              name: 'ipInfo',
              type: 'group',
              admin: { description: 'IP geolocation data from booking submission' },
              fields: [
                { name: 'ip', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'region', type: 'text' },
                { name: 'country', type: 'text' },
                { name: 'isp', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Internal',
          fields: [
            {
              name: 'internalNotes',
              type: 'richText',
              editor: fullEditor,
              admin: {
                description: 'Internal notes (not visible to customer)',
              },
            },
          ],
        },
      ],
    },
  ],
}
