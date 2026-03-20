export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getReviewsPageData, resolveMediaUrl } from '@/lib/cms-data'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { JsonLd } from '@/components/seo/JsonLd'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

const fallbackGalleryPhotos = [
  { src: `${SERVER_URL}/api/media/file/photo_1_2026-03-03_18-30-46.jpg`, alt: 'Guide at the Astronomical Clock' },
  { src: `${SERVER_URL}/api/media/file/photo_2_2026-03-03_18-30-45.jpg`, alt: 'Prague panoramic view with red umbrella' },
  { src: `${SERVER_URL}/api/media/file/photo_5_2026-03-03_18-30-45.jpg`, alt: 'Family tour at Tyn Church' },
  { src: `${SERVER_URL}/api/media/file/photo_3_2026-03-03_18-30-45.jpg`, alt: 'Guide by the Vltava River' },
  { src: `${SERVER_URL}/api/media/file/photo_7_2026-03-03_18-30-45.jpg`, alt: 'Family at Kampa Island' },
  { src: `${SERVER_URL}/api/media/file/photo_6_2026-03-03_18-30-45.jpg`, alt: 'Tourists at Vltava riverbank' },
  { src: `${SERVER_URL}/api/media/file/photo_4_2026-03-03_18-30-45.jpg`, alt: 'Guide portrait in Old Town' },
]

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const pageData = await getReviewsPageData(locale)

  if (pageData.seo?.metaTitle) {
    const title = pageData.seo.metaTitle
    const description = pageData.seo.metaDescription || ''
    return { title, description, ...buildPageMetadata(locale, 'reviews', { title, description }) }
  }

  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('reviewsTitle')
  const description = t('reviewsDesc')
  return { title, description, ...buildPageMetadata(locale, 'reviews', { title, description }) }
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const pageData = await getReviewsPageData(locale)
  const tPages = await getTranslations({ locale, namespace: 'pages' })

  const galleryPhotos = pageData.galleryPhotos.length > 0
    ? pageData.galleryPhotos.map((p, i) => ({
        src: resolveMediaUrl(p.image) || fallbackGalleryPhotos[i]?.src || '',
        alt: (typeof p.image === 'object' && p.image?.alt) || `Guest photo ${i + 1}`,
      }))
    : fallbackGalleryPhotos

  let reviews: any[] = []
  try {
    const payload = await getPayload({ config })
    const where: any = {
      status: { equals: 'approved' },
      language: { equals: locale },
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

  // Calculate aggregate rating
  const ratedReviews = reviews.filter((r: any) => r.rating)
  const totalReviews = ratedReviews.length
  const avgRating = totalReviews > 0
    ? ratedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {totalReviews > 0 && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Best Prague Guide',
          url: 'https://bestpragueguide.com',
          image: 'https://bestpragueguide.com/favicon.svg',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Prague',
            addressCountry: 'CZ',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating.toFixed(1),
            reviewCount: totalReviews.toString(),
            bestRating: '5',
            worstRating: '1',
          },
        }} />
      )}

      <Breadcrumbs
        items={[{ label: tPages('reviewsBreadcrumb') }]}
        locale={locale}
      />

      {/* Photo gallery section */}
      <section className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-2">
          {pageData.heading}
        </h1>
        <h2 className="text-lg text-gray mb-8">{pageData.photoGalleryHeading}</h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {galleryPhotos.map((photo, i) => (
            <div key={i} className={`relative aspect-square rounded-lg overflow-hidden${i >= 6 ? ' hidden sm:block' : ''}`}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 14vw"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Text reviews section */}
      <section>
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
              {tPages('reviewsComingSoon')}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
