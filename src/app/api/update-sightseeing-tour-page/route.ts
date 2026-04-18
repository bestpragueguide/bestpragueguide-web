import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '@/lib/markdown-to-lexical'

const SLUG = 'prague-sightseeing-tour'
const LOCALE = 'en'

const TITLE = 'Prague Sightseeing Tour — Private, Licensed Guide, All Major Sights'
const SUBTITLE =
  'Private sightseeing tours of Prague and the Czech Republic — walking, day trips, and specialty experiences, led by a licensed Class II guide.'
const META_TITLE = 'Prague Sightseeing Tour — Private Licensed Guide'
const META_DESCRIPTION =
  'Private Prague sightseeing tour with a licensed Class II guide. Walking tours, day trips, specialty experiences — just your group, no strangers →'

// Featured in the tour grid (LandingPage "Our Tours" section).
// Chosen to represent all three categories visually.
const TOUR_SLUGS = [
  'charles-bridge-old-town',
  'prague-castle-lesser-town',
  'all-prague-in-one-day',
  'cesky-krumlov',
  'kutna-hora',
  '2000-medieval-dinner-prague',
].join(',')

const CONTENT_MARKDOWN = `**Updated April 2026**

A Prague sightseeing tour covers the city's main historical and cultural landmarks — Old Town Square, Charles Bridge, Prague Castle, the Jewish Quarter, and surrounding areas — led by a private local guide. I'm Uliana Formina, a <a href="/en/licensed-guide-prague" target="_blank" rel="noopener noreferrer">licensed Class II Czech guide</a> with 17+ years of experience, and I offer private sightseeing tours covering Prague itself (walking format) plus day trips to notable sights within the Czech Republic. Prices start from €129 per group for a standard Prague walking tour, with longer tours and day trips ranging higher.

## What a Private Sightseeing Tour Covers

A "private sightseeing tour" in Prague means two things that most visitors don't separate clearly: the places you'll see, and the fact that you'll see them alone with your group. Both matter. Below I explain what "private" means in practice, and what's actually covered on a standard Prague sightseeing tour.

What "private" means:

1. **Only your group.** The guide walks (or drives) with just you — your family, friends, travel companions. No strangers join.
2. **Customised coverage.** Not a fixed script. I adjust which sights to prioritize based on your interests, prior visits, energy level, and time available.
3. **Pace set by your group.** Long coffee breaks, extra photo time, skipping something you've already seen — all fine. No keeping up with 20 strangers.
4. **Language of your choice.** English, Russian, or Czech.
5. **Direct booking.** You book with me, not through a platform. Questions go straight to the guide.

What gets covered on a standard Prague sightseeing tour:

1. **Old Town Square** — the Astronomical Clock, Týn Church, Old Town Hall
2. **Charles Bridge** — the statues, the Vltava river views, the historical context
3. **Prague Castle complex** — St. Vitus Cathedral, Old Royal Palace, Golden Lane (interior entries require ticketed access — paid separately or included per your quote)
4. **Jewish Quarter (Josefov)** — the synagogues, the Old Jewish Cemetery, the cultural history
5. **Lesser Town (Malá Strana)** — baroque churches, cobbled streets, views back to Old Town
6. **Approaches and context** — river walks, historic street routing, "why this is here" narration linking sites together

Longer and day-trip tours cover additional destinations — see below.

## Three Categories of Tours

I offer tours in three categories. Every tour is private — just your group. Click any tour for details and booking.

### Prague Walking Tours

Private walking tours covering Prague's historic core. Typical duration 2-8 hours, per-group pricing, no interior tickets required unless specified.

- <a href="/en/tours/charles-bridge-old-town" target="_blank" rel="noopener noreferrer">Charles Bridge &amp; Old Town</a> — Old Town Square, Astronomical Clock, Týn Church, Charles Bridge statues, approaches to Lesser Town. Typical duration 2-3 hours.
- <a href="/en/tours/prague-castle-lesser-town" target="_blank" rel="noopener noreferrer">Prague Castle &amp; Lesser Town</a> — St. Vitus Cathedral, Old Royal Palace, Golden Lane, castle gardens, descent through Nerudova street. Typical duration 3-4 hours.
- **Hidden Prague — underground passages and alchemy** — less-visited sites: medieval cellars, alchemy history, obscure Old Town corners. Typical duration 2-3 hours.
- <a href="/en/tours/all-prague-in-one-day" target="_blank" rel="noopener noreferrer">All Prague in One Day</a> — the full-day walking itinerary combining Old Town, Jewish Quarter, Charles Bridge, Lesser Town, and Prague Castle. Typical duration 6-8 hours including lunch.
- **Best of Prague (car + walking)** — mixed format using a private vehicle between walking stops. Useful for groups with limited mobility or tight schedules. Typical duration 4-6 hours.

See also: <a href="/en/private-walking-tour-prague" target="_blank" rel="noopener noreferrer">Private walking tour overview</a> — more detail on the walking tour format, including itineraries by duration.

### Day Trips from Prague

Private driving tours to sights outside Prague. Include a private vehicle and driver in the quote. Typical duration 6-12 hours.

- <a href="/en/tours/cesky-krumlov" target="_blank" rel="noopener noreferrer">Český Krumlov</a> — UNESCO medieval town in South Bohemia. Full-day (2-2.5 hours each way).
- <a href="/en/tours/kutna-hora" target="_blank" rel="noopener noreferrer">Kutná Hora (Bone Church)</a> — the Sedlec Ossuary plus the historic silver-mining town. Half-to-full day (~1 hour each way).
- <a href="/en/tours/karlstejn-castle" target="_blank" rel="noopener noreferrer">Karlštejn Castle</a> — Gothic castle built by Charles IV. Half day (~45 minutes each way).
- **Karlovy Vary (Karlsbad)** — historic spa town in West Bohemia. Full day.
- **Terezín Memorial** — WWII concentration camp memorial and former Jewish ghetto. Half-to-full day.

### Specialty Experiences

Less conventional tours focused on specific themes.

- <a href="/en/tours/2000-medieval-dinner-prague" target="_blank" rel="noopener noreferrer">Medieval Dinner Show at U Pavouka</a> — historic tavern in Old Town with period entertainment (sword fights, fire show, fencing) and a multi-course meal. Typical duration 3-4 hours.

The full list of all 17 tours is at <a href="/en/tours" target="_blank" rel="noopener noreferrer">View all tours</a>. For detailed pricing across all categories, see the <a href="/en/prices" target="_blank" rel="noopener noreferrer">prices page</a>.

## How to Plan Your Sightseeing in Prague

Here's how I typically structure sightseeing based on how much time you have. Every plan adapts to your group's interests — these are starting templates.

### One day in Prague

A single day is enough for the main landmarks on a full-day walking tour (6-8 hours): Old Town + Jewish Quarter + Charles Bridge + Lesser Town + Prague Castle, with a proper lunch break. Enough to see Prague's historic core; not enough for day trips outside the city. Most cruise-ship travellers and short-stay visitors fit this pattern.

### Two days in Prague

With two days, you can split between deep sightseeing and a day trip:

- **Day 1** — Prague walking tour covering the main historic core (4-6 hours)
- **Day 2** — Half-day walking tour of a specialty area (Jewish Quarter in depth, or Prague Castle interiors) OR a short day trip like Karlštejn Castle (4-6 hours round trip)

### Three to five days in Prague

Enough to see Prague properly and do two day trips:

- **Day 1** — Full-day Prague walking tour
- **Day 2** — Český Krumlov day trip (full day, the most popular)
- **Day 3** — Second Prague walking tour with thematic focus (Kafka, alchemy, WWII history, Jewish Quarter)
- **Day 4** — Kutná Hora or Karlštejn day trip
- **Day 5** — Free day, or specialty experience like the Medieval Dinner Show, or a third day trip (Terezín, Hluboká)

### A week or more

With a week you can add less-visited destinations:

- Extended Prague coverage — less-touristed neighbourhoods, hidden history
- Two or three day trips across different directions (South Bohemia, spa towns, WWII history)
- Half-day specialty tours between longer days
- Proper rest days between intensive touring — Prague fatigue is real after 3-4 full days

## What to Expect — Pace, Language, Logistics

**Pace.** I adapt to your group. Walking pace on city tours is comfortable — roughly 1.5-2 km per hour with frequent stops. Driving day trips involve 1.5-5 hours of travel time total (both directions combined — short trips like Karlštejn or Kutná Hora add up quickly; longer destinations like Český Krumlov or Hluboká take 4-5 hours round trip just for driving), plus 3-6 hours at the destination. If your group includes older travellers, young children, or anyone with mobility constraints, tell me in advance and I'll adjust the plan accordingly.

**Language.** All tours are conducted in one language chosen by you — English, Russian, or Czech. The full tour is in that single language, including narration, Q&A, and informal conversation.

**Logistics.**

- **Meeting point** — I meet you at an agreed central location (usually your hotel lobby or a prominent landmark near your accommodation)
- **Transport** — Prague walking tours use your feet plus occasional metro/tram rides (tickets covered by you on the go); day trips include a private vehicle with driver in the quote
- **Lunch** — Prague tours typically include a lunch break at a recommended café or restaurant; day trips usually stop in the destination town for proper local food
- **Return** — I return you to your hotel or agreed drop-off point at the end of the tour

**Weather.** I tour in any weather. Prague has covered arcades, cafés, and interiors to shelter in if rain gets heavy. Winter tours include warming breaks. If conditions are extreme (severe storms, heat warnings), we can reschedule without fee up to the tour day.

## Pricing

Sightseeing tours start from €129 per group for a standard Prague walking tour. Day trips cost more because they include a private vehicle and driver. All pricing is per group, not per person — the quoted number is the total for everyone in your party, up to typical group sizes.

Full pricing details, payment methods, and cancellation policy are on the <a href="/en/prices" target="_blank" rel="noopener noreferrer">prices page</a>.

## How to Book

Send me your dates, group size, and what you'd like to see — by email, WhatsApp, or the contact form. I'll reply within a few hours.

Ready for a quote? <a href="/en/contact" target="_blank" rel="noopener noreferrer">Contact me directly</a>, message WhatsApp at +420 776 306 858, or email info@bestpragueguide.com.`

