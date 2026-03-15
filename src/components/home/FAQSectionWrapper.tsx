import { FAQSection } from './FAQSection'
import { JsonLd } from '@/components/seo/JsonLd'
import type { FAQItem } from '@/lib/cms-types'

interface FAQSectionWrapperProps {
  heading: string
  items: FAQItem[]
}

export function FAQSectionWrapper({ heading, items }: FAQSectionWrapperProps) {
  // Convert richText answers to plain text for the homepage accordion
  const faqItems = items.map((item) => ({
    question: item.question,
    answer: extractPlainText(item.answer),
  }))

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <FAQSection heading={heading} items={faqItems} />
      <JsonLd data={faqSchema} />
    </>
  )
}

function extractPlainText(richText: any): string {
  if (!richText) return ''
  if (typeof richText === 'string') return richText
  // Lexical richText format: { root: { children: [...] } }
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
