'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { useAlternateLocaleHref } from './AlternateLocaleContext'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const alternateHref = useAlternateLocaleHref()

  const otherLocale = locale === 'en' ? 'ru' : 'en'
  const label = locale === 'en' ? 'RU' : 'EN'

  function switchLocale() {
    if (alternateHref) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(alternateHref as any)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace(pathname as any, { locale: otherLocale })
    }
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
