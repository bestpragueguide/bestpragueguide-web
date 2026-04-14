import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/cms-data'
import { LandingPage } from '@/components/pages/LandingPage'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (locale !== 'en') return { title: 'Not Found' }
  const page = await getPageBySlug('prague-sightseeing-tour', locale)
  const title = page?.seo?.metaTitle || 'Prague Sightseeing Tour — Private Guide | Best Prague Guide'
  const description = page?.seo?.metaDescription || 'Private sightseeing tours in Prague — walking, car or full-day. All main landmarks with a licensed guide. Per-group pricing, hotel pickup available →'
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: 'Prague Sightseeing Tours',
    description: 'Private sightseeing tours of Prague — walking, car or full-day options with a licensed guide.',
    provider: {
      '@type': 'TravelAgency',
      name: 'Best Prague Guide',
      url: BASE_URL,
    },
    offers: [
      { '@type': 'Offer', name: 'Charles Bridge & Old Town Walking', price: '139', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/charles-bridge-old-town` },
      { '@type': 'Offer', name: 'Prague Castle & Lesser Town Walking', price: '139', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/prague-castle-lesser-town` },
      { '@type': 'Offer', name: 'All Prague in One Day', price: '289', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/all-prague-in-one-day` },
      { '@type': 'Offer', name: 'Best of Prague Car + Walking', price: '219', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/best-of-prague-car-tour` },
    ],
  }

  return <LandingPage page={page} locale={locale} schemaData={schemaData} />
}
