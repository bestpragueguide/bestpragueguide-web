import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/cms-data'
import { buildPageMetadata } from '@/lib/metadata'
import { LandingPage } from '@/components/pages/LandingPage'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (locale !== 'en') return { title: 'Not Found' }
  const page = await getPageBySlug('private-walking-tour-prague', locale)
  const title = page?.seo?.metaTitle || 'Private Walking Tours in Prague | Best Prague Guide'
  const description = page?.seo?.metaDescription || 'Four private walking tours with licensed local guides. Old Town, Castle, Jewish Quarter or full-day. Per-group pricing, no strangers →'
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: 'Private Walking Tours in Prague',
    description: 'Four private walking tours with licensed local guides covering Old Town, Prague Castle, Jewish Quarter, and underground Prague.',
    provider: {
      '@type': 'TravelAgency',
      name: 'Best Prague Guide',
      url: BASE_URL,
    },
    offers: [
      { '@type': 'Offer', name: 'Charles Bridge & Old Town', price: '139', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/charles-bridge-old-town` },
      { '@type': 'Offer', name: 'Prague Castle & Lesser Town', price: '139', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/prague-castle-lesser-town` },
      { '@type': 'Offer', name: 'All Prague in One Day', price: '289', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/all-prague-in-one-day` },
      { '@type': 'Offer', name: 'Hidden Prague Underground', price: '129', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/hidden-prague-underground-alchemy` },
    ],
  }

  return <LandingPage page={page} locale={locale} schemaData={schemaData} />
}
