'use client'

import { useSearchParams } from 'next/navigation'
import { TourCard } from './TourCard'
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

interface TourGridProps {
  tours: Tour[]
  locale: string
}

export function TourGrid({ tours, locale }: TourGridProps) {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')

  const filtered = tours.filter((tour) => {
    if (category && category !== 'all' && tour.category !== category) return false
    if (
      subcategory &&
      subcategory !== 'all' &&
      tour.subcategory !== subcategory
    )
      return false
    return true
  })

  if (filtered.length === 0) {
    const hasFilter = (category && category !== 'all') || (subcategory && subcategory !== 'all')
    return (
      <div className="text-center py-16 text-gray">
        <p className="text-lg">
          {hasFilter
            ? locale === 'ru'
              ? 'Экскурсии в этой категории не найдены'
              : 'No tours found for this category'
            : locale === 'ru'
              ? 'Экскурсии скоро появятся!'
              : 'Tours coming soon!'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((tour) => (
        <TourCard
          key={tour.id}
          title={tour.title}
          slug={tour.slug}
          excerpt={tour.excerpt}
          groupPrice={tour.groupPrice}
          pricing={tour.pricing}
          heroImageUrl={tour.heroImageUrl}
          mobileImageUrl={tour.mobileImageUrl}
          focalPoint={tour.focalPoint}
          imageAlt={tour.imageAlt}
          locale={locale}
        />
      ))}
    </div>
  )
}
