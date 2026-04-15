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
  const page = await getPageBySlug('day-trips-from-prague', locale)
  const title = page?.seo?.metaTitle || 'Day Trips from Prague — Private Tours | Best Prague Guide'
  const description = page?.seo?.metaDescription || '10 private day trips from Prague with licensed guides. Castles, towns, breweries, memorials. Hotel pickup, comfortable car, flexible schedule →'
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/en/day-trips-from-prague` },
    openGraph: { title, description, url: `${BASE_URL}/en/day-trips-from-prague`, type: 'website' },
  }
}

export default async function DayTripsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale !== 'en') notFound()
  const page = await getPageBySlug('day-trips-from-prague', locale)
  if (!page) notFound()

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: 'Day Trips from Prague',
    description: '10 private day trips from Prague with licensed guides. Castles, UNESCO towns, breweries, and memorials.',
    provider: {
      '@type': 'TravelAgency',
      name: 'Best Prague Guide',
      url: BASE_URL,
    },
    offers: [
      { '@type': 'Offer', name: 'Cesky Krumlov Day Trip', price: '399', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/cesky-krumlov` },
      { '@type': 'Offer', name: 'Kutna Hora Day Trip', price: '349', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/kutna-hora` },
      { '@type': 'Offer', name: 'Karlovy Vary Day Trip', price: '399', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/karlsbad` },
      { '@type': 'Offer', name: 'Terezin Memorial Day Trip', price: '349', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/terezin-memorial` },
      { '@type': 'Offer', name: 'Karlstejn Castle Day Trip', price: '349', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/karlstejn-castle` },
      { '@type': 'Offer', name: 'Hluboka Castle Day Trip', price: '349', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/hluboka-castle` },
      { '@type': 'Offer', name: 'Cesky Sternberk Day Trip', price: '349', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/cesky-sternberk` },
      { '@type': 'Offer', name: 'Kozel Brewery Tour', price: '349', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/kozel-brewery-tour` },
      { '@type': 'Offer', name: 'Pilsner Urquell Brewery Tour', price: '349', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/pilsner-urquell-brewery` },
      { '@type': 'Offer', name: 'Skoda Factory Tour', price: '349', priceCurrency: 'EUR', url: `${BASE_URL}/en/tours/skoda-factory` },
    ],
  }

  return <LandingPage page={page} locale={locale} schemaData={schemaData} />
}
