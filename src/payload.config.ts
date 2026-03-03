import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

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
      admin: { useAsTitle: 'email' },
      fields: [],
    },
  ],
  globals: [],

  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-in-production',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
