export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { ImageGallery } from '@/components/tours/ImageGallery'
import { TourIncluded } from '@/components/tours/TourIncluded'
import { TourFAQ } from '@/components/tours/TourFAQ'
import { TourReviews } from '@/components/tours/TourReviews'
import { TourRelated } from '@/components/tours/TourRelated'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SafeRichText, extractPlainText } from '@/components/shared/SafeRichText'
import { StickyBookButton } from '@/components/booking/StickyBookButton'
import { BookingRequestForm } from '@/components/booking/BookingRequestForm'
import { TourSchema } from '@/components/seo/TourSchema'
import { TourViewTracker } from '@/components/analytics/TourViewTracker'
import { getDisplayPrice } from '@/lib/pricing'
import { PriceDisplay } from '@/components/tours/PriceDisplay'
import type { TourPricing } from '@/lib/cms-types'

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
  locale: string,
  selectedIds?: number[],
) {
  if (!selectedIds || selectedIds.length === 0) return []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tours',
      where: {
        id: { in: selectedIds },
        status: { equals: 'published' },
      },
      limit: selectedIds.length,
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
    (tour as any).seo?.metaDescription || extractPlainText(tour.excerpt)

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

  const heroImage = typeof (tour as any).heroImage === 'object' ? (tour as any).heroImage : null
  const ogImageUrl = heroImage?.sizes?.og?.url || heroImage?.sizes?.hero?.url || heroImage?.url || ''
  const ogImage = ogImageUrl ? (ogImageUrl.startsWith('http') ? ogImageUrl : `${baseUrl}${ogImageUrl}`) : `${baseUrl}/og-default.jpg`

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
      alternateLocale: locale === 'ru' ? ['en_US'] : ['ru_RU'],
      siteName: 'Best Prague Guide',
      url: `${baseUrl}/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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

  // Extract admin-selected related tour IDs
  const selectedRelatedIds = ((tour as any).relatedTours || [])
    .map((t: any) => (typeof t === 'object' ? t.id : t))
    .filter((id: any): id is number => typeof id === 'number')

  const [reviews, relatedTours] = await Promise.all([
    getTourReviews(tour.id as number, locale),
    getRelatedTours(locale, selectedRelatedIds.length > 0 ? selectedRelatedIds : undefined),
  ])

  const galleryImages = ((tour as any).gallery || []).map(
    (item: any) => ({
      url:
        typeof item.image === 'object'
          ? item.image?.sizes?.card?.url || item.image?.url || ''
          : '',
      mobileUrl:
        typeof item.mobileImage === 'object'
          ? item.mobileImage?.sizes?.mobileCard?.url || item.mobileImage?.url || null
          : typeof item.image === 'object'
            ? item.image?.sizes?.mobileCard?.url || null
            : null,
      alt: item.alt || (typeof item.image === 'object' ? item.image?.alt : null) || tour.title,
      caption: item.caption,
      objectFit: item.objectFit || 'cover',
      focalPoint:
        typeof item.image === 'object'
          ? `${item.image?.focalX ?? 50}% ${item.image?.focalY ?? 50}%`
          : '50% 50%',
    }),
  )

  const tourPricing: TourPricing = (tour as any).pricing?.model
    ? (tour as any).pricing
    : {
        model: 'GROUP_TIERS' as const,
        groupTiers: tour.groupPrice
          ? [{ minGuests: 1, maxGuests: (tour as any).maxGroupSize || undefined, price: tour.groupPrice }]
          : [],
      }

  const displayPrice = getDisplayPrice(tourPricing)

  const relatedTourCards = (relatedTours as any[]).map((t: any) => {
    const img = typeof t.heroImage === 'object' ? t.heroImage : null
    return {
      id: t.id,
      title: t.title,
      slug: t.slug,
      excerpt: t.excerpt,
      category: t.category,
      subcategory: t.subcategory,
      groupPrice: t.groupPrice,
      pricing: t.pricing,
      heroImageUrl: img?.sizes?.card?.url || img?.url || null,
      mobileImageUrl: img?.sizes?.mobileCard?.url || null,
      focalPoint: img ? `${img?.focalX ?? 50}% ${img?.focalY ?? 50}%` : undefined,
      imageAlt: img?.alt || undefined,
    }
  })

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
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            {tour.title}
          </h1>

          {/* Duration */}
          <div className="mt-3 flex items-center gap-2 text-navy/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">
              {locale === 'ru' ? 'Длительность' : 'Duration'}: {tour.duration}{' '}
              {locale === 'ru'
                ? tour.duration === 1 ? 'час' : tour.duration < 5 ? 'часа' : 'часов'
                : tour.duration === 1 ? 'hour' : 'hours'}
            </span>
          </div>

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div className="mt-6">
              <ImageGallery images={galleryImages} />
            </div>
          )}

          {/* Description */}
          <div className="mt-6 prose max-w-none prose-headings:font-heading prose-headings:text-navy prose-p:text-navy/80">
            {tour.description && (
              <RichText data={tour.description} />
            )}
          </div>

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
                <SafeRichText data={(tour as any).meetingPoint.instructions} className="text-sm text-gray mb-4" />
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
            {/* Group tiers pricing table */}
            {tourPricing.model === 'GROUP_TIERS' && tourPricing.groupTiers && tourPricing.groupTiers.length > 0 && (
              <div className="mb-5 pb-5 border-b border-gray-light/50">
                <h3 className="text-sm font-medium text-navy mb-3">
                  {locale === 'ru' ? 'Стоимость' : 'Pricing'}
                </h3>
                <PriceDisplay pricing={tourPricing} locale={locale} variant="detail" />
              </div>
            )}

            {/* Additional services */}
            {tourPricing.additionalServices && tourPricing.additionalServices.length > 0 && (
              <div className="mb-5 pb-5 border-b border-gray-light/50">
                <h3 className="text-sm font-medium text-navy mb-3">
                  {locale === 'ru' ? 'Дополнительные услуги' : 'Additional Services'}
                </h3>
                <div className="space-y-2">
                  {tourPricing.additionalServices.map((attachment, i) => {
                    const service = typeof attachment.service === 'object' ? attachment.service : null
                    if (!service) return null
                    return (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-navy/70">{service.name}</span>
                        <span className="font-medium text-navy">
                          {attachment.customPricingNote
                            ? attachment.customPricingNote
                            : service.pricingModel === 'ON_REQUEST'
                              ? (locale === 'ru' ? 'По запросу' : 'On request')
                              : service.pricingModel === 'FLAT' && service.flatPrice != null
                                ? `€${service.flatPrice}`
                                : service.pricingModel === 'PER_PERSON' && service.guestCategoryPricing?.length
                                  ? (() => {
                                      const adultCat = service.guestCategoryPricing.find(
                                        (c: any) => !c.isFree && !c.onRequest && c.price != null,
                                      )
                                      return adultCat ? `€${adultCat.price}/${locale === 'ru' ? 'чел' : 'pp'}` : (locale === 'ru' ? 'По запросу' : 'On request')
                                    })()
                                  : (locale === 'ru' ? 'По запросу' : 'On request')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Booking form (includes price + currency selector at top) */}
            <BookingRequestForm
              tourId={tour.id as number}
              tourName={tour.title}
              pricing={tourPricing}
              maxGroupSize={(tour as any).maxGroupSize}
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
                      ? '100% индивидуально — только ваша группа'
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
        description={extractPlainText(tour.excerpt)}
        image={
          typeof (tour as any).heroImage === 'object'
            ? (tour as any).heroImage?.sizes?.hero?.url || (tour as any).heroImage?.url || undefined
            : undefined
        }
        price={displayPrice.fromPrice ?? undefined}
        duration={tour.duration}
        rating={tour.rating ?? undefined}
        reviewCount={tour.reviewCount ?? undefined}
        locale={locale}
        slug={slug}
      />

      {/* Analytics: track tour view */}
      <TourViewTracker tourName={tour.title} tourId={tour.id as number} />

      {/* Mobile sticky book button */}
      <StickyBookButton
        tourId={tour.id as number}
        tourName={tour.title}
        pricing={tourPricing}
        maxGroupSize={(tour as any).maxGroupSize}
        locale={locale}
      />
    </div>
  )
}
