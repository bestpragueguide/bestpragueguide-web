import type { CollectionConfig } from 'payload'
import { fullEditor } from '../lib/editors'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'template', 'updatedAt'],
    group: 'Content',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: fullEditor,
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'template',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'About', value: 'about' },
        { label: 'Contact', value: 'contact' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Landing', value: 'landing' },
        { label: 'Legal', value: 'legal' },
      ],
    },
    {
      name: 'lastUpdated',
      type: 'text',
      localized: true,
      admin: {
        description: 'e.g. "Last updated: March 2026"',
        condition: (data) => data?.template === 'legal',
      },
    },
  ],
}
