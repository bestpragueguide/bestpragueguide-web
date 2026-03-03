import { JsonLd } from './JsonLd'

interface TourSchemaProps {
  title: string
  description: string
  image?: string
  price: number
  currency?: string
  duration: number
  rating?: number
  reviewCount?: number
  locale: string
  slug: string
}

export function TourSchema({
  title,
  description,
  image,
  price,
  currency = 'EUR',
  duration,
  rating,
  reviewCount,
  locale,
  slug,
}: TourSchemaProps) {
  const url = `https://bestpragueguide.com/${locale}/tours/${slug}`

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: title,
    description,
    url,
    touristType: 'Private Tour',
    provider: {
      '@type': 'TravelAgency',
      name: 'Best Prague Guide',
      url: 'https://bestpragueguide.com',
    },
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
    },
    duration: `PT${duration}H`,
  }

  if (image) {
    data.image = image
  }

  if (rating && reviewCount) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    }
  }

  return <JsonLd data={data} />
}
