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
  const page = await getPageBySlug('licensed-guide-prague', locale)
  const title = page?.seo?.metaTitle || 'Licensed Guide Prague — Certified Guides | Best Prague Guide'
  const description = page?.seo?.metaDescription || 'Hire a licensed, English-speaking Prague guide certified by the Czech Ministry. Professional team, private tours only →'
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Best Prague Guide',
    url: BASE_URL,
    description: 'Licensed private tour guide service in Prague. Every guide holds Czech Ministry certification.',
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional License',
      recognizedBy: {
        '@type': 'GovernmentOrganization',
        name: 'Czech Ministry of Education',
      },
    },
    telephone: '+420776306858',
    email: 'info@bestpragueguide.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Prague',
      addressCountry: 'CZ',
    },
  }

  return <LandingPage page={page} locale={locale} schemaData={schemaData} />
}
