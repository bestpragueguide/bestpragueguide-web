import type { CollectionConfig } from 'payload'

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'subcategory', 'groupPrice', 'status'],
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 200,
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
          type: 'text',
          required: true,
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
          type: 'text',
          required: true,
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
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Prague Tours', value: 'prague-tours' },
        { label: 'From Prague', value: 'from-prague' },
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
      name: 'maxGroupSize',
      type: 'number',
      defaultValue: 8,
    },
    {
      name: 'groupPrice',
      type: 'number',
      required: true,
      admin: {
        description: 'Price in EUR (whole euros) per group up to 4 people',
      },
    },
    {
      name: 'groupSurchargePercent',
      type: 'number',
      defaultValue: 30,
      admin: {
        description: 'Surcharge percentage for groups of 5-8',
      },
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
          name: 'lat',
          type: 'number',
        },
        {
          name: 'lng',
          type: 'number',
        },
        {
          name: 'instructions',
          type: 'textarea',
          localized: true,
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
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
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
      ],
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
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
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
        description: 'Average rating (updated manually or via hook)',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
