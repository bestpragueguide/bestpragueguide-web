import { JsonLd } from './JsonLd'

interface TourSchemaProps {
  title: string
  description: string
  image?: string
  price?: number
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
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
  const url = `${baseUrl}/${locale}/tours/${slug}`

  const offers = price != null
    ? {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString().split('T')[0],
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: price.toString(),
          priceCurrency: currency,
          unitText: 'per group',
        },
      }
    : {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString().split('T')[0],
      }

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
    offers,
    duration: `PT${duration}H`,
  }

  if (image) {
    touristTrip.image = image
  }

  if (rating && reviewCount) {
    touristTrip.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    }
  }

  const product: Record<string, unknown> = {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: title,
    description,
    url,
    category: 'Private Tours',
    brand: {
      '@type': 'Brand',
      name: 'Best Prague Guide',
    },
    offers,
  }

  if (image) {
    product.image = image
  }

  if (rating && reviewCount) {
    product.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    }
  }

  const data = {
    '@context': 'https://schema.org',
    '@graph': [touristTrip, product],
  }

  return <JsonLd data={data} />
}
