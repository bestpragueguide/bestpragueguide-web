import type { GlobalConfig } from 'payload'
import { fullEditor } from '../lib/editors'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  admin: {
    group: 'Pages',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Founder',
          fields: [
            {
              name: 'founderPhoto',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'founderHeading',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'founderBio',
              type: 'richText',
              required: true,
              localized: true,
              editor: fullEditor,
            },
            {
              name: 'founderQuote',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          label: 'Stats',
          fields: [
            {
              name: 'stats',
              type: 'array',
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'e.g. "17+", "10,000+", "EN + RU"',
                  },
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Team',
          fields: [
            {
              name: 'teamHeading',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'teamDescription',
              type: 'richText',
              localized: true,
              editor: fullEditor,
            },
            {
              name: 'teamPhotos',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            {
              name: 'teamBadges',
              type: 'array',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Values',
          fields: [
            {
              name: 'valuesHeading',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'values',
              type: 'array',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'text',
                  required: true,
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Gallery',
          fields: [
            {
              name: 'galleryPhotos',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'CTA',
          fields: [
            {
              name: 'ctaPrimaryLabel',
              type: 'text',
              localized: true,
            },
            {
              name: 'ctaPrimaryHref',
              type: 'text',
              defaultValue: '/tours',
            },
            {
              name: 'ctaSecondaryLabel',
              type: 'text',
              localized: true,
            },
            {
              name: 'ctaSecondaryHref',
              type: 'text',
              defaultValue: '/contact',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
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
          ],
        },
      ],
    },
  ],
}
