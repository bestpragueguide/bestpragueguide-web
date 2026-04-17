import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '@/lib/markdown-to-lexical'

const SLUG = 'licensed-guide-prague'
const LOCALE = 'en'

const TITLE = 'Licensed Tour Guide in Prague — Uliana Formina'
const SUBTITLE =
  'Class II Czech National Guide Card · WFTGA member · Private tours only — just your group, no strangers.'
const META_TITLE = 'Licensed Tour Guide in Prague — Uliana Formina'
const META_DESCRIPTION =
  'Licensed Class II Czech guide in Prague since 2009. WFTGA member. 10,000+ guests. Private tours only — just your group, no strangers. Book direct →'
const TOUR_SLUGS = [
  'charles-bridge-old-town',
  'prague-castle-lesser-town',
  'all-prague-in-one-day',
  'hidden-prague-underground-alchemy',
  'best-of-prague-car-tour',
  'cesky-krumlov',
  'kutna-hora',
  'karlsbad',
  'terezin-memorial',
  'karlstejn-castle',
].join(',')

const CONTENT_MARKDOWN = `**Updated April 2026**

A licensed tour guide in Prague is a professional who holds a Czech National Guide Card issued by the Czech Ministry of Regional Development under Law No. 159/1999, permitting paid guiding work across the Czech Republic. I'm Uliana Formina — I hold the Class II license (the top category, which requires documented professional qualification in history or tourism), I've been guiding since 2009, I'm a member of the World Federation of Tourist Guide Associations (WFTGA), and I've led private tours for more than 10,000 guests over 17 years. On this page I explain what "licensed" actually means in Prague, what I offer, and how to book a private tour with me directly.

## Who I Am — Credentials & Licensing

Unlike app-based "guide" platforms or unlicensed walking tour operators, I guide under a state-issued Czech license. The Czech Republic regulates tour guiding under Law No. 159/1999, which defines two tiers of the Czech National Guide Card: Class I (basic registration) and Class II (the top category, which requires documented professional qualification — a university degree in history or tourism, or equivalent formal education in the field). I hold the Class II license — the top category — which recognises verified professional expertise and permits guiding across the entire Czech Republic, not just Prague. Below are my verified credentials.

1. **Czech National Guide Card, Class II (top category)** — issued by the Czech Ministry of Regional Development under Law No. 159/1999. Class II is the higher of the two official license tiers and requires documented professional qualification in history, tourism, or a related field. Valid across the entire Czech Republic.
2. **Member, World Federation of Tourist Guide Associations (WFTGA)** — the international professional body that sets global standards for licensed tour guides.
3. **Member, Czech Guides Association** — the professional association for licensed guides operating in the Czech Republic.
4. **Member, Union of Tourist Business of the Czech Republic** — the industry body representing the Czech inbound tourism sector.
5. **17+ years of continuous guiding experience** — guiding professionally since 2009.
6. **10,000+ guests hosted** — private tours ranging from solo travellers to extended family groups.
7. **Languages guided in:** English, Russian, Czech.

In my 17 years of guiding, the single most common surprise for guests is that "guide" is not a protected term in every country — but in the Czech Republic, the top-tier Class II license requires genuine expertise that must be demonstrated through formal qualification, not claimed.

## What a Licensed Prague Guide Actually Does

A licensed Prague guide is not just someone who shows you buildings. The license recognises verified professional qualification — history, art, architecture, cultural interpretation — which translates into the ability to guide with depth inside cathedrals, palaces, and museums, not just past them. It also means the license-holder has been formally recognised by the Czech state, which is a different standard than self-appointed expertise.

1. **Provide historical and cultural commentary inside interiors** — including <a href="/en/tours/prague-castle-lesser-town" target="_blank" rel="noopener noreferrer">Prague Castle's St. Vitus Cathedral</a>, the Old Royal Palace, Jewish Quarter synagogues, and other sites where depth of knowledge transforms the visit from "seeing the rooms" into understanding why they matter.
2. **Create tailored itineraries** — not a fixed script. A licensed guide adapts the tour to guests' interests, mobility, time constraints, and prior knowledge.
3. **Manage logistics** — ticket timing, queue navigation, metro/tram use, breaks, photo stops.
4. **Answer substantive questions in real time** — about Czech history, art, daily life, politics, food, traditions.
5. **Recommend honestly** — restaurants, cafés, experiences, side trips — based on actual local knowledge rather than commission agreements.
6. **Handle unexpected situations** — weather changes, closures, access issues, guest fatigue.
7. **Represent Prague accurately** — including parts of Czech history and culture that are not in guidebooks.

## How I'm Different from Unlicensed "Guides" and OTA Tours

After 10,000+ guests, I've noticed that most people booking a "Prague tour" for the first time don't realize there are three categories of guiding operating in the city: licensed private guides (like me), unlicensed tour leaders on group tours sold by OTAs (Viator, GetYourGuide, Booking.com Experiences), and so-called "free walking tours" that run on tips. Here's how the differences actually play out.

| Factor | Licensed Private Guide (Me) | OTA Group Tours | Free Walking Tours |
|---|---|---|---|
| State license required | Yes | Usually no | No |
| Group size | Just your group | 15–30 strangers | 20–50 strangers |
| Depth of interior guiding | Detailed commentary inside cathedrals, palaces, museums | Usually brief or self-guided inside | Outside only; no interior access |
| Itinerary flexibility | Fully customised | Fixed script | Fixed route |
| Expected cost | From €119 per group | €20–40 per person | "Tip-based" (typically €10–15/person expected) |
| Commission structure | Direct booking, no middleman | 20–30% OTA commission | Tip-dependent, guides paid nothing if no tips |
| What you're paying for | Expertise + exclusivity | OTA platform + group logistics | Nothing upfront; ambiguous at end |

Neither OTA tours nor free walking tours are inherently bad — they serve different needs. Backpackers on tight budgets may prefer tip-based tours. Travellers who like group energy may enjoy OTA tours. But if you want tailored depth, interior access, and a guide whose credentials are state-verified, a licensed private guide is what the category name actually means.

## Languages I Guide In

I guide in three languages. All tours are private — language choice is whichever works best for your group.

- **English** — for guests from the UK, USA, Canada, Australia, Ireland, and international travellers who prefer English.
- **Russian** — native level.
- **Czech** — native.

## Tours I Offer

I offer 17 different private tours in Prague and across the Czech Republic. Every tour is private — just your group, no strangers. Below are the main categories.

- **Prague walking tours** — Old Town & Charles Bridge, Prague Castle & Lesser Town, Jewish Quarter (included in the Old Town route), and the full-day "All Prague in One Day" route.
- **Day trips from Prague** — <a href="/en/tours/cesky-krumlov" target="_blank" rel="noopener noreferrer">Český Krumlov</a>, <a href="/en/tours/kutna-hora" target="_blank" rel="noopener noreferrer">Kutná Hora (Bone Church)</a>, Hluboká, Terezín Memorial, Karlovy Vary, Kozel Brewery, Pilsner Urquell, and the Škoda factory.
- **Specialty experiences** — <a href="/en/tours/hidden-prague-underground-alchemy" target="_blank" rel="noopener noreferrer">Hidden Prague (underground + alchemy + St. James's forearm)</a> and the <a href="/en/tours/2000-medieval-dinner-prague" target="_blank" rel="noopener noreferrer">Medieval Dinner Show at U Pavouka</a>.

Full list: <a href="/en/tours" target="_blank" rel="noopener noreferrer">View all 17 tours</a>.

## How Booking Works

Private tours are booked directly with me — no OTA commission, no middleman. Here's the process:

1. **Choose a tour** from the list above or contact me if you want something custom.
2. **Send an inquiry** via the contact form, WhatsApp, or email (info@bestpragueguide.com). Include your dates, group size, and any preferences.
3. **Receive confirmation** — typically within a few hours, including agreed price and meeting details.
4. **Payment:** cash on the day of the tour (EUR, USD, or CZK), OR by card in advance. Card payments cannot be processed on the day itself.
5. **Free cancellation** up to 24 hours before the tour.

Ready to book, or have a specific question? <a href="/en/contact" target="_blank" rel="noopener noreferrer">Contact me directly</a>, message WhatsApp at +420 776 306 858, or email info@bestpragueguide.com.`

