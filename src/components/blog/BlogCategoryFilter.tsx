'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { categoryLabels } from '@/lib/blog'

interface BlogCategoryFilterProps {
  availableCategories: string[]
  locale: string
}

export function BlogCategoryFilter({ availableCategories, locale }: BlogCategoryFilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeCategory = searchParams.get('category') || 'all'

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const allLabel = locale === 'ru' ? 'Все' : 'All'
  const labels = categoryLabels[locale] || categoryLabels.en

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <FilterPill active={activeCategory === 'all'} onClick={() => setCategory('all')}>
          {allLabel}
        </FilterPill>
        {availableCategories.map((cat) => (
          <FilterPill
            key={cat}
            active={activeCategory === cat}
            onClick={() => setCategory(cat)}
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
