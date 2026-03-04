'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'

const pathMap: Record<string, Record<string, string>> = {
  tours: { ru: 'ekskursii' },
  ekskursii: { en: 'tours' },
  about: { ru: 'o-nas' },
  'o-nas': { en: 'about' },
  reviews: { ru: 'otzyvy' },
  otzyvy: { en: 'reviews' },
  contact: { ru: 'kontakty' },
  kontakty: { en: 'contact' },
  faq: { ru: 'voprosy' },
  voprosy: { en: 'faq' },
}

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()

  const otherLocale = locale === 'en' ? 'ru' : 'en'
  const label = locale === 'en' ? 'RU' : 'EN'

  function switchLocale() {
    // 1. Try hreflang link from metadata (works for pages with alternates.languages)
    const link = document.querySelector(
      `link[rel="alternate"][hreflang="${otherLocale}"]`,
    ) as HTMLLinkElement | null
    if (link?.href) {
      try {
        const url = new URL(link.href)
        window.location.href = url.pathname
        return
      } catch {
        // Fall through
      }
    }

    // 2. Fallback: manually map known path segments
    const segments = pathname.split('/')
    // segments: ['', 'en', 'tours', ...]
    segments[1] = otherLocale
    if (segments[2] && pathMap[segments[2]]?.[otherLocale]) {
      segments[2] = pathMap[segments[2]][otherLocale]
    }
    window.location.href = segments.join('/')
  }

  return (
    <button
      onClick={switchLocale}
      className={`px-3 py-1.5 text-sm font-medium border border-navy/20 rounded-md hover:bg-navy hover:text-white transition-colors ${className}`}
      aria-label={`Switch to ${otherLocale === 'en' ? 'English' : 'Русский'}`}
    >
      {label}
    </button>
  )
}
