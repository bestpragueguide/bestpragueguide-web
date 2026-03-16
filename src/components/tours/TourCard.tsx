import Link from 'next/link'
import { extractPlainText } from '@/components/shared/SafeRichText'
import { PriceDisplay } from './PriceDisplay'
import type { TourPricing } from '@/lib/cms-types'

interface TourCardProps {
  title: string
  slug: string
  excerpt: string
  groupPrice?: number
  pricing?: TourPricing
  heroImageUrl?: string | null
  mobileImageUrl?: string | null
  focalPoint?: string
  imageAlt?: string
  locale: string
}

export function TourCard({
  title,
  slug,
  excerpt,
  groupPrice,
  pricing,
  heroImageUrl,
  mobileImageUrl,
  focalPoint,
  imageAlt,
  locale,
}: TourCardProps) {
  const objectPosition = focalPoint || '50% 50%'
  const alt = imageAlt || title

  // Build pricing object — prefer new pricing, fall back to legacy groupPrice
  const tourPricing: TourPricing = pricing?.model
    ? pricing
    : {
        model: 'GROUP_TIERS' as const,
        groupTiers: groupPrice
          ? [{ minGuests: 1, price: groupPrice }]
          : [],
      }

  return (
    <Link
      href={`/${locale}/tours/${slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-light relative overflow-hidden">
        {heroImageUrl ? (
          <picture>
            {mobileImageUrl && (
              <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
            )}
            <img
              src={heroImageUrl}
              alt={alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              style={{ objectPosition }}
              loading="lazy"
            />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray text-sm">
            Tour Photo
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-heading font-semibold text-navy group-hover:text-gold transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="mt-2 text-sm text-gray text-justify">{extractPlainText(excerpt)}</p>

        <div className="mt-4">
          <PriceDisplay pricing={tourPricing} locale={locale} variant="card" />
        </div>
      </div>
    </Link>
  )
}
