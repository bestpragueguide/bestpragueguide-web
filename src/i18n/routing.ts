import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/tours': { en: '/tours', ru: '/ekskursii' },
    '/tours/[slug]': { en: '/tours/[slug]', ru: '/ekskursii/[slug]' },
    '/about': { en: '/about', ru: '/o-nas' },
    '/reviews': { en: '/reviews', ru: '/otzyvy' },
    '/contact': { en: '/contact', ru: '/kontakty' },
    '/faq': { en: '/faq', ru: '/voprosy' },
    '/blog': { en: '/blog', ru: '/blog' },
    '/blog/[slug]': { en: '/blog/[slug]', ru: '/blog/[slug]' },
    '/privacy': { en: '/privacy', ru: '/privacy' },
    '/terms': { en: '/terms', ru: '/terms' },
    '/cancellation-policy': {
      en: '/cancellation-policy',
      ru: '/cancellation-policy',
    },
  },
})