const FAQ_ITEMS = [
  {
    question: 'What is a private Prague sightseeing tour?',
    answer:
      "A guided tour covering Prague's main historical and cultural landmarks — Old Town Square, Charles Bridge, Prague Castle, Jewish Quarter, Lesser Town — led by a private licensed guide who walks (or drives, for day trips) only with your group. No strangers, no mixed groups.",
  },
  {
    question: 'How many days do I need in Prague to see the main sights?',
    answer:
      'One full day is enough to see the main landmarks on a full-day walking tour covering Old Town, Jewish Quarter, Charles Bridge, Lesser Town, and Prague Castle. Two days gives proper depth plus a short day trip. Three to five days is ideal for Prague plus day trips to Český Krumlov, Kutná Hora, or Karlštejn.',
  },
  {
    question: 'What is included in a Prague sightseeing tour?',
    answer:
      "A licensed private guide for the full duration, a fully customised itinerary adapted to your group's interests, flexible pace, and narration in English, Russian, or Czech. For Prague walking tours, no vehicle is needed (we use streets and occasional metro/tram). For day trips, a private vehicle with driver is included in the quote. Paid interior entry tickets (Prague Castle ticket, museum admissions) are either quoted separately or included in the total — specified clearly before booking.",
  },
  {
    question: 'How much does a Prague sightseeing tour cost?',
    answer:
      'Prices start from €129 per group for a standard Prague walking tour. Day trips outside Prague cost more (they include private vehicle + driver). Every quote is per group, not per person — the quoted price is the total for everyone in your party.',
  },
  {
    question: 'What is the difference between a Prague walking tour and a day trip?',
    answer:
      'Walking tours stay within Prague and cover the historic core on foot, with occasional metro/tram use. Day trips use a private vehicle to reach destinations outside Prague — Český Krumlov (2-2.5 hours each way), Kutná Hora (~1 hour each way), Karlštejn Castle (~45 minutes each way), Terezín (~1 hour each way), and others. Walking tours typically run 2-8 hours; day trips typically run 6-12 hours including travel time.',
  },
  {
    question: 'Can we combine Prague sightseeing with day trips?',
    answer:
      'Yes — most guests with 3+ days do exactly this. A typical pattern is: Day 1 full-day Prague walking tour, Day 2 Český Krumlov day trip, Day 3 shorter Prague walk plus Kutná Hora or Karlštejn day trip. Multi-day itineraries are designed as one coordinated plan rather than separate quotes.',
  },
  {
    question: 'Are interior entries included in the tour price?',
    answer:
      "It depends on how you prefer to book. Standard quotes cover the guide's time only; paid interior entries (Prague Castle ticket, Jewish Quarter synagogue tickets, museum admissions) are listed separately in the quote. If you prefer a fully-inclusive price, ticket costs can be added to the quote — always specified clearly in writing before booking.",
  },
  {
    question: 'What languages are Prague sightseeing tours offered in?',
    answer:
      'English, Russian, and Czech. The entire tour is conducted in one chosen language.',
  },
  {
    question: 'What happens if it rains during the tour?',
    answer:
      'Tours run in any weather. Prague has covered arcades, cafés, and interior shelter throughout the historic core. For day trips, indoor sights such as castles, museums, and churches often make rainy days feel atmospheric. If conditions are extreme (severe storms, heat warnings), tours can be rescheduled without fee up to the tour day.',
  },
  {
    question: 'How do I book a Prague sightseeing tour?',
    answer:
      'Send dates, group size, and preferred tour type by email, WhatsApp, or the contact form. A specific quote is typically provided within a few hours. No booking fee, free cancellation up to 24 hours before the tour.',
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
