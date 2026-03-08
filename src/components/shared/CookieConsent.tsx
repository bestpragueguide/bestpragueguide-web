'use client'

import { useState, useEffect } from 'react'

const COOKIE_KEY = 'bpg-cookie-consent'

const texts = {
  en: {
    message: 'This website uses cookies to improve your experience and analyze traffic.',
    accept: 'Accept',
    learnMore: 'Learn more',
  },
  ru: {
    message: 'Этот сайт использует файлы cookie для улучшения работы и анализа трафика.',
    accept: 'Принять',
    learnMore: 'Подробнее',
  },
}

export function CookieConsent({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  const t = texts[locale as keyof typeof texts] || texts.en

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-navy/95 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-white/80 text-center sm:text-left">
          {t.message}{' '}
          <a
            href={`/${locale}/privacy`}
            className="text-gold hover:text-gold-dark underline transition-colors"
          >
            {t.learnMore}
          </a>
        </p>
        <button
          onClick={handleAccept}
          className="px-6 py-2 text-sm font-medium bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors whitespace-nowrap"
        >
          {t.accept}
        </button>
      </div>
    </div>
  )
}
