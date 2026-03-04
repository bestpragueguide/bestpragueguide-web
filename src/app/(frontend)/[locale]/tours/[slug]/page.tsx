export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Badge } from '@/components/shared/Badge'
import { ImageGallery } from '@/components/tours/ImageGallery'
import { TourItinerary } from '@/components/tours/TourItinerary'
import { TourIncluded } from '@/components/tours/TourIncluded'
import { TourFAQ } from '@/components/tours/TourFAQ'
import { TourReviews } from '@/components/tours/TourReviews'
import { TourRelated } from '@/components/tours/TourRelated'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { StickyBookButton } from '@/components/booking/StickyBookButton'
import { BookingRequestForm } from '@/components/booking/BookingRequestForm'
import { TourSchema } from '@/components/seo/TourSchema'

async function getTour(slug: string, locale: string) {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tours',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      locale: locale as 'en' | 'ru',
      limit: 1,
    })
    return result.docs[0] || null
  } catch {
    return null
  }
}

async function getRelatedTours(
  tourId: number,
  category: string,
  locale: string,
) {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tours',
      where: {
        id: { not_equals: tourId },
        category: { equals: category },
        status: { equals: 'published' },
        publishedLocales: { in: [locale] },
      },
      limit: 3,
      locale: locale as 'en' | 'ru',
    })
    return result.docs
  } catch {
    return []
  }
}

async function getTourReviews(tourId: number, locale: string) {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'reviews',
      where: {
        tour: { equals: tourId },
        status: { equals: 'approved' },
      },
      limit: 5,
      locale: locale as 'en' | 'ru',
    })
    return result.docs
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const tour = await getTour(slug, locale)

  if (!tour) {
    return { title: 'Tour Not Found' }
  }

  const title =
    (tour as any).seo?.metaTitle || `${tour.title} — Best Prague Guide`
  const description =
    (tour as any).seo?.metaDescription || tour.excerpt

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
  const otherLocale = locale === 'en' ? 'ru' : 'en'

  // Fetch slug in the other locale
  let otherSlug = slug
  try {
    const payload = await getPayload({ config })
    const altResult = await payload.find({
      collection: 'tours',
      where: { id: { equals: tour.id } },
      limit: 1,
      locale: otherLocale as 'en' | 'ru',
    })
    if (altResult.docs[0]?.slug) {
      otherSlug = altResult.docs[0].slug
    }
  } catch {
    // Use same slug as fallback
  }

  const enSlug = locale === 'en' ? slug : otherSlug
  const ruSlug = locale === 'ru' ? slug : otherSlug

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}/${slug}`,
      languages: {
        en: `${baseUrl}/en/tours/${enSlug}`,
        ru: `${baseUrl}/ru/ekskursii/${ruSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
    },
  }
}

