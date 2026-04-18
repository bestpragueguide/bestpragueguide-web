import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { getDisplayPrice } from '@/lib/pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

// Hand-coded page — metadata lives in code, not the Pages CMS row.
// (A stale CMS seo override was previously taking precedence; intentional source of truth = this file.)
const META_TITLE = 'Prague Private Tour Prices — Per Group, Not Per Person'
const META_DESCRIPTION =
  'Prague private tour prices — charged per group, not per person. Licensed guide, 17+ years. No OTA commission, no hidden fees. Get a quote direct →'

const UPDATED_DATE = 'April 2026'
const UPDATED_DATETIME = '2026-04'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (locale !== 'en') return { title: 'Not Found' }
  return {
    title: META_TITLE,
    description: META_DESCRIPTION,
    alternates: { canonical: `${BASE_URL}/en/prices` },
    openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${BASE_URL}/en/prices`, type: 'website' },
  }
}

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

  const walkingMin = getMinFromTours(walkingTours) ?? 129
  const fullDayMin = getMinFromTours(fullDayTours) ?? 289
  const dayTripsMin = getMinFromTours(dayTripTours) ?? 249
  const specialtyMin = getMinFromTours(specialtyTours) ?? 89

  const fromPrice = walkingMin

  const faqItems = [
    {
      question: 'How much does a private Prague tour cost?',
      answer: `Prices start from €${fromPrice} per group for a standard Prague walking tour. Longer tours, day trips outside Prague, and tours with included entries cost more. Every quote is per group — not per person — so the number you are quoted is the total for everyone in your party.`,
    },
    {
      question: 'Is the price per person or per group?',
      answer: 'Per group. Whether your party is one traveller or six, the quoted price is the total. This is different from most tours sold on third-party booking sites, which price per person. For couples and families, per-group pricing typically works out significantly cheaper.',
    },
    {
      question: 'What is the cheapest tour you offer?',
      answer: `A standard Prague walking tour starts from €${fromPrice} per group. This covers a licensed guide for the duration, a customised itinerary, and a fully private experience. Your exact quote depends on tour length and any specific inclusions.`,
    },
    {
      question: 'Why do some tour websites list lower prices?',
      answer: 'Most low prices advertised online are per person, and many include hidden fees at checkout. A "€20 per person" tour becomes €80 for a family of four. My per-group pricing is the total, with no multiplication at checkout. Compare the total cost, not the per-person figure.',
    },
    {
      question: 'Do you charge more for larger groups?',
      answer: 'The base price stays the same for typical group sizes. Very large groups (10+) may require a slightly larger vehicle for day trips, which adjusts the price. For walking tours in Prague, group size within typical ranges does not affect the price.',
    },
    {
      question: 'What is included in the quoted price?',
      answer: 'A licensed professional guide for the full duration, a fully customised itinerary, and a fully private experience. Paid entry tickets (Prague Castle, museums, etc.) are either quoted separately or included in the total — always specified clearly in writing before booking.',
    },
    {
      question: 'How do I pay?',
      answer: 'You can pay in cash on the day of the tour (EUR, USD, or CZK accepted), or by card in advance via a secure payment link. Card payments cannot be processed on the day itself — only in advance.',
    },
    {
      question: 'Do you require a deposit?',
      answer: 'No deposit is required for cash payments. For card payments, the full amount is charged in advance. There are no booking fees.',
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation up to 24 hours before the tour. No fee, no questions asked. If something comes up closer to the tour, contact me — I will work with you where possible.',
    },
    {
      question: 'Can I book direct instead of through an OTA platform?',
      answer: 'Yes — booking direct is encouraged and typically cheaper, because there is no OTA commission (typically 20-30%) built into the price. Contact me by email, WhatsApp, or the contact form on this site.',
    },
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
          Prague Private Tour Prices — Per Group, Not Per Person
        </h1>
        <p className="mt-3 text-sm text-navy/50">
          <time dateTime={UPDATED_DATETIME}>Updated {UPDATED_DATE}</time>
        </p>
      </section>

      {/* Direct answer */}
      <section className="py-8 bg-gold/5 rounded-xl p-8 mb-12">
        <p className="text-lg text-navy leading-relaxed">
          A private Prague tour with a licensed local guide typically costs <strong>from €{fromPrice} per group</strong> for a walking tour, with longer and specialty tours ranging higher. I&apos;m Uliana Formina — a <Link href="/en/licensed-guide-prague" className="text-gold hover:text-gold-dark underline">licensed Class II Czech tour guide</Link> with 17+ years of experience — and I price per group, not per person. Whether your party is one traveller or six, the quoted price covers everyone: guides aren&apos;t paid by the head, and you shouldn&apos;t be charged that way either.
        </p>
      </section>

      {/* Why Per Group */}
      <section className="py-8 mb-8">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">Why I Charge Per Group, Not Per Person</h2>
        <div className="prose prose-lg max-w-none text-navy/80">
          <p>
            Most tours advertised on online travel agency (OTA) platforms price per person. A family of four looking at a &ldquo;€40 per person&rdquo; tour is actually paying €160 — and they didn&apos;t realize it until checkout. I price differently, and the reason is simple: the tour takes the same time to prepare and deliver whether you&apos;re one person or six.
          </p>
          <ol>
            <li><strong>One quoted price for the whole group.</strong> The number you see is the number you pay. No per-head multiplication at checkout.</li>
            <li><strong>No hidden pressure to travel in larger groups to get value.</strong> A solo traveller pays the same as a couple, the same as a family of four, for the same tour.</li>
            <li><strong>Transparent quotes by email before you commit.</strong> You get the full price in writing before booking — not after you&apos;ve handed over a card.</li>
            <li><strong>No commission middleman.</strong> Booking direct means no platform fee baked into the quote.</li>
          </ol>
        </div>
      </section>

      {/* What Determines Price */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">What Actually Determines the Price</h2>
        <div className="prose prose-lg max-w-none text-navy/80">
          <p>Prague private tour pricing depends on four factors, in this order of impact:</p>
          <ol>
            <li><strong>Tour length.</strong> A 2-hour walking tour costs less than a 6-hour <Link href="/en/tours/all-prague-in-one-day" className="text-gold hover:text-gold-dark">all-Prague-in-one-day</Link> tour. Most of my price variation comes from duration, not anything else.</li>
            <li><strong>Whether transport is required.</strong> Day trips to <Link href="/en/tours/cesky-krumlov" className="text-gold hover:text-gold-dark">Český Krumlov</Link>, <Link href="/en/tours/kutna-hora" className="text-gold hover:text-gold-dark">Kutná Hora</Link>, <Link href="/en/tours/karlstejn-castle" className="text-gold hover:text-gold-dark">Karlštejn</Link>, Terezín, and similar destinations include the cost of a private vehicle and driver. Prague-only walking tours don&apos;t have this cost.</li>
            <li><strong>Group size (only at the edges).</strong> The base price stays the same for groups up to a typical size. Very large groups (10+) may require a slightly larger vehicle for day trips, which adjusts the price slightly. Small and medium groups pay the base price.</li>
            <li><strong>Specialty content.</strong> Tours that include paid entries (castle tickets, museum admissions, the <Link href="/en/tours/2000-medieval-dinner-prague" className="text-gold hover:text-gold-dark">Medieval Dinner Show at U Pavouka</Link>) include those costs in the quote.</li>
          </ol>
          <p>
            I send a specific quote by email for every inquiry — there&apos;s no fixed price list because every trip is slightly different. The &ldquo;from €{fromPrice} per group&rdquo; figure on this page is the starting point for a standard Prague walking tour.
          </p>
        </div>
      </section>

      {/* Per-group vs per-person math */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">Per-Group vs. Per-Person — The Real Math</h2>
        <p className="text-navy/70 mb-6">
          Here&apos;s what the per-group model looks like compared to per-person pricing that&apos;s standard on OTA platforms. The numbers below are illustrative — your actual quote will depend on the factors above.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-light">
                <th className="text-left p-3 text-navy/60">Group size</th>
                <th className="text-left p-3 text-navy/60">Typical OTA per-person price</th>
                <th className="text-left p-3 text-navy/60">OTA total for your group</th>
                <th className="text-left p-3 text-navy font-semibold">My per-group price</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['2 travellers', '€40', '€80', `from €${fromPrice}`],
                ['4 travellers', '€40', '€160', `from €${fromPrice}`],
                ['6 travellers', '€40', '€240', `from €${fromPrice}`],
                ['8 travellers', '€40', '€320', `from €${fromPrice}`],
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
        <p className="mt-6 text-navy/70">
          For solo travellers, a per-person OTA tour may cost less in absolute terms — this pricing model is designed for groups. From 2 travellers upward, per-group pricing typically works out significantly cheaper while providing a genuinely private experience: no strangers on your tour, flexible itinerary, single point of contact with the guide. If you&apos;re travelling solo and the guide fee matters more than privacy, the honest answer is that an OTA group tour may be a better fit for your budget.
        </p>
      </section>

      {/* Tour Categories */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
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
                className="mt-4 inline-block text-sm font-medium text-gold hover:text-gold-dark"
              >
                See tours →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* What's Included */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">What&apos;s Included in Every Tour</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-heading font-semibold text-trust mb-4">Always Included</h3>
            <ul className="space-y-2">
              {[
                'Licensed professional guide — me, for the full duration, with personalised commentary in English, Russian, or Czech',
                'Fully customised itinerary tailored to your group\'s interests, pace, and mobility',
                'Flexible route — I can adjust in real-time based on weather, crowds, or your energy level',
                'Private experience — just your group, no strangers',
                'Detailed recommendations — restaurants, cafés, activities, side trips, based on what you\'ve enjoyed on the tour',
              ].map((item, i) => (
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
              {[
                'Paid entry tickets for Prague Castle, museums, etc. — quoted separately or included in your quote if specified, always confirmed in writing before booking',
                'Food and drink — lunch stops and café recommendations are on your own account unless specifically arranged',
                'Personal transport to/from your hotel (outside of day-trip vehicle transport, which is included)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy/60">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray shrink-0 mt-0.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Direct booking vs OTA */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">Direct Booking vs. OTA Platforms — An Honest Comparison</h2>
        <p className="text-navy/70 mb-6">
          Every booking you make through an OTA platform carries a commission of typically 20-30%, built into the price you see. When you book direct, that commission goes away. Here&apos;s an honest comparison, with no spin — both models have valid use cases.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-light">
                <th className="text-left p-3 text-navy/60">Factor</th>
                <th className="text-left p-3 text-navy font-semibold">Direct booking with me</th>
                <th className="text-left p-3 text-navy/60">Booking through an OTA platform</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Price', 'No platform commission added', '20-30% commission typically baked in'],
                ['Pricing model', 'Per group', 'Usually per person'],
                ['Who you book with', 'Me directly, by email or WhatsApp', 'A platform; the guide is assigned'],
                ['Cancellation', 'Free up to 24 hours before tour', 'Depends on platform policy'],
                ['Changes mid-tour', 'I accommodate within reason', 'Platform script, less flexible'],
                ['Reviews visible', 'Direct recommendations from past guests', 'Aggregated platform ratings'],
                ['Customer support', 'Me, directly, by phone or email', 'Platform support (not the guide)'],
                ['Convenience trade-off', 'Email/WhatsApp back-and-forth', 'Unified dashboard if you book multiple activities on one platform'],
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-light/30">
                  <td className="p-3 font-medium text-navy">{row[0]}</td>
                  <td className="p-3 text-navy font-medium">{row[1]}</td>
                  <td className="p-3 text-navy/60">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-navy/70">
          OTA platforms serve real purposes — they aggregate options for comparison, offer multi-activity dashboards, and provide buyer protection systems. None of that is worthless. But if you&apos;ve already decided you want a private licensed guide in Prague, booking direct saves you money without losing anything material. The tour is the same.
        </p>
      </section>

      {/* Payment and Cancellation */}
      <section className="py-8 mb-8 border-t border-gray-light/50">
        <h2 className="text-2xl font-heading font-bold text-navy mb-6">Payment and Cancellation</h2>
        <div className="prose prose-lg max-w-none text-navy/80">
          <p>How payment and cancellation work:</p>
          <ol>
            <li><strong>Quote by email.</strong> You send an inquiry; I reply with a specific price and confirm the meeting point.</li>
            <li><strong>No prepayment required for cash payers.</strong> If you&apos;re paying cash on the day, no advance payment is needed to hold your booking.</li>
            <li><strong>Card payment is in advance.</strong> If you prefer card, I send a secure payment link; card payments cannot be processed on the day itself — only in advance.</li>
            <li><strong>Cash on the day: EUR, USD, or CZK accepted.</strong> No exchange rate penalties; I accept whichever currency works best for you.</li>
            <li><strong>Free cancellation up to 24 hours before the tour.</strong> No cancellation fee, no questions asked — just let me know by email or WhatsApp.</li>
            <li><strong>Last-minute changes accommodated where possible.</strong> If you need to move the tour by a day or two within your trip, I&apos;ll do my best to reshuffle.</li>
          </ol>
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
        <h2 className="text-2xl font-heading font-bold text-navy mb-4">Ready for a quote?</h2>
        <p className="text-navy/70 mb-8">
          Every trip is different — send me your dates and group size, and I&apos;ll reply with a specific price within a few hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/en/contact"
            className="inline-flex items-center px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
          >
            Get a quote
          </Link>
          <Link
            href="https://wa.me/420776306858"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-navy text-navy font-medium rounded-lg hover:bg-navy hover:text-white transition-colors"
          >
            WhatsApp
          </Link>
          <Link
            href={`/en/tours`}
            className="inline-flex items-center px-6 py-3 border border-gray-light text-navy/80 font-medium rounded-lg hover:border-navy transition-colors"
          >
            See all {allTours.length} tours
          </Link>
        </div>
      </section>

      {/* Schema */}
      {/* BreadcrumbList injected by Breadcrumbs. Organization/TravelAgency/WebSite sitewide. */}
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
