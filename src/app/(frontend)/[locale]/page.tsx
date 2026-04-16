export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getHomepageData, getSiteSettings, getFAQItems } from '@/lib/cms-data'
import { Hero } from '@/components/home/Hero'
import { TrustBar } from '@/components/home/TrustBar'
import { GuideProfile } from '@/components/home/GuideProfile'
import { FeaturedTours } from '@/components/home/FeaturedTours'
import { ProcessSteps } from '@/components/home/ProcessSteps'
import { TestimonialSliderWrapper } from '@/components/home/TestimonialSliderWrapper'
import { FAQSectionWrapper } from '@/components/home/FAQSectionWrapper'
import { CTASection } from '@/components/home/CTASection'
// WebSiteSchema is injected via layout.tsx (sitewide)

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const homepage = await getHomepageData(locale)

  if (homepage.seo?.metaTitle) {
    const title = homepage.seo.metaTitle
    const description = homepage.seo.metaDescription || ''
    return {
      title,
      description,
      ...buildPageMetadata(locale, '', { title, description }),
    }
  }

  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('homeTitle')
  const description = t('homeDesc')

  return {
    title,
    description,
    ...buildPageMetadata(locale, '', { title, description }),
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const [homepageData, siteSettings, faqItems] = await Promise.all([
    getHomepageData(locale),
    getSiteSettings(locale),
    getFAQItems(locale, { homepageOnly: true }),
  ])

  return (
    <>
      <Hero data={homepageData} locale={locale} />
      <TrustBar items={homepageData.trustBarItems} />
      <GuideProfile data={homepageData} locale={locale} />
      <FeaturedTours data={homepageData} locale={locale} />
      <ProcessSteps data={homepageData} />
      <TestimonialSliderWrapper heading={homepageData.testimonialsHeading} locale={locale} />
      <FAQSectionWrapper heading={homepageData.faqSectionHeading} items={faqItems} />
      <CTASection data={homepageData} siteSettings={siteSettings} locale={locale} />
    </>
  )
}
