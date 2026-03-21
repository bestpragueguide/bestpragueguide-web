import type { GlobalConfig } from 'payload'
import { fullEditor } from '../lib/editors'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    group: 'Pages',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroTagline',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'heroSubtitle',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'heroCta',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'heroCtaHref',
              type: 'text',
              defaultValue: '/tours',
              admin: {
                description: 'Relative path without locale prefix (e.g. /tours)',
              },
            },
            {
              name: 'heroBackgroundImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'mobileHeroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional mobile-specific hero image with its own crop/focal point. Falls back to auto-generated mobileHero size from the main image.',
              },
            },
          ],
        },
        {
          label: 'Trust Bar',
          fields: [
            {
              name: 'trustBarItems',
              type: 'array',
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Experience (clock)', value: 'experience' },
                    { label: 'Guests (people)', value: 'guests' },
                    { label: 'Licensed (star)', value: 'licensed' },
                    { label: 'Curated (checkmark)', value: 'curated' },
                  ],
                },
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
          label: 'Guide Profile',
          fields: [
            {
              name: 'guideHeading',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'guideBio',
              type: 'richText',
              required: true,
              localized: true,
              editor: fullEditor,
            },
            {
              name: 'guideLearnMore',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'guideLearnMoreHref',
              type: 'text',
              defaultValue: '/about',
            },
            {
              name: 'guidePhoto',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Categories',
          fields: [
            {
              name: 'categoriesHeading',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'categories',
              type: 'array',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'href',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'e.g. /tours?category=prague-tours',
                  },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'How It Works',
          fields: [
            {
              name: 'processHeading',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'processSteps',
              type: 'array',
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Form', value: 'form' },
                    { label: 'Check', value: 'check' },
                    { label: 'Card', value: 'card' },
                    { label: 'Pin', value: 'pin' },
                  ],
                },
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
          label: 'Testimonials',
          fields: [
            {
              name: 'testimonialsHeading',
              type: 'text',
              required: true,
              localized: true,
            },
          ],
        },
        {
          label: 'FAQ Section',
          fields: [
            {
              name: 'faqSectionHeading',
              type: 'text',
              required: true,
              localized: true,
            },
          ],
        },
        {
          label: 'CTA',
          fields: [
            {
              name: 'ctaHeading',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'ctaSubtitle',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'ctaButtonLabel',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'ctaButtonHref',
              type: 'text',
              defaultValue: '/tours',
            },
            {
              name: 'ctaWhatsappLabel',
              type: 'text',
              required: true,
              localized: true,
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
                  maxLength: 160,
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
