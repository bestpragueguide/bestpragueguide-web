import { TourCard } from './TourCard'

interface RelatedTour {
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

interface TourRelatedProps {
  tours: RelatedTour[]
  locale: string
}

export function TourRelated({ tours, locale }: TourRelatedProps) {
  if (tours.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-heading font-bold text-navy mb-6">
        {locale === 'ru' ? 'Похожие экскурсии' : 'You May Also Like'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <TourCard
            key={tour.id}
            title={tour.title}
            slug={tour.slug}
            excerpt={tour.excerpt}
            duration={tour.duration}
            groupPrice={tour.groupPrice}
            rating={tour.rating}
            heroImageUrl={tour.heroImageUrl}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}
