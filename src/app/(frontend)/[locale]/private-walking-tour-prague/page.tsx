import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPageBySlug } from '@/lib/cms-data'
import { LandingPage } from '@/components/pages/LandingPage'
import { getDisplayPrice } from '@/lib/pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

const FALLBACK_TITLE = 'Private Walking Tour in Prague — Licensed Guide'
const FALLBACK_DESCRIPTION =
  'Private walking tour in Prague with a licensed Class II guide. Just your group — no strangers, no mixed groups, no OTA middleman. Book direct →'

const WALKING_SLUGS = [
  'charles-bridge-old-town',
  'prague-castle-lesser-town',
  'hidden-prague-underground-alchemy',
  'all-prague-in-one-day',
  'best-of-prague-car-tour',
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (locale !== 'en') return { title: 'Not Found' }
  const page = await getPageBySlug('private-walking-tour-prague', locale)
  const title = page?.seo?.metaTitle || FALLBACK_TITLE
  const description = page?.seo?.metaDescription || FALLBACK_DESCRIPTION
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/en/private-walking-tour-prague`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/en/private-walking-tour-prague`,
      type: 'website',
    },
  }
}

export default async function PrivateWalkingTourPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale !== 'en') notFound()
  const page = await getPageBySlug('private-walking-tour-prague', locale)
  if (!page) notFound()

  const payload = await getPayload({ config })
  const toursResult = await payload.find({
    collection: 'tours',
    where: {
      status: { equals: 'published' },
      publishedLocales: { in: ['en'] },
      slug: { in: WALKING_SLUGS },
    },
    limit: WALKING_SLUGS.length,
    locale: 'en',
  })

  const offers = WALKING_SLUGS
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
    name: 'Private Walking Tours in Prague',
    description:
      'Private walking tours of Prague led by Uliana Formina, a licensed Class II Czech guide. Just your group — no strangers, no mixed groups. Covers Old Town, Prague Castle, Jewish Quarter, underground Prague, and full-day walking itineraries.',
    provider: {
      '@type': 'TravelAgency',
      name: 'Best Prague Guide',
      url: BASE_URL,
    },
    offers,
  }

  return <LandingPage page={page} locale={locale} schemaData={schemaData} />
}
