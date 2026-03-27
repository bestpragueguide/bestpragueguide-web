import { JsonLd } from './JsonLd'

interface ReviewData {
  customerName: string
  rating: number
  body: string
}

interface TourSchemaProps {
  title: string
  description: string
  image?: string
  price?: number
  currency?: string
  duration: number
  rating?: number
  reviewCount?: number
  reviews?: ReviewData[]
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
  reviews,
  locale,
  slug,
}: TourSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
  const url = `${baseUrl}/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}/${slug}`

  // Price valid until end of next year
  const nextYear = new Date().getFullYear() + 1
  const priceValidUntil = `${nextYear}-12-31`

  const offers = price != null
    ? {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString().split('T')[0],
        priceValidUntil,
      }
    : undefined

  // TouristTrip — informational, no reviews/ratings
  const touristTrip: Record<string, unknown> = {
    '@type': 'TouristTrip',
    '@id': `${url}#trip`,
    name: title,
    description,
    url,
    touristType: 'Private Tour',
    provider: {
      '@type': 'TravelAgency',
      name: 'Best Prague Guide',
      url: baseUrl,
    },
    duration: `PT${duration}H`,
  }

  if (image) touristTrip.image = image
  if (offers) touristTrip.offers = offers

  // Service (not Product — avoids shipping/return policy requirements)
  const service: Record<string, unknown> = {
    '@type': 'TourProduct',
    '@id': `${url}#service`,
    name: title,
    description,
    url,
    category: 'Private Tours',
    brand: {
      '@type': 'Brand',
      name: 'Best Prague Guide',
    },
  }

  if (image) service.image = image
  if (offers) service.offers = offers

  // Add individual reviews (required by Google for review snippets)
  if (reviews && reviews.length > 0) {
    service.review = reviews.map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Person',
        name: r.customerName,
      },
      reviewBody: r.body,
    }))
  }

  // AggregateRating only when we have reviews
  if (rating && reviewCount && reviewCount > 0) {
    service.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    }
  }

  const data = {
    '@context': 'https://schema.org',
    '@graph': [touristTrip, service],
  }

  return <JsonLd data={data} />
}
