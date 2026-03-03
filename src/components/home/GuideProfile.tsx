import { getLocale, getTranslations } from 'next-intl/server'
import { Button } from '@/components/shared/Button'

export async function GuideProfile() {
  const locale = await getLocale()
  const t = await getTranslations('guideProfile')

  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Photo placeholder */}
          <div className="aspect-[4/5] bg-gray-light rounded-2xl flex items-center justify-center text-gray order-2 lg:order-1">
            <span className="text-sm">Guide Photo</span>
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
