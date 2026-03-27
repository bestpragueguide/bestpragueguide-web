import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import { TourCard } from '@/components/tours/TourCard'
import { Button } from '@/components/shared/Button'
import { resolveMediaUrl } from '@/lib/cms-data'
import type { HomepageData } from '@/lib/cms-types'
import { localizeHref } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

const fallbackCategoryImages = [
  `${SERVER_URL}/api/media/file/photo_2_2026-03-03_18-30-45.jpg`,
  `${SERVER_URL}/api/media/file/photo_3_2026-03-03_18-30-45.jpg`,
]

interface FeaturedToursProps {
  data: HomepageData
  locale: string
}

export async function FeaturedTours({ data, locale }: FeaturedToursProps) {
  const commonT = await getTranslations({ locale, namespace: 'common' })

  let tours: Array<{
    id: number
    title: string
    slug: string
    excerpt: string
    category: string
    subcategory?: string | null
    duration: number
    groupPrice: number
    pricing?: any
    rating?: number | null
    heroImage?: { url?: string; sizes?: { card?: { url?: string } } } | number
  }> = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tours',
      where: {
        status: { equals: 'published' },
        publishedLocales: { in: [locale] },
      },
      sort: 'sortOrder',
      limit: 6,
      locale: locale as 'en' | 'ru',
    })
    tours = result.docs as typeof tours
  } catch {
    // No tours yet — show empty state
  }

  return (
    <section className="py-10 lg:py-14 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            {data.categoriesHeading}
          </h2>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {data.categories.map((cat, i) => {
            const imgUrl = resolveMediaUrl(cat.image)
              || fallbackCategoryImages[i]
              || fallbackCategoryImages[0]
            const href = localizeHref(cat.href, locale)

            return (
              <a
                key={i}
                href={href}
                className="relative group rounded-xl overflow-hidden bg-navy-light aspect-[2/1] flex items-end p-6"
              >
                <Image
                  src={imgUrl}
                  alt={cat.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={i < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
                <h3 className="relative text-2xl font-heading font-bold text-white group-hover:text-gold transition-colors">
                  {cat.label}
                </h3>
              </a>
            )
          })}
        </div>

        {/* Tour grid */}
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => {
              const img = typeof tour.heroImage === 'object' && tour.heroImage ? tour.heroImage : null

              return (
                <TourCard
                  key={tour.id}
                  title={tour.title}
                  slug={tour.slug}
                  excerpt={tour.excerpt}
                  groupPrice={tour.groupPrice}
                  pricing={(tour as any).pricing}
                  heroImageUrl={(img as any)?.sizes?.card?.url || img?.url || null}
                  mobileImageUrl={(img as any)?.sizes?.mobileCard?.url || null}
                  focalPoint={img ? `${(img as any)?.focalX ?? 50}% ${(img as any)?.focalY ?? 50}%` : undefined}
                  imageAlt={(img as any)?.alt || undefined}
                  locale={locale}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray">
            <p>
              {locale === 'ru'
                ? 'Экскурсии скоро появятся!'
                : 'Tours coming soon!'}
            </p>
          </div>
        )}

        {/* All Tours button */}
        <div className="mt-12 text-center">
          <Button href={`/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}`} variant="secondary">
            {commonT('allTours')}
          </Button>
        </div>
      </div>
    </section>
  )
}
