import { FAQSection } from './FAQSection'
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

  return <FAQSection heading={heading} items={faqItems} />
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
