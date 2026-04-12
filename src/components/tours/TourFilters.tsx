'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface TourFiltersProps {
  availableCategories: string[]
  availableSubcategories: string[]
  onSearch?: (query: string) => void
}

export function TourFilters({
  availableCategories,
  availableSubcategories,
  onSearch,
}: TourFiltersProps) {
  const t = useTranslations('categories')
  const tPages = useTranslations('pages')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeCategory = searchParams.get('category') || 'all'
  const activeSubcategory = searchParams.get('subcategory') || 'all'
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Notify parent of search changes instantly
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
    onSearch?.(value)

    // Debounce URL update (500ms)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, 500)
  }, [searchParams, router, pathname, onSearch])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
      if (key === 'category') params.delete('subcategory')
    } else {
      params.set(key, value)
    }
    if (searchValue) params.set('q', searchValue)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const showSubcategories =
    activeCategory === 'prague-tours' &&
    availableSubcategories.length > 0

  return (
    <div className="mb-8 space-y-4">
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
          placeholder={tPages('toursSearchPlaceholder')}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 text-sm border border-gray-light rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 bg-white text-navy placeholder:text-navy/40"
        />
      </div>

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
