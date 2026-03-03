import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TourCard } from '@/components/tours/TourCard'
import { Button } from '@/components/shared/Button'

export async function FeaturedTours() {
  const locale = await getLocale()
  const t = await getTranslations('categories')
  const commonT = await getTranslations('common')

  let tours: Array<{
    id: number
    title: string
    slug: string
    excerpt: string
    category: string
    subcategory?: string | null
    duration: number
    groupPrice: number
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
    <section className="py-16 lg:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            {t('all')}
          </h2>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <a
            href={`/${locale}/tours?category=prague-tours`}
            className="relative group rounded-xl overflow-hidden bg-navy-light aspect-[2/1] flex items-end p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
            <h3 className="relative text-2xl font-heading font-bold text-white group-hover:text-gold transition-colors">
              {t('pragueTours')}
            </h3>
          </a>
          <a
            href={`/${locale}/tours?category=from-prague`}
            className="relative group rounded-xl overflow-hidden bg-navy-light aspect-[2/1] flex items-end p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
            <h3 className="relative text-2xl font-heading font-bold text-white group-hover:text-gold transition-colors">
              {t('fromPrague')}
            </h3>
          </a>
        </div>

        {/* Tour grid */}
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => {
              const heroImage =
                typeof tour.heroImage === 'object' && tour.heroImage
                  ? tour.heroImage.sizes?.card?.url || tour.heroImage.url || null
                  : null

              return (
                <TourCard
                  key={tour.id}
                  title={tour.title}
                  slug={tour.slug}
                  excerpt={tour.excerpt}
                  category={tour.category}
                  subcategory={tour.subcategory}
                  duration={tour.duration}
                  groupPrice={tour.groupPrice}
                  rating={tour.rating}
                  heroImageUrl={heroImage}
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
          <Button href={`/${locale}/tours`} variant="secondary">
            {commonT('allTours')}
          </Button>
        </div>
      </div>
    </section>
  )
}
