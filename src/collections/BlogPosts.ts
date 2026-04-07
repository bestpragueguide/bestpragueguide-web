import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'
import { simplifiedEditor } from '../lib/editors'

const indexNowAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation }) => {
  if (doc.status !== 'published') return doc
  if (operation === 'update' && previousDoc?.status === doc.status && previousDoc?.slug === doc.slug) {
    return doc
  }
  try {
    const { pingBlogPost } = await import('../lib/indexnow')
    const publishedLocales = doc.publishedLocales || []
    const slugs: Record<string, string> = {}
    for (const loc of publishedLocales) {
      slugs[loc] = doc.slug
    }
    pingBlogPost(doc.id, publishedLocales, slugs).catch(console.error)
  } catch (err) {
    console.error('[IndexNow] Blog hook error:', err)
  }
  return doc
}

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
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
      type: 'richText',
      required: true,
      localized: true,
      editor: simplifiedEditor,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Prague Guide', value: 'prague-guide' },
        { label: 'Food and Drink', value: 'food-and-drink' },
        { label: 'Day Trips', value: 'day-trips' },
        { label: 'Tips', value: 'tips' },
        { label: 'History', value: 'history' },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: 'Uliana Formina',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
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
      name: 'publishedLocales',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Русский', value: 'ru' },
      ],
      defaultValue: ['en', 'ru'],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
