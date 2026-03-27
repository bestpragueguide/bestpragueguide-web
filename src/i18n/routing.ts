import { defineRouting } from 'next-intl/routing'

/** Map of EN paths → RU paths for localized URL segments */
const ruPathMap: Record<string, string> = {
  '/tours': '/ekskursii',
  '/about': '/o-nas',
  '/reviews': '/otzyvy',
  '/contact': '/kontakty',
  '/faq': '/voprosy',
}

/**
 * Localize a CMS href (e.g. "/tours") for a given locale.
 * Prepends /{locale} and translates known path segments for RU.
 * Preserves query strings.
 */
export function localizeHref(href: string, locale: string): string {
  if (!href.startsWith('/')) return href
  if (locale === 'ru') {
    // Replace known path prefixes, preserving query string
    for (const [en, ru] of Object.entries(ruPathMap)) {
      if (href === en || href.startsWith(`${en}?`) || href.startsWith(`${en}/`)) {
        return `/${locale}${ru}${href.slice(en.length)}`
      }
    }
  }
  return `/${locale}${href}`
}

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localeDetection: true,
  localePrefix: 'always',
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
    '/booking/payment-success': '/booking/payment-success',
    '/booking/payment-cancelled': '/booking/payment-cancelled',
    '/booking/[token]': '/booking/[token]',
    '/booking': '/booking',
  },
})
