import { TourCard } from './TourCard'
import type { TourPricing } from '@/lib/cms-types'

interface RelatedTour {
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

interface TourRelatedProps {
  tours: RelatedTour[]
  locale: string
}

export function TourRelated({ tours, locale }: TourRelatedProps) {
  if (tours.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-heading font-bold text-navy mb-6">
        {locale === 'ru' ? 'Смотрите также' : 'You May Also Like'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
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
    </div>
  )
}
