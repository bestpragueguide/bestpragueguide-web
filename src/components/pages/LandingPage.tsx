import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SafeRichText, extractPlainText } from '@/components/shared/SafeRichText'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { getDisplayPrice } from '@/lib/pricing'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

interface LandingPageProps {
  page: any
  locale: string
  schemaData?: Record<string, unknown>
}

export async function LandingPage({ page, locale, schemaData }: LandingPageProps) {
  const payload = await getPayload({ config })

  // Fetch featured tours
  const tourSlugs = (page.landingTourSlugs || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  let featuredTours: any[] = []
  if (tourSlugs.length > 0) {
    const result = await payload.find({
      collection: 'tours',
      where: { status: { equals: 'published' }, publishedLocales: { in: [locale] } },
      limit: 0,
      locale: locale as 'en' | 'ru',
    })
    featuredTours = tourSlugs
      .map((slug: string) => result.docs.find((t: any) => t.slug === slug))
      .filter(Boolean)
  }

  // Fetch testimonials
  let reviews: any[] = []
  try {
    const reviewResult = await payload.find({
      collection: 'reviews',
      where: { language: { equals: locale === 'ru' ? 'ru' : 'en' } },
      sort: '-rating',
      limit: 5,
      locale: locale as 'en' | 'ru',
    })
    reviews = reviewResult.docs
  } catch { /* no reviews */ }

  const heroImage = typeof page.heroImage === 'object' ? page.heroImage : null
  const heroUrl = heroImage?.sizes?.hero?.url || heroImage?.url || ''
  const fullHeroUrl = heroUrl ? (heroUrl.startsWith('http') ? heroUrl : `${SERVER_URL}${heroUrl}`) : ''
  const faqItems = page.faqItems || []
  const tourPathPrefix = locale === 'ru' ? '/ru/ekskursii/' : '/en/tours/'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: page.title }]} locale={locale} />

      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden mb-12">
        {fullHeroUrl ? (
          <div className="relative aspect-[21/9] sm:aspect-[3/1]">
            <Image
              src={fullHeroUrl}
              alt={heroImage?.alt || page.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white">
                {page.title}
              </h1>
              {page.subtitle && (
                <p className="mt-3 text-lg text-white/90 max-w-2xl">{page.subtitle}</p>
              )}
              <Link
                href={`/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}`}
                className="mt-6 inline-flex items-center px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
              >
                {locale === 'ru' ? 'Смотреть экскурсии' : 'Explore Tours'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="mt-3 text-lg text-navy/70 max-w-2xl">{page.subtitle}</p>
            )}
          </div>
        )}
      </section>

      {/* Trust Signals */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { value: locale === 'ru' ? 'Многолетний' : 'Years of', label: locale === 'ru' ? 'опыт' : 'Experience' },
          { value: '10,000+', label: locale === 'ru' ? 'довольных гостей' : 'Happy Guests' },
          { value: locale === 'ru' ? 'Команда' : 'Team of', label: locale === 'ru' ? 'лицензированных гидов' : 'Licensed Guides' },
          { value: locale === 'ru' ? 'Индивидуальные' : 'Custom', label: locale === 'ru' ? 'маршруты' : 'Routes Available' },
        ].map((item, i) => (
          <div key={i} className="text-center p-4 bg-white rounded-xl border border-gray-light/50">
            <span className="text-xl font-heading font-bold text-gold block">{item.value}</span>
            <span className="text-xs text-navy/60">{item.label}</span>
          </div>
        ))}
      </section>

      {/* Main Content (from CMS richText) */}
      {page.content && (
        <section className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-navy prose-p:text-navy/80 mb-12">
          <SafeRichText data={page.content} />
        </section>
      )}

      {/* Featured Tours */}
      {featuredTours.length > 0 && (
        <section className="py-12 border-t border-gray-light/50">
          <h2 className="text-2xl font-heading font-bold text-navy mb-8">
            {locale === 'ru' ? 'Наши экскурсии' : 'Our Tours'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTours.map((tour: any) => {
              const img = typeof tour.heroImage === 'object' ? tour.heroImage : null
              const imgUrl = img?.sizes?.card?.url || img?.url || ''
              const fullImgUrl = imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `${SERVER_URL}${imgUrl}`) : ''
              const priceInfo = tour.pricing?.model ? getDisplayPrice(tour.pricing) : null
              const price = priceInfo?.fromPrice || tour.groupPrice

              return (
                <Link
                  key={tour.id}
                  href={`${tourPathPrefix}${tour.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-xl overflow-hidden border border-gray-light/50 hover:shadow-lg transition-shadow"
                >
                  {fullImgUrl && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={fullImgUrl}
                        alt={img?.alt || tour.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-heading font-semibold text-navy group-hover:text-gold transition-colors">
                      {tour.title}
                    </h3>
                    <p className="mt-2 text-sm text-navy/60 line-clamp-2">{extractPlainText(tour.excerpt || tour.description)}</p>
                    {price && (
                      <p className="mt-3 text-sm">
                        <span className="text-navy/50">{locale === 'ru' ? 'от' : 'from'} </span>
                        <span className="font-semibold text-gold">{price} EUR</span>
                        <span className="text-navy/40 text-xs"> {locale === 'ru' ? 'за группу' : 'per group'}</span>
                      </p>
                    )}
                    <span className="mt-3 inline-block text-sm font-medium text-gold">
                      {locale === 'ru' ? 'Подробнее →' : 'Learn More →'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="py-12 border-t border-gray-light/50">
          <h2 className="text-2xl font-heading font-bold text-navy mb-8">
            {locale === 'ru' ? 'Отзывы наших гостей' : 'What Our Guests Say'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review: any) => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-light/50 p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.rating || 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-navy/70 italic">&ldquo;{extractPlainText(review.comment)}&rdquo;</p>
                <p className="mt-3 text-xs text-navy/50 font-medium">
                  {review.reviewerName}{review.country ? `, ${review.country}` : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="py-12 border-t border-gray-light/50">
          <h2 className="text-2xl font-heading font-bold text-navy mb-8">
            {locale === 'ru' ? 'Часто задаваемые вопросы' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-6 max-w-3xl">
            {faqItems.map((item: any, i: number) => (
              <div key={i}>
                <h3 className="text-lg font-heading font-semibold text-navy mb-2">{item.question}</h3>
                <p className="text-navy/70">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 border-t border-gray-light/50 text-center">
        <p className="text-lg font-heading font-semibold text-navy mb-2">
          {locale === 'ru' ? 'Только ваша группа, без посторонних.' : 'Just your group, no strangers.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link
            href={`/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}`}
            className="inline-flex items-center px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
          >
            {locale === 'ru' ? 'Смотреть экскурсии' : 'Explore Tours'}
          </Link>
          <Link
            href="https://wa.me/420776306858"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-navy text-navy font-medium rounded-lg hover:bg-navy hover:text-white transition-colors"
          >
            WhatsApp
          </Link>
        </div>
      </section>

      {/* Schema */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: page.title },
        ],
      }} />
      {faqItems.length > 0 && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item: any) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }} />
      )}
      {schemaData && <JsonLd data={schemaData} />}
    </div>
  )
}
