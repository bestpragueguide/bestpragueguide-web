'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface TourFAQProps {
  items: FAQItem[]
  locale: string
}

export function TourFAQ({ items, locale }: TourFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (items.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-heading font-bold text-navy mb-6">
        {locale === 'ru' ? 'Вопросы и ответы' : 'FAQ'}
      </h2>

      <div className="space-y-0">
        {items.map((item, index) => (
          <div key={index} className="border-b border-gray-light/50">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between py-4 text-left gap-4"
              aria-expanded={openIndex === index}
            >
              <span className="text-sm font-medium text-navy">
                {item.question}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={`text-gold shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96 pb-4' : 'max-h-0'
              }`}
            >
              <p className="text-sm text-gray leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
