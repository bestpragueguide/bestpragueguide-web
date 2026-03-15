import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getFAQItems } from '@/lib/cms-data'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { FAQAccordion } from '@/components/shared/FAQAccordion'
import { JsonLd } from '@/components/seo/JsonLd'

const categoryLabels: Record<string, Record<string, string>> = {
  en: { booking: 'Booking', tours: 'Tours', logistics: 'Logistics', payment: 'Payment' },
  ru: { booking: 'Бронирование', tours: 'Экскурсии', logistics: 'Организация', payment: 'Оплата' },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('faqTitle')
  const description = t('faqDesc')

  return {
    title,
    description,
    ...buildPageMetadata(locale, 'faq', { title, description }),
  }
}

function extractPlainText(richText: any): string {
  if (!richText) return ''
  if (typeof richText === 'string') return richText
  if (richText.root?.children) {
    return richText.root.children
      .map((node: any) => {
        if (node.children) {
          return node.children.map((child: any) => child.text || '').join('')
        }
        return node.text || ''
      })
      .join('\n')
  }
  return ''
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const faqItems = await getFAQItems(locale)
  const tPages = await getTranslations({ locale, namespace: 'pages' })

  const labels = categoryLabels[locale] || categoryLabels.en

  // Group by category
  const categoryOrder = ['booking', 'tours', 'logistics', 'payment'] as const
  const grouped = categoryOrder
    .map((cat) => ({
      name: labels[cat] || cat,
      items: faqItems
        .filter((item) => item.category === cat)
        .map((item) => ({
          question: item.question,
          answer: extractPlainText(item.answer),
        })),
    }))
    .filter((group) => group.items.length > 0)

  // Fallback to i18n if no CMS items
  let categories = grouped
  if (categories.length === 0) {
    const t = await getTranslations({ locale, namespace: 'faq' })
    categories = [
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
  }

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

  const heading = tPages('faqHeading')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'FAQ' }]} locale={locale} />

      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-12">
        {heading}
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
