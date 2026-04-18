import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '@/lib/markdown-to-lexical'

const SLUG = 'private-walking-tour-prague'
const LOCALE = 'en'

const TITLE = 'Private Walking Tour in Prague — Just Your Group, Licensed Guide'
const SUBTITLE =
  'Explore Prague on foot with a licensed Class II guide — your group only, no strangers, no mixed groups.'
const META_TITLE = 'Private Walking Tour in Prague — Licensed Guide'
const META_DESCRIPTION =
  'Private walking tour in Prague with a licensed Class II guide. Just your group — no strangers, no mixed groups, no OTA middleman. Book direct →'
const TOUR_SLUGS = [
  'charles-bridge-old-town',
  'prague-castle-lesser-town',
  'hidden-prague-underground-alchemy',
  'all-prague-in-one-day',
  'best-of-prague-car-tour',
].join(',')

const CONTENT_MARKDOWN = `**Updated April 2026**

A private walking tour in Prague is a guided tour where only your group participates — no strangers, no mixed groups. You book a licensed guide for a specific duration and route; the guide walks with you alone, adapting pace and content to your interests. I'm Uliana Formina, a <a href="/en/licensed-guide-prague" target="_blank" rel="noopener noreferrer">licensed Class II Czech guide</a> with 17+ years of experience, and I offer private walking tours starting from €129 per group — one quoted price, no per-person multiplication.

## What Makes It "Private" — No Strangers on Your Tour

"Private" in the context of walking tours has a specific meaning that most tour buyers don't fully realize until they experience it:

1. **Just your group.** The guide walks only with you — your family, your friends, your travel companions. No strangers join the tour.
2. **Fully customised itinerary.** Not a fixed route. I adjust based on what you've already seen, what you're curious about, and how your group is feeling on the day.
3. **Pace set by your group.** If you want to stop for a long coffee break, we stop. If you want to skip a landmark you've already visited, we skip it. No rushing to keep up with strangers; no waiting on stragglers.
4. **Language of your choice.** Commentary in English, Russian, or Czech — whichever works best for your group.
5. **Direct relationship with the guide.** Questions, requests, and conversation happen directly with me — not mediated through an OTA platform or filtered through a group dynamic.

By contrast, most "walking tours" advertised online are group tours — you join 10, 20, or 30 strangers, follow a fixed script, and move at the pace of the slowest stroller. That format has its place, but it's categorically different from what "private walking tour" should mean.

## Walking Tours I Offer

I offer the following private walking tours of Prague. Each can be booked standalone or combined with others into a longer day.

- <a href="/en/tours/charles-bridge-old-town" target="_blank" rel="noopener noreferrer">Charles Bridge &amp; Old Town</a> — the classic route: Old Town Square, Astronomical Clock, Týn Church, Charles Bridge statues, approaches to Lesser Town. Typical duration: 2-3 hours.
- <a href="/en/tours/prague-castle-lesser-town" target="_blank" rel="noopener noreferrer">Prague Castle &amp; Lesser Town</a> — St. Vitus Cathedral, Old Royal Palace, Golden Lane, castle gardens, and the descent through Nerudova street. Typical duration: 3-4 hours.
- <a href="/en/tours/hidden-prague-underground-alchemy" target="_blank" rel="noopener noreferrer">Hidden Prague — underground passages, alchemy, St. James's forearm</a> — less-visited sites that most tours skip: medieval cellars, alchemy history, obscure Old Town corners. Typical duration: 2-3 hours.
- <a href="/en/tours/all-prague-in-one-day" target="_blank" rel="noopener noreferrer">All Prague in One Day</a> — the full-day walking itinerary combining Old Town, Jewish Quarter, Charles Bridge, Lesser Town, and Prague Castle. Typical duration: 6-8 hours including lunch.
- <a href="/en/tours/best-of-prague-car-tour" target="_blank" rel="noopener noreferrer">Best of Prague (car + walking)</a> — a mixed format using a private vehicle to cover longer distances between walking stops. Useful for groups with limited mobility or tight schedules. Typical duration: 4-6 hours.

The full list of tours — including day trips outside Prague and specialty experiences — is at <a href="/en/tours" target="_blank" rel="noopener noreferrer">View all tours</a>.

## Typical Itineraries by Duration

Here's what a private walking tour typically covers by duration. These are starting templates — every itinerary adapts to your group.

### 2-hour walking tour (introductory)

Covers a compact area with one or two headline landmarks. Best for:

- First-time visitors with limited time
- Groups arriving late in the day who want an orientation walk
- Travellers who've seen Prague before and want a specific theme

Typical content: one district (Old Town OR Lesser Town OR Jewish Quarter), walking overview, photo stops, historical context.

### 3-4 hour walking tour (standard)

Covers two connected areas with multiple landmarks. Best for:

- First-time visitors with a full morning or afternoon
- Groups wanting a coherent narrative across the city's historic core
- Travellers wanting both Old Town and one additional area

Typical content: Old Town + Jewish Quarter, OR Old Town + Charles Bridge + Lesser Town, OR the Prague Castle complex.

### 6-8 hour walking tour (full day)

Covers most of historic Prague in one day. Best for:

- Travellers with one day in the city
- Groups wanting to see everything in a single experience
- Visitors from cruise ships or connecting flights

Typical content: Old Town + Jewish Quarter + Charles Bridge + Lesser Town + Prague Castle, with a proper lunch break in between.

### Multi-day walking tour (split over 2-3 days)

Combines multiple shorter walking tours across different days. Best for:

- Groups staying 3+ nights in Prague
- Travellers wanting depth over breadth
- Families with children who prefer shorter daily walks

Typical content: Day 1 Old Town + Jewish Quarter, Day 2 Prague Castle + Lesser Town, Day 3 specialty themes (alchemy, Kafka, WWII history).

## What to Expect — Pace, Terrain, Weather

**Pace.** I adapt to your group. Average walking pace is comfortable — roughly 1.5-2 km per hour with frequent stops for narration and photos. If your group includes older travellers or young children, I slow down. If you're fit and curious, I add more distance.

**Terrain.** Prague's historic core is mostly flat, but some areas involve uphill walking:

- **Old Town, Jewish Quarter, Charles Bridge** — flat, easy, suitable for all mobility levels.
- **Prague Castle area** — uphill approach from the Vltava River (via Nerudova street) involves a steady climb of about 20 minutes, OR we can take a tram to the top and walk down. Your choice.
- **Petřín Hill, Vyšehrad** — significant uphill; only included in tours if specifically requested.

If anyone in your group has mobility issues, please tell me in advance — I can plan a tram- and metro-assisted itinerary that skips the hills entirely.

**Weather.** I tour in any weather. Prague is magical in sunshine, rain, and snow, and I've guided in all three. Practical notes:

- **Summer (June-August):** 20-30°C; dress light, bring water, sunscreen.
- **Winter (December-February):** -5 to 5°C; dress warm, wear grip shoes if snow is likely.
- **Spring/Autumn:** variable; layers recommended.

If weather is extreme (storms, heavy snow, heat warnings), we can reschedule without fee up to the day of the tour.

## What's Included

Included in every private walking tour:

- **Licensed professional guide** — me, for the full duration, providing commentary in your chosen language
- **Fully customised itinerary** — adjusted to your group's interests and pace
- **Flexible route** — real-time adjustments based on weather, crowds, or energy level
- **Private experience** — just your group, no strangers
- **Recommendations** — restaurants, cafés, activities, side trips

Not included (specified clearly to avoid misunderstanding):

- **Paid entry tickets** for interior visits (Prague Castle ticket, museum admissions, synagogue entries) — either quoted separately or included in your quote if you've specified inclusion; always confirmed in writing before booking
- **Food and drink** — lunch stops and café recommendations are on your own account unless specifically arranged
- **Transport** — the guide meets you at an agreed central location; personal transport to/from your hotel is on your own (I can suggest simple metro or tram routes)

## Pricing

Private walking tours start from €129 per group for a standard-length tour. Pricing is per group, not per person — whether you're a solo traveller or a family of six, the quoted price is the total.

Full pricing details, including longer tours and day trips, are on the <a href="/en/prices" target="_blank" rel="noopener noreferrer">prices page</a>.

## How to Book

Send me your dates, group size, and what you'd like to see — by email, WhatsApp, or the contact form. I'll reply within a few hours.

Ready for a quote? <a href="/en/contact" target="_blank" rel="noopener noreferrer">Contact me directly</a>, message WhatsApp at +420 776 306 858, or email info@bestpragueguide.com.`

