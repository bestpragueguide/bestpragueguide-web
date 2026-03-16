export const dynamic = 'force-dynamic'

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { ImageGallery } from '@/components/tours/ImageGallery'
import { TourIncluded } from '@/components/tours/TourIncluded'
import { TourFAQ } from '@/components/tours/TourFAQ'
import { TourRelated } from '@/components/tours/TourRelated'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText, defaultJSXConverters, LinkJSXConverter } from '@payloadcms/richtext-lexical/react'
import { SafeRichText, extractPlainText } from '@/components/shared/SafeRichText'
import { resolveRichTextLinks } from '@/lib/richtext'
import { getSiteSettings } from '@/lib/cms-data'
import { StickyBookButton } from '@/components/booking/StickyBookButton'
import { BookingRequestForm } from '@/components/booking/BookingRequestForm'
import { TourSchema } from '@/components/seo/TourSchema'
import { TourViewTracker } from '@/components/analytics/TourViewTracker'
import { getDisplayPrice } from '@/lib/pricing'
import { PriceDisplay } from '@/components/tours/PriceDisplay'
import { ShareButtons } from '@/components/shared/ShareButtons'
import type { TourData, TourPricing } from '@/lib/cms-types'

async function getTour(slug: string, locale: string): Promise<TourData | null> {
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
    return (result.docs[0] as TourData) || null
  } catch {
    return null
  }
}

