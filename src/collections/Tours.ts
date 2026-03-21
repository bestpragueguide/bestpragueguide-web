import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'
import { simplifiedEditor, fullEditor } from '../lib/editors'

const indexNowAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation }) => {
  // Only ping when a tour is published (or updated while published)
  if (doc.status !== 'published') return doc
  if (operation === 'update' && previousDoc?.status === doc.status && previousDoc?.slug === doc.slug) {
    // No status or slug change on update — skip to avoid noise
    return doc
  }
  try {
    const { pingTour } = await import('../lib/indexnow')
    const publishedLocales = doc.publishedLocales || []
    // Build slug map — doc has the current locale's slug, fetch other if needed
    const slugs: Record<string, string> = {}
    for (const loc of publishedLocales) {
      slugs[loc] = doc.slug // Payload returns the locale-specific slug based on request locale
    }
    pingTour(doc.id, publishedLocales, slugs).catch(console.error)
  } catch (err) {
    console.error('[IndexNow] Tour hook error:', err)
  }
  return doc
}

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'subcategory', 'status'],
    group: 'Content',
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [indexNowAfterChange],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'excerpt',
              type: 'richText',
              required: true,
              localized: true,
              editor: simplifiedEditor,
            },
            {
              name: 'description',
              type: 'richText',
              required: true,
              localized: true,
            },
            {
              name: 'included',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'text',
                  type: 'richText',
                  required: true,
                  editor: simplifiedEditor,
                },
              ],
            },
            {
              name: 'excluded',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'text',
                  type: 'richText',
                  required: true,
                  editor: simplifiedEditor,
                },
              ],
            },
            {
              name: 'faq',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'answer',
                  type: 'richText',
                  required: true,
                  editor: fullEditor,
                },
              ],
            },
            {
              name: 'category',
              type: 'select',
              required: true,
              options: [
                { label: 'Prague Tours', value: 'prague-tours' },
                { label: 'Day Trips from Prague', value: 'day-trips-from-prague' },
              ],
            },
            {
              name: 'subcategory',
              type: 'select',
              options: [
                { label: 'Sightseeing', value: 'sightseeing' },
                { label: 'Beer and Food', value: 'beer-and-food' },
              ],
              admin: {
                condition: (data) => data?.category === 'prague-tours',
              },
            },
            {
              name: 'duration',
              type: 'number',
              required: true,
              admin: {
                description: 'Duration in hours (e.g. 3.5)',
              },
            },
            {
              name: 'preferredTimes',
              type: 'select',
              hasMany: true,
              options: Array.from({ length: 48 }, (_, i) => {
                const h = String(Math.floor(i / 2)).padStart(2, '0')
                const m = i % 2 === 0 ? '00' : '30'
                return { label: `${h}:${m}`, value: `${h}:${m}` }
              }),
              admin: {
                description: 'Custom available times for this tour. If empty, default times (9:00–18:00 every 30 min) are shown.',
              },
            },
            {
              name: 'maxGroupSize',
              type: 'number',
              admin: { description: 'Leave empty for unlimited' },
            },
            {
              name: 'meetingPoint',
              type: 'group',
              fields: [
                {
                  name: 'address',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'mapUrl',
                  type: 'text',
                  admin: { description: 'Google Maps link to the meeting point' },
                },
                {
                  name: 'instructions',
                  type: 'richText',
                  localized: true,
                  editor: simplifiedEditor,
                },
              ],
            },
            {
              name: 'difficulty',
              type: 'select',
              options: [
                { label: 'Easy', value: 'easy' },
                { label: 'Moderate', value: 'moderate' },
                { label: 'Active', value: 'active' },
              ],
            },
            {
              name: 'tags',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Best Seller', value: 'best-seller' },
                { label: 'Top Rated', value: 'top-rated' },
                { label: 'Hidden Gem', value: 'hidden-gem' },
                { label: 'Free Cancellation', value: 'free-cancel' },
                { label: 'Family Friendly', value: 'family-friendly' },
                { label: 'Accessible', value: 'accessible' },
                { label: 'Transport Included', value: 'transport' },
              ],
            },
            {
              name: 'relatedTours',
              type: 'relationship',
              relationTo: 'tours',
              hasMany: true,
              admin: {
                description: 'Select tours to show in "You May Also Like" section. If empty, tours from the same category are shown automatically.',
              },
            },
          ],
        },
        {
          label: 'Images',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'mobileHeroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional mobile-specific hero image. Falls back to heroImage if empty.',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'alt',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'mobileImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Optional mobile-specific image. Falls back to main image.',
                  },
                },
                {
                  name: 'objectFit',
                  type: 'select',
                  defaultValue: 'cover',
                  options: [
                    { label: 'Cover (fill & crop)', value: 'cover' },
                    { label: 'Contain (show all)', value: 'contain' },
                    { label: 'Fill (stretch)', value: 'fill' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            {
              name: 'pricing',
              type: 'group',
              fields: [
                {
                  name: 'model',
                  type: 'select',
                  required: true,
                  defaultValue: 'GROUP_TIERS',
                  options: [
                    { label: 'Group Tiers', value: 'GROUP_TIERS' },
                    { label: 'Per Person', value: 'PER_PERSON' },
                    { label: 'Flat Rate', value: 'FLAT_RATE' },
                    { label: 'On Request', value: 'ON_REQUEST' },
                  ],
                  admin: {
                    description: 'How pricing is calculated for this tour',
                  },
                },
                {
                  name: 'groupTiers',
                  type: 'array',
                  admin: {
                    condition: (data) => data?.pricing?.model === 'GROUP_TIERS',
                    description: 'Price tiers by group size. Add rows from smallest to largest group.',
                  },
                  fields: [
                    { name: 'minGuests', type: 'number', required: true },
                    { name: 'maxGuests', type: 'number', admin: { description: 'Empty = no upper limit' } },
                    { name: 'price', type: 'number', admin: { description: 'EUR. Empty = on request' } },
                    { name: 'onRequest', type: 'checkbox', defaultValue: false },
                  ],
                },
                {
                  name: 'perPersonPrice',
                  type: 'number',
                  admin: {
                    condition: (data) => data?.pricing?.model === 'PER_PERSON',
                    description: 'Price per guest in EUR',
                  },
                },
                {
                  name: 'perPersonMaxGuests',
                  type: 'number',
                  admin: {
                    condition: (data) => data?.pricing?.model === 'PER_PERSON',
                    description: 'Groups above this size → Contact us',
                  },
                },
                {
                  name: 'flatRatePrice',
                  type: 'number',
                  admin: {
                    condition: (data) => data?.pricing?.model === 'FLAT_RATE',
                    description: 'Flat price in EUR regardless of group size',
                  },
                },
                {
                  name: 'flatRateMaxGuests',
                  type: 'number',
                  admin: {
                    condition: (data) => data?.pricing?.model === 'FLAT_RATE',
                    description: 'Max group size for flat rate. Larger → Contact us',
                  },
                },
                {
                  name: 'onRequestNote',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Custom note shown when price is on request',
                  },
                },
                {
                  name: 'guestCategoriesHeading',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Custom heading for guest categories section (e.g. "Zoo/Museum Ticket", "Entry Tickets"). Defaults to "Guest Categories".',
                  },
                },
                {
                  name: 'guestCategories',
                  type: 'array',
                  admin: {
                    description: 'Guest options with price modifiers — use for ticket types, age categories, or any per-guest selection',
                  },
                  fields: [
                    { name: 'label', type: 'text', required: true, localized: true, admin: { description: 'Category name shown to customer (e.g. "Adult", "Child 6-15", "Student")' } },
                    { name: 'ageMin', type: 'number' },
                    { name: 'ageMax', type: 'number', admin: { description: 'Empty = no upper limit' } },
                    { name: 'priceModifier', type: 'number', admin: { description: 'Price adjustment in EUR (e.g. 15 for +€15)' } },
                    { name: 'isFree', type: 'checkbox', defaultValue: false },
                    { name: 'onRequest', type: 'checkbox', defaultValue: false },
                  ],
                },
                {
                  name: 'additionalServices',
                  type: 'array',
                  admin: {
                    description: 'Optional add-on services for this tour',
                  },
                  fields: [
                    {
                      name: 'service',
                      type: 'relationship',
                      relationTo: 'services',
                      required: true,
                    },
                    {
                      name: 'overridePricing',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { description: 'Override global service pricing for this tour' },
                    },
                    {
                      name: 'customPricingNote',
                      type: 'text',
                      localized: true,
                      admin: {
                        condition: (_, siblingData) => siblingData?.overridePricing,
                        description: 'Custom pricing note for this tour',
                      },
                    },
                  ],
                },
              ],
            },
            // DEPRECATED — kept for backward compat during migration
            {
              name: 'groupPrice',
              type: 'number',
              admin: { hidden: true },
            },
            {
              name: 'groupSurchargePercent',
              type: 'number',
              admin: { hidden: true },
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
                {
                  name: 'noIndex',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar fields
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedLocales',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Русский', value: 'ru' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Which locales show this tour in the catalog',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        position: 'sidebar',
        description: 'Average rating (updated manually or via hook)',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
