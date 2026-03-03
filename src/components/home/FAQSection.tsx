'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-gray-light/50">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-navy">{question}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`text-gold shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-gray leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export function FAQSection() {
  const t = useTranslations('faq')
  const sectionT = useTranslations('faqSection')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqItems = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
    { q: t('q8'), a: t('a8') },
    { q: t('q9'), a: t('a9') },
  ]

  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy text-center mb-12">
          {sectionT('heading')}
        </h2>

        <div>
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}
