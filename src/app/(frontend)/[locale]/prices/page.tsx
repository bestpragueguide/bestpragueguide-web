import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPageBySlug } from '@/lib/cms-data'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { getDisplayPrice } from '@/lib/pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (locale !== 'en') return { title: 'Not Found' }
  const page = await getPageBySlug('prices', locale)
  const title = page?.seo?.metaTitle || 'Prague Private Tour Prices — Per Group | Best Prague Guide'
  const description = page?.seo?.metaDescription || 'Prague private tours from €119 per group — not per person. Transparent pricing, licensed guide, no hidden fees. See all tour prices →'
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/en/prices` },
    openGraph: { title, description, url: `${BASE_URL}/en/prices`, type: 'website' },
  }
}

// Tour slug categorization
const WALKING_SLUGS = ['charles-bridge-old-town', 'prague-castle-lesser-town', 'hidden-prague-underground-alchemy']
const FULL_DAY_SLUGS = ['all-prague-in-one-day', 'best-of-prague-car-tour']
const DAY_TRIP_SLUGS = ['cesky-krumlov', 'kutna-hora', 'karlsbad', 'terezin-memorial', 'karlstejn-castle', 'hluboka-castle', 'cesky-sternberk', 'kozel-brewery-tour', 'pilsner-urquell-brewery', 'skoda-factory']
const SPECIALTY_SLUGS = ['2000-medieval-dinner-prague', '1630-medieval-dinner-prague']

function getMinFromTours(tours: any[]): number | null {
  const prices = tours
    .map(t => {
      const priceInfo = t.pricing?.model ? getDisplayPrice(t.pricing) : null
      return priceInfo?.fromPrice || t.groupPrice || null
    })
    .filter((p): p is number => p != null && p > 0)
  return prices.length > 0 ? Math.min(...prices) : null
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale !== 'en') notFound()

  const page = await getPageBySlug('prices', locale)

  // Fetch all EN tours for dynamic pricing
  const payload = await getPayload({ config })
  const toursResult = await payload.find({
    collection: 'tours',
    where: { status: { equals: 'published' }, publishedLocales: { in: ['en'] } },
    limit: 0,
    locale: 'en',
  })
  const allTours = toursResult.docs

  const walkingTours = allTours.filter((t: any) => WALKING_SLUGS.includes(t.slug))
  const fullDayTours = allTours.filter((t: any) => FULL_DAY_SLUGS.includes(t.slug))
  const dayTripTours = allTours.filter((t: any) => DAY_TRIP_SLUGS.includes(t.slug))
  const specialtyTours = allTours.filter((t: any) => SPECIALTY_SLUGS.includes(t.slug))

  const walkingMin = getMinFromTours(walkingTours)
  const fullDayMin = getMinFromTours(fullDayTours)
  const dayTripsMin = getMinFromTours(dayTripTours)
  const specialtyMin = getMinFromTours(specialtyTours)

  // Find shortest walking tour for the per-person example
  const shortestWalking = walkingTours.length > 0 ? walkingTours.reduce((a: any, b: any) => {
    const aPrice = getMinFromTours([a]) || 9999
    const bPrice = getMinFromTours([b]) || 9999
    return aPrice <= bPrice ? a : b
  }) : null
  const shortestPrice = shortestWalking ? getMinFromTours([shortestWalking]) : walkingMin
  const perPersonExample = shortestPrice ? Math.round(shortestPrice / 4) : null

  const faqItems = [
    { question: 'How much does a private guide in Prague cost per hour?', answer: `Our private tours are priced per tour, not per hour. A 2-3 hour Prague walking tour starts from €${walkingMin || 119} per group — which works out to roughly €${walkingMin ? Math.round(walkingMin / 3) : 40} per hour of guiding on a 3-hour tour, less on longer tours. Per-hour pricing is not standard in Czech Republic private guiding because tours include preparation, route planning, and insider knowledge — not just time.` },
    { question: 'Is tipping expected in Prague?', answer: 'Tipping your guide is appreciated but not required. Most guests who enjoy their tour leave around €10 per person at the end, though there is no set expectation. Your tour price includes everything you owe us — tips are always optional.' },
    { question: 'Are entrance fees included in the tour price?', answer: 'No. Entrance tickets to Prague Castle, Jewish Quarter synagogues, Karlštejn Castle interiors, and similar paid attractions are purchased separately on site. Your guide helps you skip lines where possible. Entrance fees vary by attraction and are typically modest.' },
    { question: 'Do I pay before the tour or on the day?', answer: 'Both options work. You can pay online in advance by credit card, or pay cash on the day of the tour in EUR, USD, or CZK. No deposit is required for most tours. We confirm the booking first, then you choose the payment method.' },
    { question: 'Why is the price per group, not per person?', answer: `Because you are renting a private guide for the duration of your tour — not a seat in a group. One guide, one group, one price. This makes private tours dramatically more affordable for families and small groups. A typical Prague walking tour from €${walkingMin || 119} split between four people costs far less per person than a paid group tour.` },
    { question: 'Are prices negotiable?', answer: 'Standard tour prices are fixed and transparent — no hidden fees, no dynamic pricing. For custom tours with unusual itineraries, very long durations, or special requirements like weddings or corporate groups, we quote individually. Contact us directly for custom quotes.' },
  ]

  const categories = [
    { name: 'Prague Walking Tours', desc: 'Short city tours — Old Town, Charles Bridge, Castle highlights', duration: '2-3 hours', min: walkingMin, link: '/en/tours?category=prague-tours' },
    { name: 'Full Prague Day Tours', desc: 'Comprehensive Prague experiences covering multiple neighborhoods', duration: '5-7 hours', min: fullDayMin, link: '/en/tours' },
    { name: 'Day Trips from Prague', desc: 'Full-day tours outside Prague — castles, towns, breweries, memorials', duration: '8-10 hours', min: dayTripsMin, link: '/en/day-trips-from-prague' },
    { name: 'Specialty Experiences', desc: 'Unique Prague experiences — Medieval Dinner Show, Underground tour', duration: 'Varies', min: specialtyMin, link: '/en/tours' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Prices' }]} locale={locale} />

      {/* Hero */}
      <section className="py-12 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy">
          Prague Private Tour Prices
        </h1>
        <p className="mt-4 text-lg text-navy/70 max-w-2xl mx-auto">
          Transparent pricing, per group, no hidden fees. Just your group, no strangers.
        </p>
        <Link
          href="/en/tours"
          className="mt-8 inline-flex items-center px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
        >
          See All Tours
        </Link>
      </section>

      {/* Quick Answer */}
      <section className="py-8 bg-gold/5 rounded-xl p-8 mb-12">
        <p className="text-lg text-navy leading-relaxed">
          <strong>A private tour of Prague costs from €{walkingMin || 119} per group.</strong> All prices are per group (1-3 people), not per person. Full-day tours start from €{fullDayMin || 249}. Day trips from Prague start from €{dayTripsMin || 249}. Your <a href="/en/prague-guide" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">licensed guide</a>, hotel pickup where included, and a fully private experience — all for one transparent price.
        </p>
      </section>

      {/* Why Per Group */}
      <section className="py-8 mb-8">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">Why Per Group, Not Per Person</h2>
        <div className="prose prose-lg max-w-none text-navy/80">
          <p>Every tour price you see is for your entire group — not per person. A group of four pays the same as a solo traveler on the same tour. This makes private tours remarkably affordable when split among travelers.</p>
          {shortestWalking && shortestPrice && perPersonExample && (
            <p>For example, a {shortestWalking.title} tour at €{shortestPrice} works out to less than €{perPersonExample} per person for a family of four — often cheaper than group tours that crowd you with 25 strangers. The larger your group, the better the per-person value.</p>
          )}
        </div>
      </section>

      {/* Tour Categories */}
      <section className="py-8 mb-8">
        <h2 className="text-2xl font-heading font-bold text-navy mb-8">Tour Prices by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-light/50 p-6">
              <h3 className="text-lg font-heading font-semibold text-navy">{cat.name}</h3>
              <p className="mt-2 text-sm text-navy/60">{cat.desc}</p>
              <p className="mt-2 text-sm text-navy/60">Duration: {cat.duration}</p>
              {cat.min && (
                <p className="mt-4 text-2xl font-heading font-bold text-gold">
                  from €{cat.min} <span className="text-sm font-normal text-navy/40">per group</span>
                </p>
              )}
              <Link
                href={cat.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-gold hover:text-gold-dark"
              >
                See tours →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* What Affects Price */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">What Affects the Final Price</h2>
        <div className="prose prose-lg max-w-none text-navy/80">
          <p><strong>Group size.</strong> Most tours have tiered pricing based on group size. A tour for 1-3 guests costs less than the same tour for 8+. Larger groups get a slightly higher total but a dramatically lower per-person cost.</p>
          <p><strong>Duration.</strong> A 2-hour walking tour starts from €{walkingMin || 119}. A 6-hour Prague-in-one-day tour starts from €{fullDayMin || 249}. Day trips to Český Krumlov or Karlštejn start from €{dayTripsMin || 249}.</p>
          <p><strong>Destination.</strong> Tours within Prague are shorter and include walking. Day trips include private transportation with hotel pickup and drop-off.</p>
          <p><strong>Special experiences.</strong> The Medieval Dinner Show is priced per person because it includes a full meal and theatrical performance. Most other tours are priced per group.</p>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">What's Included in Every Private Tour</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-heading font-semibold text-trust mb-4">Always Included</h3>
            <ul className="space-y-2">
              {['Licensed top-category tour guide', 'Private group only — no strangers', 'Fully flexible itinerary', 'Hotel pickup on day trips', 'Private transportation on day trips and car tours', 'Commentary in English'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy/80">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-trust shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-navy mb-4">Not Included (Paid Separately)</h3>
            <ul className="space-y-2">
              {['Entrance fees to castles, museums, and attractions', 'Meals and drinks', 'Optional tips for the guide', 'Metro/tram tickets when walking tours use public transport'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy/60">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray shrink-0 mt-0.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">Private Tour vs. Free Walking Tour vs. Group Tour</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-light">
                <th className="text-left p-3 text-navy/60"></th>
                <th className="text-left p-3 text-navy/60">Free walking tour</th>
                <th className="text-left p-3 text-navy/60">Group tour</th>
                <th className="text-left p-3 text-navy font-semibold">Private tour with us</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Group size', '25-30 strangers', '10-15 strangers', 'Just your group'],
                ['Flexibility', 'Fixed route', 'Fixed route', 'Fully custom'],
                ['Pace', 'Fixed pace', 'Fixed pace', 'Your pace'],
                ['Guide licensed', 'Sometimes', 'Usually', 'Always (top-category)'],
                ['Questions', 'Limited time', 'Limited time', 'Unlimited'],
                ['Hotel pickup', 'No', 'Usually no', 'Yes on day trips'],
                ['Price (3h tour)', 'Free + tip', '€25-40/person', `from €${walkingMin || 119}/group`],
                ['Best for', 'Budget travelers', 'Solo travelers', 'Families, couples, depth'],
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-light/30">
                  <td className="p-3 font-medium text-navy">{row[0]}</td>
                  <td className="p-3 text-navy/60">{row[1]}</td>
                  <td className="p-3 text-navy/60">{row[2]}</td>
                  <td className="p-3 text-navy font-medium">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6 max-w-3xl">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-lg font-heading font-semibold text-navy mb-2">{item.question}</h3>
              <p className="text-navy/70">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 text-center border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-4">Ready to book a private tour of Prague?</h2>
        <p className="text-navy/70 mb-8">See all {allTours.length} tours with full details and prices.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/en/tours"
            className="inline-flex items-center px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
          >
            See All Tours
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
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/en` },
          { '@type': 'ListItem', position: 2, name: 'Prices', item: `${BASE_URL}/en/prices` },
        ],
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'OfferCatalog',
        name: 'Prague Private Tour Prices',
        itemListElement: categories.filter(c => c.min).map(cat => ({
          '@type': 'Offer',
          name: cat.name,
          description: cat.desc,
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: cat.min!.toString(),
            priceCurrency: 'EUR',
          },
        })),
      }} />
    </div>
  )
}
