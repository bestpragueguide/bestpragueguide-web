'use client'

import { useState } from 'react'
import { TourFilters } from './TourFilters'
import { TourGrid } from './TourGrid'
import type { TourPricing } from '@/lib/cms-types'

interface Tour {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  subcategory?: string | null
  groupPrice?: number
  pricing?: TourPricing
  heroImageUrl?: string | null
  mobileImageUrl?: string | null
  focalPoint?: string
  imageAlt?: string
}

interface TourCatalogProps {
  tours: Tour[]
  locale: string
  availableCategories: string[]
  availableSubcategories: string[]
}

export function TourCatalog({
  tours,
  locale,
  availableCategories,
  availableSubcategories,
}: TourCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <TourFilters
        availableCategories={availableCategories}
        availableSubcategories={availableSubcategories}
        onSearch={setSearchQuery}
      />
      <TourGrid tours={tours} locale={locale} searchQuery={searchQuery} />
    </>
  )
}