const FAQ_ITEMS = [
  {
    question: 'What makes a tour guide "licensed" in Prague?',
    answer:
      'A licensed tour guide in Prague holds a Czech National Guide Card issued by the Czech Ministry of Regional Development under Law No. 159/1999. There are two classes: Class I (basic registration) and Class II (top category, requiring documented professional qualification in history or tourism). The card is legally required for paid tour guiding in Czech cities. It is the single clearest way to verify that a guide has been professionally recognised by the state.',
  },
  {
    question: 'How long have you been a licensed Prague guide?',
    answer:
      "I've been guiding professionally since 2009 — over 17 years of continuous full-time work with more than 10,000 guests hosted on private tours.",
  },
  {
    question: 'Are all Prague tour guides licensed?',
    answer:
      'No. Many guides operating in Prague — including most "free walking tour" staff and many OTA tour leaders — are not licensed. The Czech National Guide Card is legally required for paid outdoor city guiding, but enforcement varies. Booking a licensed guide is the only way to guarantee that the guide has been officially recognised by the Czech state as qualified.',
  },
  {
    question: 'What organizations are you a member of?',
    answer:
      "I'm a member of the World Federation of Tourist Guide Associations (WFTGA), the Czech Guides Association, and the Union of Tourist Business of the Czech Republic. These memberships require verified credentials and professional standards.",
  },
  {
    question: 'Can you guide inside Prague Castle?',
    answer:
      'Yes. I regularly guide inside St. Vitus Cathedral, the Old Royal Palace, and other interior sites within the Prague Castle complex. My Class II license recognises verified professional qualification, which matters inside cultural monuments where depth of knowledge makes the experience meaningfully better than a self-guided visit with an audio guide.',
  },
  {
    question: 'Do you offer group tours?',
    answer:
      'No. I only offer private tours — just your group, no strangers. Group size ranges from solo travellers to extended families. The private-only model is deliberate: it allows me to tailor the tour fully to your interests and pace.',
  },
  {
    question: 'What languages do you guide in?',
    answer:
      'I guide in English, Russian, and Czech. All three are at a level where I can deliver detailed historical and cultural commentary without limitation.',
  },
  {
    question: 'How much does a private Prague tour cost?',
    answer:
      'Prices start from €119 per group (not per person). Exact pricing depends on tour length, group size, and whether transport is required. See bestpragueguide.com/en/prices for current rates.',
  },
  {
    question: 'How far in advance should I book?',
    answer:
      "Two weeks in advance for high season (April–October), one week in advance for off-season. However, last-minute inquiries are welcome — if I'm free, I'll confirm within a few hours.",
  },
  {
    question: 'Can you do day trips outside Prague?',
    answer:
      'Yes. My Class II Czech National Guide Card covers the entire Czech Republic. I regularly guide day trips to Český Krumlov, Karlštejn Castle, Kutná Hora, Hluboká, Terezín, Karlovy Vary, and more.',
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
