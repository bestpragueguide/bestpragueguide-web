import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Best Prague Guide',
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'whatsappNumber',
      type: 'text',
    },
    {
      name: 'telegramHandle',
      type: 'text',
    },
    {
      name: 'businessHours',
      type: 'text',
      defaultValue: '09:00–20:00 CET',
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        {
          name: 'instagramUrl',
          type: 'text',
        },
        {
          name: 'youtubeUrl',
          type: 'text',
        },
        {
          name: 'tripAdvisorUrl',
          type: 'text',
        },
        {
          name: 'googleBusinessUrl',
          type: 'text',
        },
      ],
    },
    {
      name: 'announcement',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
        {
          name: 'link',
          type: 'text',
        },
      ],
    },
  ],
}
