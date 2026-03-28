import type { Metadata } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

/**
 * Localized paths mirroring sitemap.ts and i18n/routing.ts
 */
const localizedPaths: Record<string, { en: string; ru: string }> = {
  '': { en: '', ru: '' },
  tours: { en: 'tours', ru: 'ekskursii' },
  about: { en: 'about', ru: 'o-nas' },
  reviews: { en: 'reviews', ru: 'otzyvy' },
  contact: { en: 'contact', ru: 'kontakty' },
  faq: { en: 'faq', ru: 'voprosy' },
  blog: { en: 'blog', ru: 'blog' },
  privacy: { en: 'privacy', ru: 'privacy' },
  terms: { en: 'terms', ru: 'terms' },
  'cancellation-policy': {
    en: 'cancellation-policy',
    ru: 'cancellation-policy',
  },
}

interface PageMetadataOverrides {
  title?: string
  description?: string
  ogImage?: string
}

/**
 * Builds canonical, hreflang, OG, and Twitter metadata for a static page.
 */
export function buildPageMetadata(
  locale: string,
  pageKey: string,
  overrides?: PageMetadataOverrides,
): Metadata {
  const paths = localizedPaths[pageKey]
  if (!paths) {
    return {}
  }

  const currentPath = locale === 'ru' ? paths.ru : paths.en
  const canonicalUrl = `${BASE_URL}/${locale}/${currentPath}`

  const ogImage = overrides?.ogImage || '/og-default.jpg'

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/en/${paths.en}`,
        ru: `${BASE_URL}/ru/${paths.ru}`,
        'x-default': `${BASE_URL}/en/${paths.en}`,
      },
    },
    openGraph: {
      siteName: 'Best Prague Guide',
      type: 'website',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: locale === 'ru' ? ['en_US'] : ['ru_RU'],
      url: canonicalUrl,
      ...(overrides?.title ? { title: overrides.title } : {}),
      ...(overrides?.description ? { description: overrides.description } : {}),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      ...(overrides?.title ? { title: overrides.title } : {}),
      ...(overrides?.description ? { description: overrides.description } : {}),
      images: [ogImage],
    },
  }
}
