import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '@/lib/markdown-to-lexical'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const results: string[] = []

    const pages = [
      {
        slug: 'private-walking-tour-prague',
        title: 'Private Walking Tours in Prague',
        subtitle: 'Explore Prague on foot with a licensed guide — at your pace, on your schedule, with your group only.',
        metaTitle: 'Private Walking Tours in Prague | Best Prague Guide',
        metaDescription: 'Four private walking tours with licensed local guides. Old Town, Castle, Jewish Quarter or full-day. Per-group pricing, no strangers →',
        tourSlugs: 'charles-bridge-old-town,prague-castle-lesser-town,all-prague-in-one-day,hidden-prague-underground-alchemy',
        content: `## Why Walk Prague with a Private Guide?

Prague is a compact city built for walking. Medieval streets too narrow for buses, hidden courtyards you'd pass without knowing, and more than a thousand years of layered history at every turn. A private walking tour means you set the pace, ask any question, and never compete with 20 other people for your guide's attention.

Every guide on <a href="/en/prague-guide" target="_blank" rel="noopener noreferrer">our team</a> holds a top-category licence issued by the Czech Ministry — the highest level of certification available. This means access to interiors that unlicensed guides cannot enter, including Prague Castle circuits and historic church interiors.

## How It Works

1. **Choose a tour** — Old Town, Castle, full-day, or underground Prague
2. **Tell us your date and group size** — we confirm availability within hours
3. **Meet your guide** — at a central meeting point or your hotel lobby
4. **Walk at your pace** — photo stops, coffee breaks, and detours are all part of the experience
5. **Pay per group** — not per person, so larger groups pay less per head

## Why Private Beats Free and Group Tours

Free walking tours are a decent orientation — but with 20-40 people, a tip-based guide, and a fixed route. Group tours cost €15-30 per person with 10-15 strangers setting the pace. A <a href="/en/prague-guide" target="_blank" rel="noopener noreferrer">private walking tour</a> gives you a licensed guide, a flexible route, and no strangers — and for groups of three or more, the per-person cost is often less than a paid group tour.

Complete your walking day with an evening at <a href="/en/tours/2000-medieval-dinner-prague" target="_blank" rel="noopener noreferrer">our medieval dinner show</a> — sword fights, fire shows, and a five-course feast in a 15th-century tavern.`,
        faqItems: [
          { question: 'How far in advance should I book?', answer: 'We recommend at least a few days ahead during peak season (April–October). In winter, a day or two usually works.' },
          { question: 'What if it rains?', answer: 'Tours run rain or shine. Prague is beautiful in the rain — and your guide knows covered routes, indoor alternatives, and great coffee stops.' },
          { question: 'Can we customize the route?', answer: 'Absolutely. Tell us your interests and we adjust the itinerary. Architecture, food, Kafka, WWII, photography — we build around what matters to you.' },
          { question: 'Is the tour suitable for children?', answer: 'Yes. We adjust the pace and storytelling for families. For very young children (under 5), we recommend the 2-hour tour rather than a full day.' },
          { question: 'How much should I tip?', answer: 'Tipping is appreciated but not mandatory. €10-20 per group is a common and generous tip for a private tour.' },
          { question: 'Do you provide skip-the-line tickets?', answer: 'Your guide handles ticket logistics at Prague Castle and other paid sites. You don\'t need to pre-purchase anything.' },
          { question: 'Can we add a coffee or lunch stop?', answer: 'Of course. Your guide knows the best local spots — far from the tourist traps on the main squares.' },
        ],
      },
      {
        slug: 'licensed-guide-prague',
        title: 'Licensed Prague Guides — Certified by the Czech Ministry',
        subtitle: 'Every guide on our team holds government-issued certification — the highest level available in the Czech Republic.',
        metaTitle: 'Licensed Guide Prague — Certified Guides | Best Prague Guide',
        metaDescription: 'Hire a licensed, English-speaking Prague guide certified by the Czech Ministry. Professional team, private tours only →',
        tourSlugs: 'charles-bridge-old-town,prague-castle-lesser-town,all-prague-in-one-day,hidden-prague-underground-alchemy,best-of-prague-car-tour,cesky-krumlov,kutna-hora,karlsbad,terezin-memorial,karlstejn-castle',
        content: `## What "Licensed Guide" Means in the Czech Republic

In the Czech Republic, tour guiding is a regulated profession. To earn a guide licence, you must pass a rigorous exam administered by the Ministry of Education covering Prague's history, architecture, art, geography, and cultural heritage. The exam is conducted in the language you will guide in. Licensed guides carry a numbered credential and are the only professionals legally permitted to lead tours inside national monuments — including Prague Castle circuits.

Not all tour operators use licensed guides. Marketplace platforms like Viator and GetYourGuide do not verify guide credentials — they list operators, not individual guides. When you book through us, every tour is led by a Czech Ministry-certified professional.

## Why It Matters for You

A licensed guide can enter interiors that unlicensed guides cannot — including St. Vitus Cathedral tour circuits, the Old Royal Palace, and the Story of Prague Castle exhibition. They carry professional liability insurance. And they've demonstrated expert-level knowledge of the city through a national examination.

The difference shows on the tour. A licensed guide doesn't just tell you when a building was built — they explain why it matters, who lived there, and how it connects to what you'll see next.

## Our Team

Best Prague Guide is a team of licensed professionals led by Uliana Formina, a top-category certified guide and member of the Prague and Czech Guides Association. Every guide on our team holds Czech Ministry certification and guides in English and Russian. <a href="/en/prague-guide" target="_blank" rel="noopener noreferrer">Read more about our team and experience →</a>

## How to Verify Any Guide's Licence

Before booking with any tour operator in Prague, you can verify guide credentials:

- **Ask for their licence number** — every licensed guide has one
- **Check with the Prague Guides Association** — they maintain a member directory
- **Look for the official badge** — licensed guides carry a credential card
- **Be cautious with marketplaces** — Viator and GetYourGuide do not verify individual guide licensing. You're trusting the operator, not the platform.

Whether you book with us or someone else — always ask about licensing. It's the single most reliable indicator of guide quality. <a href="/en/prague-guide" target="_blank" rel="noopener noreferrer">Meet our licensed guides →</a>`,
        faqItems: [
          { question: 'Are all your guides licensed?', answer: 'Yes. Every guide on our team holds a top-category certification from the Czech Ministry of Education — the highest level available.' },
          { question: 'What languages do your guides speak?', answer: 'English and Russian. Every guide is certified in their guiding language.' },
          { question: 'What\'s the difference between a licensed and unlicensed guide?', answer: 'Licensed guides have passed a government exam, carry insurance, and are the only professionals legally allowed to guide inside national monuments like Prague Castle. Unlicensed guides cannot enter these interiors.' },
          { question: 'Can I see the guide\'s credentials before booking?', answer: 'Absolutely. Contact us and we\'ll share your guide\'s certification details.' },
          { question: 'Do you offer tours for large groups?', answer: 'Yes. For groups larger than 8, we arrange multiple guides so everyone can hear and ask questions comfortably.' },
        ],
      },
      {
        slug: 'prague-sightseeing-tour',
        title: 'Prague Sightseeing Tours — See the Best of Prague',
        subtitle: 'Walking, car, or full-day — every sightseeing tour is private, with a licensed guide, at your pace.',
        metaTitle: 'Prague Sightseeing Tour — Private Guide | Best Prague Guide',
        metaDescription: 'Private sightseeing tours in Prague — walking, car or full-day. All main landmarks with a licensed guide. Per-group pricing, hotel pickup available →',
        tourSlugs: 'charles-bridge-old-town,prague-castle-lesser-town,all-prague-in-one-day,best-of-prague-car-tour',
        content: `## See Prague Your Way

Prague's highlights spread across both sides of the Vltava River. The Astronomical Clock and Charles Bridge on one side, Prague Castle and Malá Strana on the other, with a thousand years of history connecting them. A sightseeing tour ties it all together — with <a href="/en/prague-guide" target="_blank" rel="noopener noreferrer">a guide who explains why each landmark matters</a>, not just what it's called.

## Walking vs Car — How to Choose

**Walking tours** take you through narrow medieval streets, hidden courtyards, and along the river — places a car simply can't reach. You feel the city under your feet. Best for anyone who can walk 2-3 hours at a comfortable pace.

**Car tours** cover more ground in less time. Your guide and driver pick you up at your hotel, drive to Prague Castle (skipping the uphill walk), then you walk downhill through the most scenic parts. Best for seniors, families with young children, or anyone who wants comfort without missing the highlights.

**You can combine both.** Our <a href="/en/tours/best-of-prague-car-tour" target="_blank" rel="noopener noreferrer">car and walking tour</a> starts with a drive past panoramic viewpoints, then you walk the historic center on foot.

## What a Private Sightseeing Tour Includes

- **Licensed guide** — Czech Ministry-certified, English-speaking
- **Flexible schedule** — start when you want, go at your pace
- **Customizable route** — skip what doesn't interest you, spend more time on what does
- **Skip-the-line logistics** — your guide handles tickets at Prague Castle and other sites
- **Photo stops** — at viewpoints most tourists walk right past
- **Restaurant recommendations** — from a local who actually eats there

**Not included:** entrance tickets (purchased separately at each site), meals, transport (unless car tour).

## Hop-On Bus vs Private Guide — An Honest Comparison

Hop-on hop-off buses cost €25-30 per person. You see Prague through glass, listening to a recorded commentary. They cover distance but not depth. A private sightseeing tour costs per group — so for families of three or more, the per-person price is often **less** than the bus. And instead of a recording, you get a licensed guide who answers your questions in real time.

Complete your sightseeing day with <a href="/en/tours/2000-medieval-dinner-prague" target="_blank" rel="noopener noreferrer">a medieval dinner show</a> — the most unforgettable evening in Prague.

<a href="/en/prague-guide" target="_blank" rel="noopener noreferrer">Meet the guides who will show you Prague →</a>`,
        faqItems: [
          { question: 'Which sightseeing tour covers the most landmarks?', answer: 'Our All Prague in One Day tour covers both sides of the river — Old Town, Charles Bridge, Prague Castle, Lesser Town, and Vyšehrad — in a single full day.' },
          { question: 'Can we customize which sights we visit?', answer: 'Yes. Tell us your interests and we adjust the route. Every private tour is flexible — if you want to spend 30 minutes in one spot, your guide adjusts the rest.' },
          { question: 'Is the car tour good for families with small children?', answer: 'Yes. The car handles the uphill parts and longer distances. Children can rest in the car between walking sections. Car seats are available on request.' },
          { question: 'How far in advance should I book?', answer: 'During peak season (April–October), we recommend at least a week ahead. In winter, 2-3 days is usually enough.' },
          { question: 'What\'s the best time of day for sightseeing?', answer: 'Morning is ideal for Prague Castle (fewer crowds, better light). Afternoon works well for Old Town and Charles Bridge. Our guides plan the route to avoid peak congestion at each landmark.' },
        ],
      },
      {
        slug: 'day-trips-from-prague',
        title: 'Day Trips from Prague — Private Tours with a Licensed Guide',
        subtitle: 'Private day trips with licensed guides — hotel pickup, comfortable car, your own itinerary.',
        metaTitle: 'Day Trips from Prague — Private Tours | Best Prague Guide',
        metaDescription: '10 private day trips from Prague with licensed guides. Castles, towns, breweries, memorials. Hotel pickup, comfortable car, flexible schedule →',
        tourSlugs: 'cesky-krumlov,kutna-hora,karlsbad,terezin-memorial,karlstejn-castle,hluboka-castle,cesky-sternberk,kozel-brewery-tour,pilsner-urquell-brewery,skoda-factory',
        content: `## Why Day Trips from Prague?

Prague is a perfect base for exploring Bohemia. Within one to two hours by car you can reach medieval castles, UNESCO towns, world-famous breweries, and powerful memorial sites. A private day trip means hotel pickup, a comfortable car, <a href="/en/prague-guide" target="_blank" rel="noopener noreferrer">a licensed guide who speaks your language</a>, and a flexible schedule — no bus crowds, no fixed departure times, no waiting for 40 other people.

Every day trip listed below is private — just your group. Prices are per group, not per person, so the more people you bring, the better value per head.

## How to Choose Your Day Trip

**History lovers** — Kutná Hora for medieval silver mining and the Bone Church, Terezín for WWII history, Karlštejn for the royal castle where Czech crown jewels were kept.

**Architecture and photography** — Český Krumlov is a full UNESCO town frozen in time. Hluboká looks like it was lifted from the English countryside — a neo-Gothic castle 145 km south of Prague.

**Beer and food** — Pilsner Urquell in Plzeň is where pilsner was invented in 1842. Kozel Brewery is a working brewery with tastings straight from the tank.

**Unique experiences** — Škoda Factory for car enthusiasts (children under 10 not admitted). Český Šternberk is a privately owned castle — the same family has lived there for over 760 years.

**First-time day trip?** — Český Krumlov is our #1 recommendation. **Short on time?** — Karlštejn Castle is just 30 km from Prague, perfect for a half day.

## Why Private Beats Group Bus Tours

Group bus day trips cost €30–60 per person — 40+ people on a bus, fixed schedule, limited stops, recorded commentary through headphones. A private day trip costs per group: €229–399 for 1–6 people. A family of four pays roughly €57–100 per person — comparable to a bus ticket, but with hotel pickup, a <a href="/en/prague-guide" target="_blank" rel="noopener noreferrer">licensed guide</a> who answers your questions, and the freedom to stop wherever you want.

## What Every Day Trip Includes

- **Hotel pickup and drop-off** in Prague (comfortable car or minivan)
- **Licensed English-speaking guide** — Czech Ministry certified
- **Flexible schedule** — adjust the route, add stops, take your time
- **Restaurant and lunch recommendations** from your guide (food not included in price)
- **Not included:** entrance tickets (purchased on site), meals and drinks

## How It Works

1. **Choose a day trip** from the list above
2. **Tell us your date, group size, and hotel address**
3. **We confirm availability** and suggest a pickup time
4. **Driver picks you up** at your hotel lobby
5. **Enjoy a full day exploring** — your guide adapts the itinerary to your interests

## Combine Two Destinations

Popular day trip combinations:
- **Karlštejn + Mělník** — castle in the morning, wine tasting in the afternoon
- **Český Krumlov + Hluboká** — full day, long drive but two stunning stops
- **Kutná Hora + Český Šternberk** — both east of Prague, easy to combine
- **Kozel Brewery + Karlštejn** — both southwest, a natural pairing

Custom combinations available at standard per-group pricing. <a href="/en/contact" target="_blank" rel="noopener noreferrer">Contact us</a> to plan your perfect day outside Prague.

End your day trip with <a href="/en/tours/2000-medieval-dinner-prague" target="_blank" rel="noopener noreferrer">a medieval dinner show</a> back in Prague — the perfect way to cap off a day of exploring.

Or combine a day trip with <a href="/en/private-walking-tour-prague" target="_blank" rel="noopener noreferrer">a private walking tour of Prague</a> on another day for the complete Czech experience.`,
        faqItems: [
          { question: 'How long does a day trip take?', answer: 'Half-day trips (Karlštejn, Kutná Hora, Terezín) take 4-6 hours including travel. Full-day trips (Český Krumlov, Karlovy Vary) take 8-10 hours. Your guide adjusts the pace to your group.' },
          { question: 'What time does the hotel pickup happen?', answer: 'Typically 8:00-9:00 AM for full-day trips, 9:00-10:00 AM for half-day trips. We confirm the exact time when you book.' },
          { question: 'Can we stop for lunch on the way?', answer: 'Absolutely. Your guide knows the best local restaurants along each route — far better than the tourist spots where bus groups eat. Lunch is not included in the price but your guide will recommend options for every budget.' },
          { question: 'Are entrance tickets included in the price?', answer: 'No. Entrance tickets to castles, museums, and other sites are purchased on arrival. Your guide handles the logistics — you just enjoy the visit. This keeps our prices transparent: you pay for the guide and transport, tickets are separate.' },
          { question: 'Can we visit two places in one day?', answer: 'Yes, for destinations that are geographically close. Popular combinations include Karlštejn + Mělník, Kutná Hora + Český Šternberk, and Kozel + Karlštejn. Contact us and we\'ll suggest the best pairing for your interests.' },
          { question: 'Is the day trip suitable for children?', answer: 'Most day trips work well for families. Český Krumlov has a bear moat that kids love. Karlštejn involves a steep uphill walk (not ideal for very young children). The Škoda Factory does not admit children under 10.' },
          { question: 'What happens if the weather is bad?', answer: 'Day trips run in all weather. Castle interiors, breweries, and museums are indoors. Your guide adjusts the route if needed — for example, spending more time inside a castle on a rainy day rather than in the gardens.' },
        ],
      },
    ]

    for (const pageData of pages) {
      try {
        const contentLexical = markdownToLexical(pageData.content)

        // Create as draft first
        const doc = await payload.create({
          collection: 'pages',
          locale: 'en',
          data: {
            title: pageData.title,
            slug: pageData.slug,
            template: 'landing',
            subtitle: pageData.subtitle,
            landingTourSlugs: pageData.tourSlugs,
            content: contentLexical as any,
            faqItems: pageData.faqItems,
            seo: {
              metaTitle: pageData.metaTitle,
              metaDescription: pageData.metaDescription,
            },
            _status: 'published',
          } as any,
        })

        // Publish explicitly
        await payload.update({
          collection: 'pages',
          id: doc.id,
          locale: 'en',
          data: { _status: 'published' } as any,
        })

        results.push(`${pageData.slug}: created and published (id=${doc.id})`)
      } catch (err: any) {
        results.push(`${pageData.slug}: error — ${err.message?.substring(0, 100)}`)
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