const FAQ_ITEMS = [
  {
    question: 'What is a private walking tour in Prague?',
    answer:
      'A guided walking tour where only your group participates — no strangers, no mixed groups. You book a licensed guide for a specific duration and route; the guide walks with you alone, adapting the itinerary to your interests, pace, and prior knowledge of the city.',
  },
  {
    question: 'How long is a typical private walking tour of Prague?',
    answer:
      'Most private walking tours run 2-8 hours. The 3-4 hour tour is the most common choice — long enough to cover two connected areas of historic Prague with depth, short enough to avoid fatigue. Shorter 2-hour tours suit orientation or evening walks; full-day 6-8 hour tours suit travellers with just one day in the city.',
  },
  {
    question: 'How much does a private walking tour in Prague cost?',
    answer:
      'Private walking tours start from €129 per group. Pricing is per group, not per person — the quoted price is the total for everyone in your party. Longer tours and tours with included entries cost more.',
  },
  {
    question: 'Is a private walking tour worth it versus a group walking tour?',
    answer:
      'A private tour gives flexibility, a guide focused on your group alone, no strangers, and a pace set by your group — but costs more in absolute terms for solo travellers. Group tours are cheaper per person but require accepting the fixed script and the pace of 20-30 strangers. For couples, families, and small groups, per-group private pricing is often competitive with per-person group pricing.',
  },
  {
    question: 'How much walking is involved?',
    answer:
      "Average walking pace is comfortable, roughly 1.5-2 km per hour with frequent stops. A 3-hour tour typically covers 4-6 km. Prague's historic core is mostly flat, but approaches to Prague Castle involve uphill walking, which can be replaced with a tram ride if needed.",
  },
  {
    question: 'What if someone in our group has mobility issues?',
    answer:
      "A tram- and metro-assisted itinerary can be planned in advance, skipping hills and using accessible routes with more frequent rest stops. Prague's historic core is generally accessible; the main challenge is approaches to Prague Castle, which can be handled by public transport.",
  },
  {
    question: 'What languages are tours offered in?',
    answer:
      'English, Russian, and Czech. The whole tour is conducted in one chosen language — whichever works best for your group.',
  },
  {
    question: 'What happens if it rains during the walking tour?',
    answer:
      "Tours run in any weather. Prague's historic routes have covered arcades, cafés, and interiors available as shelter if breaks are needed. If weather is extreme (storms, heat warnings, heavy snow), tours can be rescheduled without fee up to the day of the tour.",
  },
  {
    question: 'Can a walking tour be combined with a day trip outside Prague?',
    answer:
      'Yes. Many travellers split their Prague visit — one day walking in the city, another day on a day trip to Český Krumlov, Kutná Hora, or Karlštejn. These are separate tours with separate quotes, combined into a multi-day itinerary.',
  },
  {
    question: 'How do I book a private walking tour in Prague?',
    answer:
      'Send dates, group size, and tour preferences by email, WhatsApp, or the contact form. A specific quote is typically provided within a few hours. No booking fee, no prepayment required for cash bookings.',
  },
]

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: SLUG } },
      locale: LOCALE,
      limit: 1,
    })

    const contentLexical = markdownToLexical(CONTENT_MARKDOWN)

    const data = {
      title: TITLE,
      slug: SLUG,
      template: 'landing',
      subtitle: SUBTITLE,
      landingTourSlugs: TOUR_SLUGS,
      content: contentLexical as any,
      faqItems: FAQ_ITEMS,
      seo: {
        metaTitle: META_TITLE,
        metaDescription: META_DESCRIPTION,
      },
      _status: 'published',
    } as any

    if (existing.docs.length > 0) {
      const doc = existing.docs[0]
      await payload.update({
        collection: 'pages',
        id: doc.id,
        locale: LOCALE,
        data,
      })
      return NextResponse.json({
        action: 'updated',
        id: doc.id,
        slug: SLUG,
        faqCount: FAQ_ITEMS.length,
      })
    }

    const doc = await payload.create({
      collection: 'pages',
      locale: LOCALE,
      data,
    })
    return NextResponse.json({
      action: 'created',
      id: doc.id,
      slug: SLUG,
      faqCount: FAQ_ITEMS.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
