import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getAboutPageData, resolveMediaUrl } from '@/lib/cms-data'
import { localizeHref } from '@/i18n/routing'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Button } from '@/components/shared/Button'
import { SafeRichText } from '@/components/shared/SafeRichText'
import { JsonLd } from '@/components/seo/JsonLd'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

// Fallback photo URLs used when CMS has no images
const fallbackFounderPhoto = `${SERVER_URL}/api/media/file/photo_4_2026-03-03_18-30-45.jpg`
const fallbackGalleryPhotos = [
  `${SERVER_URL}/api/media/file/photo_2_2026-03-03_18-30-45.jpg`,
  `${SERVER_URL}/api/media/file/photo_3_2026-03-03_18-30-45.jpg`,
  `${SERVER_URL}/api/media/file/photo_6_2026-03-03_18-30-45.jpg`,
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const aboutData = await getAboutPageData(locale)

  if (aboutData.seo?.metaTitle) {
    const title = aboutData.seo.metaTitle
    const description = aboutData.seo.metaDescription || ''
    return { title, description, ...buildPageMetadata(locale, 'about', { title, description }) }
  }

  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('aboutTitle')
  const description = t('aboutDesc')
  return { title, description, ...buildPageMetadata(locale, 'about', { title, description }) }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const data = await getAboutPageData(locale)
  const tPages = await getTranslations({ locale, namespace: 'pages' })

  const founderPhotoUrl = resolveMediaUrl(data.founderPhoto) || fallbackFounderPhoto
  const fullFounderPhotoUrl = founderPhotoUrl.startsWith('http') ? founderPhotoUrl : `${BASE_URL}${founderPhotoUrl}`

  const galleryPhotos = data.galleryPhotos.length > 0
    ? data.galleryPhotos.map((p) => resolveMediaUrl(p.image) || '')
    : fallbackGalleryPhotos

  const ctaPrimaryHref = localizeHref(data.ctaPrimaryHref, locale)
  const ctaSecondaryHref = localizeHref(data.ctaSecondaryHref, locale)

  const isEN = locale === 'en'

  // EN-specific H1 override for SEO
  const h1 = isEN ? 'Your Private Tour Guide in Prague' : data.founderHeading

  // EN-specific alt text for SEO
  const founderAlt = isEN
    ? 'uliana-formina-licensed-private-tour-guide-prague'
    : 'Ульяна Формина — основатель Best Prague Guide'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: tPages('aboutBreadcrumb') }]}
        locale={locale}
      />

      {/* Block 1: Founder */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-8">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
          <Image
            src={founderPhotoUrl}
            alt={founderAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            {h1}
          </h1>
          <SafeRichText data={data.founderBio} className="mt-6 text-lg text-navy/70 leading-relaxed prose prose-lg max-w-none text-justify" />
          {data.founderQuote && (
            <blockquote className="mt-6 border-l-4 border-gold pl-4 italic text-navy/60">
              &ldquo;{data.founderQuote}&rdquo;
            </blockquote>
          )}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-navy">
            {data.stats.map((stat, i) => (
              <div key={i}>
                <span className="text-2xl font-heading font-bold text-gold block">
                  {stat.value}
                </span>
                {stat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Block 2: Values */}
      <section className="py-16 border-t border-gray-light/50">
        <h2 className="text-3xl font-heading font-bold text-navy text-center mb-12">
          {data.valuesHeading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.values.map((item, index) => (
            <div
              key={index}
              className="text-center bg-white p-6 rounded-xl border border-gray-light/50"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 text-gold mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                {index + 1}
              </div>
              <h3 className="text-base font-heading font-semibold text-navy mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Block 3: Gallery */}
      <section className="py-16 border-t border-gray-light/50">
        {galleryPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-12">
            {galleryPhotos.map((src, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                  src={src}
                  alt={locale === 'ru' ? `Экскурсии по Праге ${i + 1}` : `Prague tours ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 33vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EN-only SEO sections */}
      {isEN && (
        <>
          {/* Why Hire a Private Guide */}
          <section className="py-16 border-t border-gray-light/50">
            <h2 className="text-3xl font-heading font-bold text-navy mb-8">
              Why Hire a Private Guide in Prague?
            </h2>
            <div className="prose prose-lg max-w-none text-navy/80">
              <p>Prague has more than a thousand years of layered history — Gothic churches built over Romanesque cellars, baroque palaces hiding Renaissance courtyards, and stories that only surface when someone who knows the city well is standing next to you. A private tour guide in Prague gives you all of this on your schedule, at your pace, with your questions answered in real time.</p>
              <p>The difference between exploring Prague on your own and exploring it with a licensed guide is not just information — it is access to stories you will not find on any plaque. Licensed guides in the Czech Republic hold government-issued certification and are the only professionals legally permitted to guide inside national monuments, including Prague Castle circuits and historic interiors. Every guide on our team holds a top-category licence — the highest level issued by the Czech Ministry.</p>
              <p>A private tour means just your group. No strangers, no fixed itinerary, no rushing to keep up with twenty other people. Families with children set a different pace than couples on a romantic trip. History enthusiasts want depth. First-time visitors want the highlights. A private guide adapts to what matters to you — and that is something no guidebook or group tour can offer.</p>
            </div>
          </section>

          {/* Our Private Tours */}
          <section className="py-16 border-t border-gray-light/50">
            <h2 className="text-3xl font-heading font-bold text-navy mb-8">
              Our Private Tours
            </h2>
            <p className="text-lg text-navy/80 mb-8">Every tour is private — your group only, with a licensed guide, at your pace.</p>

            <h3 className="text-xl font-heading font-semibold text-navy mb-4">Prague Tours</h3>
            <ul className="space-y-2 mb-8">
              <li className="text-navy/80"><Link href="/en/tours/all-prague-in-one-day" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">All Prague in One Day</Link> — the complete city in a single day</li>
              <li className="text-navy/80"><Link href="/en/tours/charles-bridge-old-town" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Charles Bridge &amp; Old Town</Link> — the historic heart of Prague</li>
              <li className="text-navy/80"><Link href="/en/tours/prague-castle-lesser-town" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Prague Castle &amp; Lesser Town</Link> — the castle complex and Malá Strana</li>
              <li className="text-navy/80"><Link href="/en/tours/hidden-prague-underground-alchemy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Hidden Prague Underground</Link> — medieval cellars, alchemy labs, and dark legends</li>
              <li className="text-navy/80"><Link href="/en/tours/best-of-prague-car-tour" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Best of Prague by Car</Link> — see more, walk less</li>
            </ul>

            <h3 className="text-xl font-heading font-semibold text-navy mb-4">Day Trips from Prague</h3>
            <ul className="space-y-2 mb-8">
              <li className="text-navy/80"><Link href="/en/tours/cesky-krumlov" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Český Krumlov</Link></li>
              <li className="text-navy/80"><Link href="/en/tours/kutna-hora" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Kutná Hora &amp; the Bone Church</Link></li>
              <li className="text-navy/80"><Link href="/en/tours/karlsbad" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Karlovy Vary</Link></li>
              <li className="text-navy/80"><Link href="/en/tours/terezin-memorial" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Terezín Memorial</Link></li>
              <li className="text-navy/80"><Link href="/en/tours/karlstejn-castle" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Karlštejn Castle</Link></li>
              <li className="text-navy/80"><Link href="/en/tours/hluboka-castle" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Hluboká Castle</Link></li>
              <li className="text-navy/80"><Link href="/en/tours/cesky-sternberk" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Český Šternberk</Link></li>
              <li className="text-navy/80"><Link href="/en/tours/kozel-brewery-tour" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Kozel Brewery</Link></li>
              <li className="text-navy/80"><Link href="/en/tours/skoda-factory" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Škoda Factory</Link></li>
            </ul>

            <h3 className="text-xl font-heading font-semibold text-navy mb-4">Evening</h3>
            <ul className="space-y-2 mb-8">
              <li className="text-navy/80"><Link href="/en/tours/2000-medieval-dinner-prague" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">Medieval Dinner Show</Link> — sword fights, fire shows, and a five-course feast</li>
            </ul>

            <p>
              <Link href="/en/tours" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark font-medium">
                View all tours and prices →
              </Link>
            </p>
          </section>

          {/* FAQ */}
          <section className="py-16 border-t border-gray-light/50">
            <h2 className="text-3xl font-heading font-bold text-navy mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqItems.map((item, i) => (
                <div key={i}>
                  <h3 className="text-lg font-heading font-semibold text-navy mb-2">{item.question}</h3>
                  <p className="text-navy/70">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* CTAs */}
      <section className={`${isEN ? '' : 'border-t border-gray-light/50 '}py-16 text-center`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href={ctaPrimaryHref} size="lg">
            {data.ctaPrimaryLabel}
          </Button>
          <Button href={ctaSecondaryHref} variant="secondary" size="lg">
            {data.ctaSecondaryLabel}
          </Button>
        </div>
      </section>

      {/* Schema.org JSON-LD — Person + LocalBusiness on all locales */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${BASE_URL}/#person-uliana`,
        name: 'Uliana Formina',
        jobTitle: 'Licensed Tour Guide',
        description: 'Licensed Czech tour guide with 17+ years of experience. Holds the Class II (top category) Czech National Guide Card issued by the Czech Ministry of Regional Development under Law No. 159/1999. Member of the World Federation of Tourist Guide Associations (WFTGA), the Czech Guides Association, and the Union of Tourist Business of the Czech Republic.',
        image: fullFounderPhotoUrl,
        url: `${BASE_URL}/en/licensed-guide-prague`,
        mainEntityOfPage: `${BASE_URL}/en/licensed-guide-prague`,
        worksFor: { '@id': `${BASE_URL}/#organization` },
        memberOf: [
          { '@type': 'Organization', name: 'World Federation of Tourist Guide Associations', alternateName: 'WFTGA' },
          { '@type': 'Organization', name: 'Czech Guides Association' },
          { '@type': 'Organization', name: 'Union of Tourist Business of the Czech Republic' },
        ],
        knowsAbout: ['Prague history', 'Czech culture', 'Czech Republic tourism', 'Prague Castle', 'Charles Bridge', 'Medieval architecture', 'Bohemian history', 'Jewish heritage in Prague', 'Czech beer culture', 'Day trips from Prague'],
        knowsLanguage: ['English', 'Russian', 'Czech'],
        hasCredential: [
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'Professional License',
            name: 'Czech National Guide Card, Class II (top category)',
            recognizedBy: {
              '@type': 'GovernmentOrganization',
              name: 'Ministry of Regional Development of the Czech Republic',
            },
          },
        ],
        nationality: { '@type': 'Country', name: 'Czech Republic' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': ['TravelAgency', 'LocalBusiness'],
        name: 'Best Prague Guide',
        url: BASE_URL,
        description: 'Private tour guide service in Prague and the Czech Republic. Licensed guides, English and Russian tours.',
        telephone: '+420776306858',
        email: 'info@bestpragueguide.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Prague',
          addressCountry: 'CZ',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 50.0755,
          longitude: 14.4378,
        },
        priceRange: '€€-€€€',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '08:00',
          closes: '20:00',
        },
        sameAs: [
          'https://www.instagram.com/ulianaisme/',
        ],
      }} />
      {/* FAQPage schema — EN only (English FAQ content) */}
      {isEN && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }} />
      )}
    </div>
  )
}

const faqItems = [
  {
    question: 'How do I book a private guide in Prague?',
    answer: 'Contact us via WhatsApp, email, or the booking form. We respond within a few hours and confirm availability for your dates.',
  },
  {
    question: 'How much does a private tour in Prague cost?',
    answer: 'Our private tours are priced per group, not per person — so the more people in your group, the better value per person. See each tour page for current prices.',
  },
  {
    question: 'Are your guides officially licensed?',
    answer: 'Yes. Every guide on our team holds a top-category certification from the Czech Ministry and is a member of the Prague and Czech Guides Association, affiliated with the World Federation of Tourist Guide Associations.',
  },
  {
    question: 'What languages do you offer tours in?',
    answer: 'English and Russian.',
  },
  {
    question: 'Can you create a custom tour?',
    answer: 'Absolutely. Tell us your interests — architecture, food, history, Jewish heritage, photography, off-the-beaten-path — and we build a private route just for you.',
  },
  {
    question: 'How far in advance should I book?',
    answer: 'We recommend at least a few days ahead, especially during peak season (April through October). Last-minute requests are welcome when availability allows.',
  },
]
