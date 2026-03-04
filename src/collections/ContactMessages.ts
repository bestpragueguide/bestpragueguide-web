import type { CollectionConfig } from 'payload'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'phone', 'status', 'createdAt'],
    group: 'Bookings',
    listSearchableFields: ['name', 'email', 'phone', 'message'],
  },
  timestamps: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Русский', value: 'ru' },
      ],
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'Replied', value: 'replied' },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not visible to customer)',
      },
    },
  ],
}
