export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { PhotoGallery } from '@/components/reviews/PhotoGallery'
import { ReviewFilter } from '@/components/reviews/ReviewFilter'
import { ReviewCard } from '@/components/reviews/ReviewCard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('reviewsTitle'), description: t('reviewsDesc') }
}

export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { locale } = await params
  const { lang } = await searchParams
  const t = await getTranslations({ locale, namespace: 'reviews' })

  let reviews: any[] = []
  try {
    const payload = await getPayload({ config })
    const where: any = { status: { equals: 'approved' } }
    if (lang && lang !== 'all') {
      where.language = { equals: lang }
    }
    const result = await payload.find({
      collection: 'reviews',
      where,
      limit: 50,
      locale: locale as 'en' | 'ru',
      sort: '-createdAt',
    })
    reviews = result.docs
  } catch {
    // No reviews yet
  }

  // Placeholder photos (will be replaced with real tourist photos)
  const placeholderPhotos = Array.from({ length: 12 }, (_, i) => ({
    url: '',
    alt: `Tourist in Prague ${i + 1}`,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: locale === 'ru' ? 'Отзывы' : 'Reviews' }]}
        locale={locale}
      />

      {/* Photo gallery section */}
      <section className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-2">
          {t('heading')}
        </h1>
        <h2 className="text-lg text-gray mb-8">{t('photoGalleryHeading')}</h2>

        {placeholderPhotos[0].url ? (
          <PhotoGallery photos={placeholderPhotos} />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-light rounded-lg flex items-center justify-center text-gray text-xs"
              >
                Photo {i + 1}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Text reviews section */}
      <section>
        <Suspense fallback={null}>
          <ReviewFilter />
        </Suspense>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review: any) => (
              <ReviewCard
                key={review.id}
                customerName={review.customerName}
                customerCountry={review.customerCountry}
                rating={review.rating}
                body={review.body}
                tourName={
                  typeof review.tour === 'object'
                    ? review.tour?.title
                    : undefined
                }
                tourDate={review.tourDate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray">
            <p>
              {locale === 'ru'
                ? 'Отзывы скоро появятся!'
                : 'Reviews coming soon!'}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
