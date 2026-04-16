import { JsonLd } from './JsonLd'

interface ReviewData {
  customerName: string
  rating: number
  body: string
}

interface PricingTier {
  price?: number | null
  label?: string
  onRequest?: boolean
}

interface TourSchemaProps {
  title: string
  description: string
  image?: string
  pricing?: { model?: string; groupTiers?: PricingTier[] }
  duration?: number
  rating?: number
  reviewCount?: number
  reviews?: ReviewData[]
  locale: string
  slug: string
  category?: string
}

export function TourSchema({
  title,
  description,
  image,
  pricing,
  duration,
  rating,
  reviewCount,
  reviews,
  locale,
  slug,
  category,
}: TourSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
  const tourPath = locale === 'ru' ? 'ekskursii' : 'tours'
  const url = `${baseUrl}/${locale}/${tourPath}/${slug}`

  // Compute price range from tiers
  const tiers = (pricing?.groupTiers || []).filter(t => !t.onRequest && t.price != null)
  const prices = tiers.map(t => t.price!).filter(p => p > 0)
  const lowPrice = prices.length > 0 ? Math.min(...prices) : null
  const highPrice = prices.length > 0 ? Math.max(...prices) : null

  // Duration in ISO 8601
  const isoDuration = duration ? `PT${Math.floor(duration)}H${duration % 1 ? '30M' : ''}` : undefined

  // Build offers
  const offers: Record<string, unknown> | undefined = lowPrice ? {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: lowPrice.toString(),
    highPrice: (highPrice || lowPrice).toString(),
    availability: 'https://schema.org/InStock',
    url,
    offerCount: tiers.length.toString(),
    offers: tiers.map(t => ({
      '@type': 'Offer',
      name: t.label || 'Group tour',
      price: t.price!.toString(),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
    })),
  } : undefined

  // Determine tourist type from category
  const touristTypes: string[] = []
  if (category === 'prague-tours') {
    touristTypes.push('First-time visitors', 'Couples', 'Families', 'History enthusiasts')
  } else if (category === 'day-trips-from-prague') {
    touristTypes.push('Day trippers', 'Couples', 'Families', 'Small groups')
  }

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['TouristTrip', 'Product'],
    '@id': `${url}#trip`,
    name: title,
    description,
    url,
    provider: { '@id': `${baseUrl}/#organization` },
    brand: { '@type': 'Brand', name: 'Best Prague Guide' },
    category: category === 'day-trips-from-prague' ? 'Day Trips' : 'Private Tours',
  }

  if (image) data.image = image
  if (isoDuration) data.duration = isoDuration
  if (touristTypes.length > 0) data.touristType = touristTypes
  if (offers) data.offers = offers

  // Individual reviews
  if (reviews && reviews.length > 0) {
    data.review = reviews.map(r => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      author: { '@type': 'Person', name: r.customerName },
      reviewBody: r.body,
    }))
  }

  // AggregateRating only with real data
  if (rating && reviewCount && reviewCount >= 5) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    }
  }

  return <JsonLd data={data} />
}
