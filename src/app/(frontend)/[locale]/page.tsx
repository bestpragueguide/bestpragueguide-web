import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Hero } from '@/components/home/Hero'
import { TrustBar } from '@/components/home/TrustBar'
import { GuideProfile } from '@/components/home/GuideProfile'
import { FeaturedTours } from '@/components/home/FeaturedTours'
import { ProcessSteps } from '@/components/home/ProcessSteps'
import { TestimonialSliderWrapper } from '@/components/home/TestimonialSliderWrapper'
import { FAQSection } from '@/components/home/FAQSection'
import { CTASection } from '@/components/home/CTASection'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })

  return {
    title: t('homeTitle'),
    description: t('homeDesc'),
    openGraph: {
      title: t('homeTitle'),
      description: t('homeDesc'),
      type: 'website',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
    },
  }
}

export default function HomePage() {
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
    </>
  )
}
