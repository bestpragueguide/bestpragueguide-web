'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

export function ReviewFilter() {
  const t = useTranslations('reviews')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeLang = searchParams.get('lang') || 'all'

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('lang')
    } else {
      params.set('lang', value)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const options = [
    { value: 'all', label: t('filterAll') },
    { value: 'en', label: t('filterEn') },
    { value: 'ru', label: t('filterRu') },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setFilter(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeLang === option.value
              ? 'bg-navy text-white'
              : 'bg-white text-navy border border-gray-light hover:border-navy'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
