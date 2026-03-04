import { getLocale, getTranslations } from 'next-intl/server'

export async function CTASection() {
  const locale = await getLocale()
  const t = await getTranslations('cta')

  return (
    <section className="py-16 lg:py-24 bg-gold">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
          {t('heading')}
        </h2>
        <p className="mt-4 text-lg text-white/80">{t('subtitle')}</p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`/${locale}/tours`}
            className="inline-flex items-center justify-center font-medium rounded-lg px-8 py-4 text-lg bg-white text-navy hover:bg-cream transition-colors visited:text-navy"
          >
            {t('chooseTour')}
          </a>

          <a
            href="https://wa.me/420776306858"
            className="inline-flex items-center justify-center font-medium rounded-lg px-8 py-4 text-lg border-2 border-white text-white hover:bg-white/10 transition-colors visited:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('whatsapp')}
          </a>
        </div>
      </div>
    </section>
  )
}
