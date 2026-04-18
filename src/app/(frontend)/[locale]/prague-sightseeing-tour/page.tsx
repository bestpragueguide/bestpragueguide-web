import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPageBySlug } from '@/lib/cms-data'
import { LandingPage } from '@/components/pages/LandingPage'
import { getDisplayPrice } from '@/lib/pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

const FALLBACK_TITLE = 'Prague Sightseeing Tour — Private Licensed Guide'
const FALLBACK_DESCRIPTION =
  'Private Prague sightseeing tour with a licensed Class II guide. Walking tours, day trips, specialty experiences — just your group, no strangers →'

// Tours featured in the TouristTrip schema. Covers all three categories:
// walking (charles-bridge / prague-castle), combined (all-prague, best-of-prague-car),
// day trips (cesky-krumlov, kutna-hora).
const SIGHTSEEING_SLUGS = [
  'charles-bridge-old-town',
  'prague-castle-lesser-town',
  'all-prague-in-one-day',
  'best-of-prague-car-tour',
  'cesky-krumlov',
  'kutna-hora',
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (locale !== 'en') return { title: 'Not Found' }
  const page = await getPageBySlug('prague-sightseeing-tour', locale)
  const title = page?.seo?.metaTitle || FALLBACK_TITLE
  const description = page?.seo?.metaDescription || FALLBACK_DESCRIPTION
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/en/prague-sightseeing-tour`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/en/prague-sightseeing-tour`,
      type: 'website',
    },
  }
}

export default async function SightseeingTourPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale !== 'en') notFound()
  const page = await getPageBySlug('prague-sightseeing-tour', locale)
  if (!page) notFound()

  const payload = await getPayload({ config })
  const toursResult = await payload.find({
    collection: 'tours',
    where: {
      status: { equals: 'published' },
      publishedLocales: { in: ['en'] },
      slug: { in: SIGHTSEEING_SLUGS },
    },
    limit: SIGHTSEEING_SLUGS.length,
    locale: 'en',
  })

  const offers = SIGHTSEEING_SLUGS
    .map((slug) => toursResult.docs.find((t: any) => t.slug === slug))
    .filter((t): t is any => Boolean(t))
    .map((tour: any) => {
      const priceInfo = tour.pricing?.model ? getDisplayPrice(tour.pricing) : null
      const price = priceInfo?.fromPrice ?? tour.groupPrice ?? null
      return price
        ? {
            '@type': 'Offer',
            name: tour.title,
            price: String(price),
            priceCurrency: 'EUR',
            url: `${BASE_URL}/en/tours/${tour.slug}`,
          }
        : null
    })
    .filter((o): o is NonNullable<typeof o> => o !== null)

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: 'Prague Sightseeing Tours',
    description:
      'Private Prague sightseeing tours led by Uliana Formina, a licensed Class II Czech guide. Covers walking tours of Prague, day trips to Český Krumlov / Kutná Hora / Karlštejn, and specialty experiences — just your group, no strangers.',
    provider: {
      '@type': 'TravelAgency',
      name: 'Best Prague Guide',
      url: BASE_URL,
    },
    offers,
  }

  return <LandingPage page={page} locale={locale} schemaData={schemaData} />
}
