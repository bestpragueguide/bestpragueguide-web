import Link from 'next/link'
import { extractPlainText } from '@/components/shared/SafeRichText'

interface TourCardProps {
  title: string
  slug: string
  excerpt: string
  duration: number
  groupPrice: number
  rating?: number | null
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
  duration,
  groupPrice,
  rating,
  heroImageUrl,
  mobileImageUrl,
  focalPoint,
  imageAlt,
  locale,
}: TourCardProps) {
  const objectPosition = focalPoint || '50% 50%'
  const alt = imageAlt || title

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

        <p className="mt-2 text-sm text-gray">{extractPlainText(excerpt)}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gold">€{groupPrice}</span>
            <span className="text-xs text-gray ml-1">
              {locale === 'ru' ? 'за группу' : 'per group'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray">
            {rating && (
              <span className="flex items-center gap-1">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gold"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {rating.toFixed(1)}
              </span>
            )}
            <span>{duration}h</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
