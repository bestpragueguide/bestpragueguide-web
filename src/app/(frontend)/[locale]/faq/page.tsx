import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { FAQAccordion } from '@/components/shared/FAQAccordion'
import { JsonLd } from '@/components/seo/JsonLd'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('faqTitle'), description: t('faqDesc') }
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  const categories = [
    {
      name: t('bookingCategory'),
      items: [
        { question: t('q1'), answer: t('a1') },
        { question: t('q2'), answer: t('a2') },
        { question: t('q3'), answer: t('a3') },
      ],
    },
    {
      name: t('toursCategory'),
      items: [
        { question: t('q4'), answer: t('a4') },
        { question: t('q5'), answer: t('a5') },
        { question: t('q8'), answer: t('a8') },
        { question: t('q9'), answer: t('a9') },
      ],
    },
    {
      name: t('logisticsCategory'),
      items: [
        { question: t('q6'), answer: t('a6') },
        { question: t('q10'), answer: t('a10') },
      ],
    },
    {
      name: t('paymentCategory'),
      items: [{ question: t('q7'), answer: t('a7') }],
    },
  ]

  const allItems = categories.flatMap((c) => c.items)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'FAQ' }]} locale={locale} />

      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-12">
        {t('heading')}
      </h1>

      {categories.map((category, catIndex) => (
        <div key={catIndex} className="mb-10">
          <h2 className="text-xl font-heading font-semibold text-navy mb-4">
            {category.name}
          </h2>
          <FAQAccordion items={category.items} />
        </div>
      ))}

      <JsonLd data={faqSchema} />
    </div>
  )
}
