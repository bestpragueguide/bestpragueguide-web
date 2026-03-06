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
  },
  timestamps: true,
  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [afterChangeHook],
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
  ],
}
