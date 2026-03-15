'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const { locale } = useParams<{ locale: string }>()
  const t = useTranslations('notFound')
  const toursPath = locale === 'ru' ? 'ekskursii' : 'tours'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-6xl font-heading font-bold text-navy mb-4">404</h1>
      <p className="text-lg text-gray mb-8">{t('message')}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href={`/${locale}`}
          className="px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
        >
          {t('homeLink')}
        </Link>
        <Link
          href={`/${locale}/${toursPath}`}
          className="px-6 py-3 border border-navy text-navy font-medium rounded-lg hover:bg-navy hover:text-white transition-colors"
        >
          {t('toursLink')}
        </Link>
      </div>
    </div>
  )
}
