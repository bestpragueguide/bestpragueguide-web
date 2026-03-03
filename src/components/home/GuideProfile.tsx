import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { Button } from '@/components/shared/Button'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

export async function GuideProfile() {
  const locale = await getLocale()
  const t = await getTranslations('guideProfile')

  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden order-2 lg:order-1">
            <Image
              src={`${SERVER_URL}/api/media/file/photo_4_2026-03-03_18-30-45.jpg`}
              alt={locale === 'ru' ? 'Ульяна Формина — ваш гид по Праге' : 'Uliana Formina — Your Prague Guide'}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
              {t('heading')}
            </h2>
            <p className="mt-6 text-lg text-navy/70 leading-relaxed">
              {t('bio')}
            </p>
            <div className="mt-8">
              <Button href={`/${locale}/about`} variant="secondary">
                {t('learnMore')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
