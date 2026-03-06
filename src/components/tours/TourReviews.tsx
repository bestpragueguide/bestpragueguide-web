import Link from 'next/link'
import { SafeRichText } from '@/components/shared/SafeRichText'

interface Review {
  customerName: string
  customerCountry?: string | null
  rating: number
  body: any
}

interface TourReviewsProps {
  reviews: Review[]
  locale: string
}

export function TourReviews({ reviews, locale }: TourReviewsProps) {
  if (reviews.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-heading font-bold text-navy mb-6">
        {locale === 'ru' ? 'Отзывы' : 'Reviews'}
      </h2>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white rounded-lg p-5 border border-gray-light/50">
            <div className="flex items-center gap-3 mb-3">
              {/* Initials avatar */}
              <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center text-sm font-bold">
                {review.customerName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-navy">
                  {review.customerName}
                </p>
                {review.customerCountry && (
                  <p className="text-xs text-gray">{review.customerCountry}</p>
                )}
              </div>
              {/* Stars */}
              <div className="ml-auto flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={star <= review.rating ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={star <= review.rating ? 'text-gold' : 'text-gray-light'}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
            <SafeRichText data={review.body} className="text-sm text-navy/70 leading-relaxed" />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={`/${locale}/reviews`}
          className="text-sm font-medium text-gold hover:text-gold-dark transition-colors"
        >
          {locale === 'ru' ? 'Все отзывы →' : 'All Reviews →'}
        </Link>
      </div>
    </div>
  )
}
