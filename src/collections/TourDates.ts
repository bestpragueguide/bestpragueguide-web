import type { CollectionConfig } from 'payload'
import type { FieldHook } from 'payload'

const setDisplayTitle: FieldHook = ({ data }) => {
  if (!data) return undefined
  const date = data.date
    ? new Date(data.date as string).toLocaleDateString('en-GB')
    : 'No date'
  return `${date} ${(data.startTime as string | undefined) ?? ''}`
}

export const TourDates: CollectionConfig = {
  slug: 'tour-dates',
  labels: { singular: 'Tour Date', plural: 'Tour Dates' },
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['displayTitle', 'tour', 'status', 'confirmedGuests', 'maxCapacity'],
    group: 'Tours',
  },
  fields: [
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      defaultValue: '10:00',
      admin: { description: '24-hour format, e.g. 10:00 or 14:30' },
    },
    {
      name: 'maxCapacity',
      type: 'number',
      required: true,
      defaultValue: 12,
      min: 1,
    },
    {
      name: 'confirmedGuests',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Updated automatically when bookings are confirmed',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: '🟢 Available',  value: 'available' },
        { label: '🟡 Limited',    value: 'limited' },
        { label: '🔴 Full',       value: 'full' },
        { label: '⚫ Unavailable', value: 'unavailable' },
        { label: '🔒 Private',    value: 'private' },
      ],
      defaultValue: 'available',
      admin: { position: 'sidebar' },
    },
    {
      name: 'displayTitle',
      type: 'text',
      admin: { hidden: true },
      hooks: { beforeChange: [setDisplayTitle] },
    },
    {
      name: 'priceNote',
      type: 'text',
      localized: true,
      admin: { description: 'Optional: shown on calendar, e.g. "Peak season rate"' },
    },
    {
      name: 'internalNote',
      type: 'textarea',
      admin: { description: 'Internal only — not shown to customers' },
    },
  ],
}
