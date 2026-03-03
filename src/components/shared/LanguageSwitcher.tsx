'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const otherLocale = locale === 'en' ? 'ru' : 'en'
  const label = locale === 'en' ? 'RU' : 'EN'

  function switchLocale() {
    // Replace the locale prefix in the pathname
    const segments = pathname.split('/')
    segments[1] = otherLocale
    router.push(segments.join('/'))
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