export const revalidate = 3600

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const tour = await getTour(slug, locale)

  if (!tour) {
    notFound()
  }

  const [reviews, relatedTours] = await Promise.all([
    getTourReviews(tour.id as number, locale),
    getRelatedTours(tour.id as number, tour.category, locale),
  ])

  const categoryLabel =
    tour.category === 'prague-tours'
      ? locale === 'ru'
        ? 'Экскурсии по Праге'
        : 'Prague Tours'
      : locale === 'ru'
        ? 'Из Праги'
        : 'From Prague'

  const galleryImages = ((tour as any).gallery || []).map(
    (item: any) => ({
      url:
        typeof item.image === 'object'
          ? item.image?.sizes?.card?.url || item.image?.url || ''
          : '',
      alt: item.alt || tour.title,
      caption: item.caption,
    }),
  )

  const relatedTourCards = (relatedTours as any[]).map((t: any) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    excerpt: t.excerpt,
    category: t.category,
    subcategory: t.subcategory,
    duration: t.duration,
    groupPrice: t.groupPrice,
    rating: t.rating,
    heroImageUrl:
      typeof t.heroImage === 'object'
        ? t.heroImage?.sizes?.card?.url || t.heroImage?.url || null
        : null,
  }))

  const reviewCards = (reviews as any[]).map((r: any) => ({
    customerName: r.customerName,
    customerCountry: r.customerCountry,
    rating: r.rating,
    body: r.body,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      <Breadcrumbs
        items={[
          {
            label: locale === 'ru' ? 'Экскурсии' : 'Tours',
            href: `/${locale}/tours`,
          },
          { label: tour.title },
        ]}
        locale={locale}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left column: content */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          {galleryImages.length > 0 && (
            <ImageGallery images={galleryImages} />
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Badge variant="category">{categoryLabel}</Badge>
            <Badge variant="tag">{tour.duration}h</Badge>
            {tour.difficulty && (
              <Badge variant="tag">{tour.difficulty}</Badge>
            )}
            {tour.rating && (
              <Badge variant="trust">
                ★ {tour.rating.toFixed(1)}
                {tour.reviewCount ? ` (${tour.reviewCount})` : ''}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mt-4">
            {tour.title}
          </h1>

          {/* Description */}
          <div className="mt-6 prose prose-navy max-w-none">
            {tour.description && (
              <RichText data={tour.description} />
            )}
          </div>

          {/* Itinerary */}
          <TourItinerary
            stops={((tour as any).itinerary || []) as any[]}
            locale={locale}
          />

          {/* Included/Excluded */}
          <TourIncluded
            included={(tour as any).included || []}
            excluded={(tour as any).excluded || []}
            locale={locale}
          />

          {/* Meeting Point */}
          {(tour as any).meetingPoint?.address && (
            <div className="mt-10">
              <h2 className="text-2xl font-heading font-bold text-navy mb-4">
                {locale === 'ru' ? 'Место встречи' : 'Meeting Point'}
              </h2>
              <p className="text-sm text-navy/70 mb-3">
                {(tour as any).meetingPoint.address}
              </p>
              {(tour as any).meetingPoint.instructions && (
                <p className="text-sm text-gray mb-4">
                  {(tour as any).meetingPoint.instructions}
                </p>
              )}
              {(tour as any).meetingPoint.lat &&
                (tour as any).meetingPoint.lng && (
                  <iframe
                    title="Meeting Point Map"
                    src={`https://maps.google.com/maps?q=${(tour as any).meetingPoint.lat},${(tour as any).meetingPoint.lng}&z=15&output=embed`}
                    className="w-full h-64 rounded-lg border border-gray-light"
                    loading="lazy"
                    allowFullScreen
                  />
                )}
            </div>
          )}

          {/* FAQ */}
          <TourFAQ
            items={((tour as any).faq || []) as any[]}
            locale={locale}
          />

          {/* Reviews */}
          <TourReviews reviews={reviewCards} locale={locale} />

          {/* Related */}
          <TourRelated tours={relatedTourCards} locale={locale} />
        </div>

        {/* Right column: booking sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-light/50 p-6 shadow-sm">
            {/* Price */}
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-gold">
                €{tour.groupPrice}
              </span>
              <p className="text-sm text-gray mt-1">
                {locale === 'ru' ? 'за группу до 4 человек' : 'per group up to 4'}
              </p>
              {tour.groupSurchargePercent && tour.groupSurchargePercent > 0 && (
                <p className="text-xs text-gray mt-1">
                  {locale === 'ru'
                    ? `Группы 5–8: +${tour.groupSurchargePercent}%`
                    : `Groups 5–8: +${tour.groupSurchargePercent}%`}
                </p>
              )}
            </div>

            {/* Booking form */}
            <BookingRequestForm
              tourId={tour.id as number}
              tourName={tour.title}
              price={tour.groupPrice}
              surchargePercent={tour.groupSurchargePercent ?? undefined}
              locale={locale}
            />

            {/* Trust badges */}
            <div className="mt-6 space-y-3">
              {[
                {
                  icon: '✓',
                  text:
                    locale === 'ru'
                      ? 'Оплата только после подтверждения'
                      : 'No payment until we confirm',
                },
                {
                  icon: '✓',
                  text:
                    locale === 'ru'
                      ? 'Бесплатная отмена за 24 часа'
                      : 'Free cancellation 24h before',
                },
                {
                  icon: '✓',
                  text:
                    locale === 'ru'
                      ? '100% приватно — только ваша группа'
                      : '100% private — just your group',
                },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-trust font-bold">{badge.icon}</span>
                  <span className="text-navy/70">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org JSON-LD */}
      <TourSchema
        title={tour.title}
        description={tour.excerpt}
        price={tour.groupPrice}
        duration={tour.duration}
        rating={tour.rating ?? undefined}
        reviewCount={tour.reviewCount ?? undefined}
        locale={locale}
        slug={slug}
      />

      {/* Mobile sticky book button */}
      <StickyBookButton
        tourId={tour.id as number}
        tourName={tour.title}
        price={tour.groupPrice}
        surchargePercent={tour.groupSurchargePercent ?? undefined}
        locale={locale}
      />
    </div>
  )
}
