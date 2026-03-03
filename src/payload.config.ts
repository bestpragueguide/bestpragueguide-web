import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { Tours } from './collections/Tours'
import { BookingRequests } from './collections/BookingRequests'
import { Reviews } from './collections/Reviews'
import { Pages } from './collections/Pages'
import { Media } from './collections/Media'
import { BlogPosts } from './collections/BlogPosts'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— Best Prague Guide',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: true,
  }),

  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Русский', code: 'ru' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },

  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email', group: 'Settings' },
      fields: [],
    },
    Tours,
    BookingRequests,
    Reviews,
    Pages,
    Media,
    BlogPosts,
  ],

  globals: [SiteSettings],

  plugins: [],

  sharp,

  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-in-production',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
