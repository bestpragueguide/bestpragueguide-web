'use client'

import { useSearchParams } from 'next/navigation'
import { TourCard } from './TourCard'

interface Tour {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  subcategory?: string | null
  duration: number
  groupPrice: number
  rating?: number | null
  heroImageUrl?: string | null
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
    return (
      <div className="text-center py-16 text-gray">
        <p className="text-lg">
          {locale === 'ru'
            ? 'Экскурсии в этой категории скоро появятся!'
            : 'Tours in this category coming soon!'}
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
          category={tour.category}
          subcategory={tour.subcategory}
          duration={tour.duration}
          groupPrice={tour.groupPrice}
          rating={tour.rating}
          heroImageUrl={tour.heroImageUrl}
          locale={locale}
        />
      ))}
    </div>
  )
}
