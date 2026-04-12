/**
 * Extract FAQ question/answer pairs from Lexical richText content.
 *
 * Looks for a section starting with an H2 containing "FAQ" or "Часто задаваемые"
 * and extracts Q&A pairs from the content following it.
 *
 * Supports two common patterns:
 * 1. Bold question in paragraph → next paragraph(s) as answer
 * 2. H3 question → next paragraph(s) as answer
 */

interface FAQItem {
  question: string
  answer: string
}

function extractText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (node.text) return node.text
  if (node.children) {
    return node.children.map((c: any) => extractText(c)).join('')
  }
  return ''
}

function isFAQHeading(node: any): boolean {
  if (node.type !== 'heading') return false
  const text = extractText(node).toLowerCase()
  return (
    text.includes('frequently asked') ||
    text.includes('faq') ||
    text.includes('часто задаваемые') ||
    text.includes('вопросы и ответы')
  )
}

function isEndSection(node: any): boolean {
  if (node.type !== 'heading') return false
  const text = extractText(node).toLowerCase()
  return (
    text.includes('you may also like') ||
    text.includes('вам также будет интересно') ||
    text.includes('experience it with') ||
    text.includes('увидеть это с')
  )
}

function isQuestion(text: string): boolean {
  return text.trim().endsWith('?')
}

export function extractFAQFromLexical(content: any): FAQItem[] {
  if (!content?.root?.children) return []

  const children = content.root.children
  const items: FAQItem[] = []

  // Find the FAQ section start
  let faqStartIdx = -1
  for (let i = 0; i < children.length; i++) {
    if (isFAQHeading(children[i])) {
      faqStartIdx = i + 1
      break
    }
  }

  if (faqStartIdx === -1) return []

  // Extract Q&A pairs from FAQ section
  let currentQuestion = ''
  let currentAnswer = ''

  for (let i = faqStartIdx; i < children.length; i++) {
    const node = children[i]

    // Stop at end sections
    if (isEndSection(node)) break
    if (node.type === 'heading' && node.tag === 'h2') break

    const text = extractText(node).trim()
    if (!text) continue

    // H3 = question
    if (node.type === 'heading' && (node.tag === 'h3' || node.tag === 'h4')) {
      // Save previous pair
      if (currentQuestion && currentAnswer) {
        items.push({ question: currentQuestion, answer: currentAnswer.trim() })
      }
      currentQuestion = text
      currentAnswer = ''
      continue
    }

    // Paragraph starting with bold text ending in ? = question
    if (node.type === 'paragraph' && node.children?.[0]?.format === 1) {
      const boldText = node.children[0].text || ''
      if (isQuestion(boldText) || isQuestion(text)) {
        // Save previous pair
        if (currentQuestion && currentAnswer) {
          items.push({ question: currentQuestion, answer: currentAnswer.trim() })
        }
        currentQuestion = isQuestion(boldText) ? boldText : text
        // Rest of paragraph after the question may be the answer start
        const restText = text.replace(boldText, '').trim()
        currentAnswer = restText
        continue
      }
    }

    // Plain paragraph with question mark = question (standalone bold paragraph)
    if (node.type === 'paragraph' && isQuestion(text) && !currentAnswer && text.length < 200) {
      if (currentQuestion && currentAnswer) {
        items.push({ question: currentQuestion, answer: currentAnswer.trim() })
      }
      currentQuestion = text
      currentAnswer = ''
      continue
    }

    // Otherwise it's answer content
    if (currentQuestion) {
      currentAnswer += (currentAnswer ? ' ' : '') + text
    }
  }

  // Don't forget the last pair
  if (currentQuestion && currentAnswer) {
    items.push({ question: currentQuestion, answer: currentAnswer.trim() })
  }

  return items
}