async function getRelatedTours(
  locale: string,
  selectedIds?: number[],
): Promise<TourData[]> {
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
    return result.docs as TourData[]
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
    tour.seo?.metaTitle || `${tour.title} — Best Prague Guide`
  const description =
    tour.seo?.metaDescription || extractPlainText(tour.excerpt)

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

  const heroImage = typeof tour.heroImage === 'object' ? tour.heroImage : null
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

  const t = await getTranslations({ locale, namespace: 'tour' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const siteSettings = await getSiteSettings(locale)

  // Resolve internal links in richText description
  if (tour.description) {
    tour.description = await resolveRichTextLinks(tour.description, locale)
  }

  // Extract admin-selected related tour IDs
  const selectedRelatedIds = (tour.relatedTours || [])
    .map((t) => (typeof t === 'object' ? t.id : t))
    .filter((id): id is number => typeof id === 'number')

  const relatedTours = await getRelatedTours(locale, selectedRelatedIds.length > 0 ? selectedRelatedIds : undefined)

  const galleryImages = (tour.gallery || []).map(
    (item) => ({
      url:
        typeof item.image === 'object'
          ? item.image?.sizes?.card?.url || item.image?.url || ''
          : '',
      mobileUrl:
        typeof item.mobileImage === 'object'
          ? item.mobileImage?.sizes?.mobileCard?.url || item.mobileImage?.url || undefined
          : typeof item.image === 'object'
            ? item.image?.sizes?.mobileCard?.url || undefined
            : undefined,
      alt: item.alt || (typeof item.image === 'object' ? item.image?.alt : null) || tour.title,
      caption: item.caption,
      objectFit: (item.objectFit || 'cover') as 'cover' | 'contain' | 'fill',
      focalPoint:
        typeof item.image === 'object'
          ? `${item.image?.focalX ?? 50}% ${item.image?.focalY ?? 50}%`
          : '50% 50%',
    }),
  )

  const tourPricing: TourPricing = tour.pricing?.model
    ? tour.pricing
    : {
        model: 'GROUP_TIERS' as const,
        groupTiers: tour.groupPrice
          ? [{ minGuests: 1, maxGuests: tour.maxGroupSize || undefined, price: tour.groupPrice }]
          : [],
      }

  const displayPrice = getDisplayPrice(tourPricing)

  const relatedTourCards = relatedTours.map((t) => {
    const img = typeof t.heroImage === 'object' ? t.heroImage : null
    return {
      id: t.id,
      title: t.title,
      slug: t.slug,
      excerpt: typeof t.excerpt === 'string' ? t.excerpt : extractPlainText(t.excerpt),
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      <Breadcrumbs
        items={[
          {
            label: t('breadcrumbTours'),
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
              {t('duration')}: {tour.duration}{' '}
              {tour.duration === 1 ? tCommon('hour') : tCommon('hours')}
            </span>
          </div>

          {/* Share */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-navy/40">{t('share')}:</span>
            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'}/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}/${slug}`}
              title={tour.title}
              locale={locale}
            />
          </div>

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div className="mt-6">
              <ImageGallery images={galleryImages} />
            </div>
          )}

          {/* Description */}
          <div className="mt-6 prose max-w-none prose-headings:font-heading prose-headings:text-navy prose-p:text-navy/80 text-justify">
            {tour.description && (
              <RichText
                data={tour.description as SerializedEditorState}
                converters={{
                  ...defaultJSXConverters,
                  ...LinkJSXConverter({
                    internalDocToHref: ({ linkNode }) => {
                      const doc = linkNode.fields?.doc
                      if (!doc) return '#'
                      const slug = typeof doc.value === 'object' ? doc.value?.slug : null
                      const tourPath = locale === 'ru' ? 'ekskursii' : 'tours'
                      const prefixes: Record<string, string> = {
                        tours: `/${locale}/${tourPath}`,
                        'blog-posts': `/${locale}/blog`,
                        pages: `/${locale}`,
                      }
                      if (slug && doc.relationTo) {
                        return `${prefixes[doc.relationTo] || ''}/${slug}`
                      }
                      return '#'
                    },
                  }),
                }}
              />
            )}
          </div>

          {/* Included/Excluded */}
          <TourIncluded
            included={tour.included || []}
            excluded={tour.excluded || []}
            locale={locale}
          />

          {/* Meeting Point */}
          {tour.meetingPoint?.address && (
            <div className="mt-10">
              <h2 className="text-2xl font-heading font-bold text-navy mb-4">
                {t('meetingPoint')}
              </h2>
              <p className="text-sm text-navy/70 mb-3">
                {tour.meetingPoint.address}
              </p>
              {tour.meetingPoint.instructions && (
                <SafeRichText data={tour.meetingPoint.instructions} className="text-sm text-gray mb-4" />
              )}
              {tour.meetingPoint.lat &&
                tour.meetingPoint.lng && (
                  <iframe
                    title="Meeting Point Map"
                    src={`https://maps.google.com/maps?q=${tour.meetingPoint.lat},${tour.meetingPoint.lng}&z=15&output=embed`}
                    className="w-full h-64 rounded-lg border border-gray-light"
                    loading="lazy"
                    allowFullScreen
                  />
                )}
            </div>
          )}

          {/* FAQ */}
          <TourFAQ
            items={tour.faq || []}
            locale={locale}
          />

          {/* Reviews hidden — kept for future use */}

          {/* Related */}
          <TourRelated tours={relatedTourCards} locale={locale} />
        </div>

        {/* Right column: booking sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-light/50 p-6 shadow-sm">
            {/* Group tiers pricing table */}
            {tourPricing.model === 'GROUP_TIERS' && tourPricing.groupTiers && tourPricing.groupTiers.length > 0 && (
              <div className="mb-5 pb-5 border-b border-gray-light/50">
                <span className="block text-sm font-medium text-navy mb-1">
                  {t('pricing')}
                </span>
                <PriceDisplay pricing={tourPricing} locale={locale} variant="detail" />
              </div>
            )}

            {/* Pricing description */}
            {siteSettings.bookingPricingDescription && (
              <div className="mb-5 pb-5 border-b border-gray-light/50">
                <p className="text-sm text-navy/70 leading-relaxed">
                  {siteSettings.bookingPricingDescription}
                </p>
              </div>
            )}

            {/* Additional services */}
            {tourPricing.additionalServices && tourPricing.additionalServices.length > 0 && (
              <div className="mb-5 pb-5 border-b border-gray-light/50">
                <span className="block text-sm font-medium text-navy mb-1">
                  {t('additionalServicesSidebar')}
                </span>
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
                              ? t('onRequestSidebar')
                              : service.pricingModel === 'FLAT' && service.flatPrice != null
                                ? `€${service.flatPrice}`
                                : service.pricingModel === 'PER_PERSON' && service.guestCategoryPricing?.length
                                  ? (() => {
                                      const adultCat = service.guestCategoryPricing.find(
                                        (c: any) => !c.isFree && !c.onRequest && c.price != null,
                                      )
                                      return adultCat ? `€${adultCat.price}/${t('perPersonShort')}` : t('onRequestSidebar')
                                    })()
                                  : t('onRequestSidebar')}
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
              maxGroupSize={tour.maxGroupSize}
              locale={locale}
              preferredTimes={tour.preferredTimes}
              contactPhoneDisplay={siteSettings.contactPhoneDisplay}
            />

            {/* Trust badges */}
            {siteSettings.bookingTrustBadges && siteSettings.bookingTrustBadges.length > 0 && (
              <div className="mt-6 space-y-3">
                {siteSettings.bookingTrustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-trust font-bold">✓</span>
                    <span className="text-navy/70">{badge.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schema.org JSON-LD */}
      <TourSchema
        title={tour.title}
        description={extractPlainText(tour.excerpt)}
        image={
          typeof tour.heroImage === 'object'
            ? tour.heroImage?.sizes?.hero?.url || tour.heroImage?.url || undefined
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
        maxGroupSize={tour.maxGroupSize}
        locale={locale}
        preferredTimes={tour.preferredTimes}
        trustBadges={siteSettings.bookingTrustBadges}
        contactPhoneDisplay={siteSettings.contactPhoneDisplay}
        bookingPricingDescription={siteSettings.bookingPricingDescription}
      />
    </div>
  )
}
