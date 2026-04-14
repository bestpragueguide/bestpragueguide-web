import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getDisplayPrice } from '@/lib/pricing'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

/** Map blog category → preferred tour slugs (EN) */
const categoryTourMap: Record<string, string[]> = {
  'prague-guide': ['charles-bridge-old-town', 'prague-castle-lesser-town', 'all-prague-in-one-day'],
  'day-trips': ['cesky-krumlov', 'kutna-hora', 'all-prague-in-one-day'],
  'food-and-drink': ['2000-medieval-dinner-prague', 'kozel-brewery-tour', 'pilsner-urquell-brewery'],
  'tips': ['all-prague-in-one-day', 'best-of-prague-car-tour', 'charles-bridge-old-town'],
  'history': ['hidden-prague-underground-alchemy', 'prague-castle-lesser-town', 'terezin-memorial'],
}

const defaultTourSlugs = ['all-prague-in-one-day', 'charles-bridge-old-town', 'prague-castle-lesser-town']

/** RU tour slug mapping */
const ruTourPathPrefix = '/ru/ekskursii/'
const enTourPathPrefix = '/en/tours/'

interface RelatedToursProps {
  category: string
  locale: string
}

export async function RelatedTours({ category, locale }: RelatedToursProps) {
  const targetSlugs = categoryTourMap[category] || defaultTourSlugs

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'tours',
      where: {
        status: { equals: 'published' },
        publishedLocales: { in: [locale] },
      },
      limit: 0,
      locale: locale as 'en' | 'ru',
    })

    // Find tours matching our target slugs, preserving order
    const matchedTours = targetSlugs
      .map(slug => result.docs.find((t: any) => t.slug === slug))
      .filter(Boolean)
      .slice(0, 3)

    // Fallback: if fewer than 3 matched, fill with first available tours
    if (matchedTours.length < 3) {
      for (const tour of result.docs) {
        if (matchedTours.length >= 3) break
        if (!matchedTours.find((t: any) => t.id === tour.id)) {
          matchedTours.push(tour)
        }
      }
    }

    if (matchedTours.length === 0) return null

    const heading = locale === 'ru'
      ? 'Откройте Прагу с личным гидом'
      : 'Explore Prague with a Private Guide'
    const subheading = locale === 'ru'
      ? 'Только ваша группа, без посторонних.'
      : 'Just your group, no strangers.'
    const ctaText = locale === 'ru' ? 'Подробнее →' : 'Learn More →'
    const tourPathPrefix = locale === 'ru' ? ruTourPathPrefix : enTourPathPrefix

    return (
      <section className="mt-16 pt-8 border-t border-gray-light/50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-navy">
            {heading}
          </h2>
          <p className="mt-2 text-sm text-gold font-medium">{subheading}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {matchedTours.map((tour: any) => {
            const heroImage = typeof tour.heroImage === 'object' ? tour.heroImage : null
            const imageUrl = heroImage?.sizes?.card?.url || heroImage?.url || ''
            const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${SERVER_URL}${imageUrl}`) : ''
            const priceInfo = tour.pricing?.model ? getDisplayPrice(tour.pricing) : null
            const price = priceInfo?.fromPrice ? `${priceInfo.fromPrice} EUR` : null
            const tourHref = `${tourPathPrefix}${tour.slug}`

            return (
              <Link
                key={tour.id}
                href={tourHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-xl overflow-hidden border border-gray-light/50 hover:shadow-lg transition-shadow duration-300"
              >
                {fullImageUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={fullImageUrl}
                      alt={heroImage?.alt || tour.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-navy group-hover:text-gold transition-colors text-sm leading-snug">
                    {tour.title}
                  </h3>
                  {price && (
                    <p className="mt-2 text-xs text-navy/60">
                      {locale === 'ru' ? 'от' : 'from'}{' '}
                      <span className="font-semibold text-gold">{price}</span>
                    </p>
                  )}
                  <span className="mt-3 inline-block text-sm font-medium text-gold">
                    {ctaText}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    )
  } catch {
    return null
  }
}
