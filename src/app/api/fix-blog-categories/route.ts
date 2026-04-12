import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Categorize blog posts based on slug/title keyword matching.
 * Categories: prague-guide, food-and-drink, day-trips, tips, history
 *
 * GET  — audit: show current vs suggested categories
 * POST — fix: update categories where they differ
 */

type Category = 'prague-guide' | 'food-and-drink' | 'day-trips' | 'tips' | 'history'

function detectCategory(slug: string, title: string): Category {
  const s = `${slug} ${title}`.toLowerCase()

  // FOOD & DRINK
  if (/\b(eat|food|cuisine|beer|dinner|brunch|breakfast|restaurant|cafe|gelato|ice.cream|wine|bar|drink|cocktail|pub.crawl|happy.hour|halal|kosher|gluten|vegan|vegetarian|michelin|cooking.class)\b/.test(s)) return 'food-and-drink'
  if (/\b(kuhnya|pivo|restoran|kafe|eda|desert|koleno|svichkova|knedlik|trdlo|absint|vino|zavtrak|barohol|rynki|ulichnaya|veprevo|veganskaya|bezglyutenovaya|koshernaya|halalynaya|pivn|masopust|rozhdestvenskij-stol|den-svyatogo-martina|kulinarnyj)\b/.test(s)) return 'food-and-drink'

  // DAY TRIPS
  if (/\b(day.trip|karlstejn|terezin|hluboka|cesky.krumlov|karlovy|konopiste|pilsner|skoda|sternberk|kozel|kutna|bohemian.switzerland|olomouc|melnik|krivoklat|lednice|nuremberg|munich|saxon|dresden)\b/.test(s)) return 'day-trips'
  if (/\b(drezden|nyurnberg|myunhen|saksonskaya|brno|plzen|tabor|telch|lednice|loket|krivoklat|konoprusskie|konopishte|karlshtejn|krumlov|kutna|marianskie|moravskij.karst|bogemskij.raj|cheshskaya-shvejcariya|cheshskaya-derevnya|sumava|krkonose|gornolyzhny|zamki-oteli|zamki-chehii|detenice)\b/.test(s)) return 'day-trips'

  // TIPS & PRACTICAL
  if (/\b(safe|currency|money|scam|tourist.trap|first.time|hotel|budget|transport|airport|visa|insurance|tipping|luggage|pharmacy|emergency|doctor|payment|tax.free|app|ticket|e.scooter|train|car.rental|stroller|accessible|wheelchair|senior|packing|time.zone|card|sim|esim|cowork|nomad)\b/.test(s)) return 'tips'
  if (/\b(bezopasnost|valyut|obmen|moshennik|bilet|transport|aeroport|viza|strahovk|chaevye|kamery|apteki|skoraya|vrachi|oplata|tax-free|prilozh|bronirovanie|kontroler|elektrosamokat|praga-iz-|praga-na-avto|praga-tranzit|ees-etias|chto-vzyat|nochnye-poezda|chehiya-na-poezde|sim-kart|arenda-avto|skolko-deneg|prague-card|skolko-dnej|rajony-pragi|gde-zhit|otnoshenie-k-russkim|praga-bez-barerov|praga-dlya-pozhilyh|praga-dlya-allergika|praga-dlya-molodezhi|praga-s-kolyaskoj|otel-s-zhivotn|pervyj-raz|stoit-li-ehat|medicinskij-turizm|cheshskij-yazyk)\b/.test(s)) return 'tips'

  // HISTORY & CULTURE
  if (/\b(history|communism|kafka|wwii|revolution|jewish|legend|famous|tradition|architecture|art.nouveau|church|cathedral|monastery|literary|film.location|museum)\b/.test(s)) return 'history'
  if (/\b(istoriya|legenda|kommuniz|evrejskij|tradits|muha|stena-lennon|slavin|kladbish|valdshtejn|strit-art|muzej|muzei|nacionalnyj-muzej|podzemnaya|misticheskaya|vechernyaya|prazhskie-kuranty|staromestskaya|sobor-svyatogo|vyshehrad|grad-chto|petrshin|mala-strana|vaclavskaya|ostrov-kampa|gradchany|letenskie|nove-mesto|zhizhkov|tancuyushchij|paternoster|ostrova-pragi|smotrovye|dostoprimechatelnosti|cheshskij-granat|cheshskoe-steklo|unesco)\b/.test(s)) return 'history'

  // PRAGUE GUIDE (default) — itineraries, comparisons, seasonal, events, romance, activities
  return 'prague-guide'
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    const posts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      locale: 'en',
      fallbackLocale: false as any,
      depth: 0,
    })

    const ruPosts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      locale: 'ru',
      fallbackLocale: false as any,
      depth: 0,
    })

    const ruMap = new Map<number, { slug: string; title: string }>()
    for (const p of ruPosts.docs) {
      ruMap.set(p.id as number, { slug: (p.slug || '') as string, title: (p.title || '') as string })
    }

    let correct = 0
    let wrong = 0
    const changes: Array<{ id: number; slug: string; current: string; suggested: string }> = []

    const catCounts: Record<string, Record<string, number>> = {
      current: {},
      suggested: {},
    }

    for (const p of posts.docs) {
      const id = p.id as number
      const enSlug = (p.slug || '') as string
      const enTitle = (p.title || '') as string
      const ru = ruMap.get(id)
      const ruSlug = ru?.slug || ''
      const ruTitle = ru?.title || ''

      const slug = enSlug || ruSlug
      const title = enTitle || ruTitle
      const current = (p as any).category as string || 'prague-guide'
      const suggested = detectCategory(slug, title)

      catCounts.current[current] = (catCounts.current[current] || 0) + 1
      catCounts.suggested[suggested] = (catCounts.suggested[suggested] || 0) + 1

      if (current === suggested) {
        correct++
      } else {
        wrong++
        changes.push({ id, slug, current, suggested })
      }
    }

    return NextResponse.json({
      total: posts.totalDocs,
      correct,
      toChange: wrong,
      distribution: catCounts,
      changes: changes.slice(0, 50),
      remainingChanges: Math.max(0, changes.length - 50),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    const posts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      locale: 'en',
      fallbackLocale: false as any,
      depth: 0,
    })

    const ruPosts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      locale: 'ru',
      fallbackLocale: false as any,
      depth: 0,
    })

    const ruMap = new Map<number, { slug: string; title: string }>()
    for (const p of ruPosts.docs) {
      ruMap.set(p.id as number, { slug: (p.slug || '') as string, title: (p.title || '') as string })
    }

    let fixed = 0
    let skipped = 0
    let errors = 0

    for (const p of posts.docs) {
      const id = p.id as number
      const enSlug = (p.slug || '') as string
      const enTitle = (p.title || '') as string
      const ru = ruMap.get(id)
      const slug = enSlug || ru?.slug || ''
      const title = enTitle || ru?.title || ''
      const current = (p as any).category as string || 'prague-guide'
      const suggested = detectCategory(slug, title)

      if (current === suggested) {
        skipped++
        continue
      }

      try {
        const publishedLocales = ((p as any).publishedLocales || []) as string[]
        const locale = publishedLocales.includes('en') ? 'en' : 'ru'
        await payload.update({
          collection: 'blog-posts',
          id,
          locale,
          data: { category: suggested } as any,
        })
        fixed++
      } catch {
        errors++
      }
    }

    return NextResponse.json({ total: posts.totalDocs, fixed, skipped, errors })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
