export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { Hero } from '@/components/home/Hero'
import { TrustBar } from '@/components/home/TrustBar'
import { GuideProfile } from '@/components/home/GuideProfile'
import { FeaturedTours } from '@/components/home/FeaturedTours'
import { ProcessSteps } from '@/components/home/ProcessSteps'
import { TestimonialSliderWrapper } from '@/components/home/TestimonialSliderWrapper'
import { FAQSection } from '@/components/home/FAQSection'
import { CTASection } from '@/components/home/CTASection'
import { WebSiteSchema } from '@/components/seo/WebSiteSchema'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
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

  return (
    <>
      <Hero />
      <TrustBar />
      <GuideProfile />
      <FeaturedTours />
      <ProcessSteps />
      <TestimonialSliderWrapper />
      <FAQSection />
      <CTASection />
      <WebSiteSchema locale={locale} />
    </>
  )
}
