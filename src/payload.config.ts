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
import { ContactMessages } from './collections/ContactMessages'
import { FAQs } from './collections/FAQs'
import { Services } from './collections/Services'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Homepage } from './globals/Homepage'
import { AboutPage } from './globals/AboutPage'
import { ReviewsPage } from './globals/ReviewsPage'
import { PaymentConfig } from './globals/PaymentConfig'

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
    components: {
      afterNavLinks: ['./components/admin/TourOrderLink#TourOrderLink'],
    },
    livePreview: {
      url: ({ data, collectionConfig, globalConfig, locale }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        const loc = typeof locale === 'object' && locale !== null ? (locale as any).code || 'en' : String(locale || 'en')

        if (collectionConfig) {
          switch (collectionConfig.slug) {
            case 'tours':
              return `${baseUrl}/${loc}/tours/${data?.slug || ''}`
            case 'pages':
              return `${baseUrl}/${loc}/${data?.slug || ''}`
            case 'blog-posts':
              return `${baseUrl}/${loc}/blog/${data?.slug || ''}`
            default:
              return `${baseUrl}/${loc}`
          }
        }

        if (globalConfig) {
          switch (globalConfig.slug) {
            case 'homepage':
              return `${baseUrl}/${loc}`
            case 'about-page':
              return `${baseUrl}/${loc}/about`
            case 'reviews-page':
              return `${baseUrl}/${loc}/reviews`
            default:
              return `${baseUrl}/${loc}`
          }
        }

        return `${baseUrl}/${loc}`
      },
      collections: ['tours', 'pages', 'blog-posts'],
      globals: ['homepage', 'about-page', 'reviews-page', 'site-settings', 'navigation'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
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
    ContactMessages,
    FAQs,
    Services,
  ],

  globals: [SiteSettings, Navigation, Homepage, AboutPage, ReviewsPage, PaymentConfig],

  plugins: [],

  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com',

  sharp,

  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-in-production',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
