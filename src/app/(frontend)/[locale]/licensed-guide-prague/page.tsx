import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/cms-data'
import { LandingPage } from '@/components/pages/LandingPage'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

const FALLBACK_TITLE = 'Licensed Tour Guide in Prague — Uliana Formina'
const FALLBACK_DESCRIPTION =
  'Licensed Class II Czech guide in Prague since 2009. WFTGA member. 10,000+ guests. Private tours only — just your group, no strangers. Book direct →'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (locale !== 'en') return { title: 'Not Found' }
  const page = await getPageBySlug('licensed-guide-prague', locale)
  const title = page?.seo?.metaTitle || FALLBACK_TITLE
  const description = page?.seo?.metaDescription || FALLBACK_DESCRIPTION
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/en/licensed-guide-prague`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/en/licensed-guide-prague`,
      type: 'website',
    },
  }
}

export default async function LicensedGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale !== 'en') notFound()
  const page = await getPageBySlug('licensed-guide-prague', locale)
  if (!page) notFound()

  return <LandingPage page={page} locale={locale} />
}
