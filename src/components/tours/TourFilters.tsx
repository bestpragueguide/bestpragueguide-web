'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface TourFiltersProps {
  availableCategories: string[]
  availableSubcategories: string[]
}

export function TourFilters({
  availableCategories,
  availableSubcategories,
}: TourFiltersProps) {
  const t = useTranslations('categories')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeCategory = searchParams.get('category') || 'all'
  const activeSubcategory = searchParams.get('subcategory') || 'all'

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
      if (key === 'category') params.delete('subcategory')
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const showSubcategories =
    activeCategory === 'prague-tours' &&
    availableSubcategories.length > 0

  return (
    <div className="mb-8 space-y-4">
      {/* Main categories */}
      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={activeCategory === 'all'}
          onClick={() => setFilter('category', 'all')}
        >
          {t('all')}
        </FilterPill>
        {availableCategories.includes('prague-tours') && (
          <FilterPill
            active={activeCategory === 'prague-tours'}
            onClick={() => setFilter('category', 'prague-tours')}
          >
            {t('pragueTours')}
          </FilterPill>
        )}
        {availableCategories.includes('day-trips-from-prague') && (
          <FilterPill
            active={activeCategory === 'day-trips-from-prague'}
            onClick={() => setFilter('category', 'day-trips-from-prague')}
          >
            {t('fromPrague')}
          </FilterPill>
        )}
      </div>

      {/* Subcategories */}
      {showSubcategories && (
        <div className="flex flex-wrap gap-2 pl-4 border-l-2 border-gold/30">
          <FilterPill
            active={activeSubcategory === 'all'}
            onClick={() => setFilter('subcategory', 'all')}
            small
          >
            {t('all')}
          </FilterPill>
          {availableSubcategories.includes('sightseeing') && (
            <FilterPill
              active={activeSubcategory === 'sightseeing'}
              onClick={() => setFilter('subcategory', 'sightseeing')}
              small
            >
              {t('sightseeing')}
            </FilterPill>
          )}
          {availableSubcategories.includes('beer-and-food') && (
            <FilterPill
              active={activeSubcategory === 'beer-and-food'}
              onClick={() => setFilter('subcategory', 'beer-and-food')}
              small
            >
              {t('beerAndFood')}
            </FilterPill>
          )}
        </div>
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  small,
  children,
}: {
  active: boolean
  onClick: () => void
  small?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} font-medium rounded-full transition-colors ${
        active
          ? 'bg-navy text-white'
          : 'bg-white text-navy border border-gray-light hover:border-navy'
      }`}
    >
      {children}
    </button>
  )
}
