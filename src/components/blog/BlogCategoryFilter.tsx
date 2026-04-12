'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { categoryLabels } from '@/lib/blog'

interface BlogCategoryFilterProps {
  availableCategories: string[]
  locale: string
}

export function BlogCategoryFilter({ availableCategories, locale }: BlogCategoryFilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tPages = useTranslations('pages')

  const activeCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('q') || ''

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const allLabel = locale === 'ru' ? 'Все' : 'All'
  const labels = categoryLabels[locale] || categoryLabels.en

  return (
    <div className="mb-8 space-y-4">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder={tPages('blogSearchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setParam('q', e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 text-sm border border-gray-light rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 bg-white text-navy placeholder:text-navy/40"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <FilterPill active={activeCategory === 'all'} onClick={() => setParam('category', 'all')}>
          {allLabel}
        </FilterPill>
        {availableCategories.map((cat) => (
          <FilterPill
            key={cat}
            active={activeCategory === cat}
            onClick={() => setParam('category', cat)}
          >
            {labels[cat] || cat}
          </FilterPill>
        ))}
      </div>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
        active
          ? 'bg-navy text-white'
          : 'bg-white text-navy border border-gray-light hover:border-navy'
      }`}
    >
      {children}
    </button>
  )
}
