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
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
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
    // Landing page fields
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.template === 'landing',
        description: 'Hero image for the landing page',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
      admin: {
        condition: (data) => data?.template === 'landing',
        description: 'Subtitle below H1 — 1-2 sentences',
      },
    },
    {
      name: 'landingTourSlugs',
      type: 'text',
      admin: {
        condition: (data) => data?.template === 'landing',
        description: 'Comma-separated tour slugs to feature (e.g. "charles-bridge-old-town,prague-castle-lesser-town")',
      },
    },
    {
      name: 'faqItems',
      type: 'array',
      admin: {
        condition: (data) => data?.template === 'landing',
      },
      fields: [
        { name: 'question', type: 'text', required: true, localized: true },
        { name: 'answer', type: 'textarea', required: true, localized: true },
      ],
    },
  ],
}
