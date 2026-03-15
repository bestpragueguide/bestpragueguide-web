import { Button } from '@/components/shared/Button'
import { resolveMediaUrl } from '@/lib/cms-data'
import type { HomepageData } from '@/lib/cms-types'
import { FALLBACK_IMAGES } from '@/lib/constants'

interface HeroProps {
  data: HomepageData
  locale: string
}

export function Hero({ data, locale }: HeroProps) {
  const bgImage = typeof data.heroBackgroundImage === 'object' ? data.heroBackgroundImage : null
  const heroUrl = resolveMediaUrl(data.heroBackgroundImage, 'hero')
    || FALLBACK_IMAGES.hero
  const focalPosition = bgImage
    ? `${(bgImage as any)?.focalX ?? 50}% ${(bgImage as any)?.focalY ?? 50}%`
    : '50% 50%'
  const mobileImage = typeof data.mobileHeroImage === 'object' ? data.mobileHeroImage : null
  const mobileUrl = resolveMediaUrl(data.mobileHeroImage, 'mobileHero')
    || resolveMediaUrl(data.heroBackgroundImage, 'mobileHero')
  const heroAlt = (bgImage as any)?.alt || (locale === 'ru' ? 'Панорама Праги' : 'Prague panoramic view')

  const ctaHref = data.heroCtaHref.startsWith('/')
    ? `/${locale}${data.heroCtaHref}`
    : data.heroCtaHref

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-navy overflow-hidden">
      {/* Background image */}
      <picture>
        {mobileUrl && (
          <source media="(max-width: 768px)" srcSet={mobileUrl} />
        )}
        <img
          src={heroUrl}
          alt={heroAlt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: focalPosition }}
          fetchPriority="high"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy/90" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
          {data.heroTagline}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          {data.heroSubtitle}
        </p>
        <div className="mt-10">
          <Button href={ctaHref} size="lg">
            {data.heroCta}
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
