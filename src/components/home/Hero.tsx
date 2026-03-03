import { getLocale, getTranslations } from 'next-intl/server'
import { Button } from '@/components/shared/Button'

export async function Hero() {
  const locale = await getLocale()
  const t = await getTranslations('hero')

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-navy overflow-hidden">
      {/* Background placeholder — will be replaced with hero image */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy/90" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
          {t('tagline')}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
        <div className="mt-10">
          <Button href={`/${locale}/tours`} size="lg">
            {t('cta')}
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
