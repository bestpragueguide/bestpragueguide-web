import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// SEO-optimized alt text per tour slug
// Rules: lowercase, hyphenated, max 60 chars, keyword-rich, no háček, no Cyrillic
// RU pages use English transliteration

const altTextMap: Record<string, { en?: string; ru?: string }> = {
  // EN tours
  'charles-bridge-old-town': {
    en: 'charles-bridge-prague-baroque-statues-private-tour',
  },
  'prague-castle-lesser-town': {
    en: 'prague-castle-st-vitus-cathedral-private-tour',
  },
  'best-of-prague-car-tour': {
    en: 'prague-car-tour-panoramic-view-private-guide',
    ru: 'avto-ekskursiya-praga-panorama-chastnyj-gid',
  },
  'cesky-krumlov': {
    en: 'cesky-krumlov-medieval-town-unesco-day-trip',
  },
  'kutna-hora': {
    en: 'kutna-hora-sedlec-ossuary-bone-church-day-trip',
    ru: 'kutna-gora-kostnitsa-ekskursiya-iz-pragi',
  },
  'karlsbad': {
    en: 'karlovy-vary-hot-springs-colonnades-day-trip',
  },
  'karlstejn-castle': {
    en: 'karlstejn-castle-gothic-charles-iv-bohemia-tour',
    ru: 'zamok-karlshtejn-ekskursiya-iz-pragi',
  },
  'Terezin-Memorial': {
    en: 'terezin-memorial-ghetto-museum-small-fortress',
    ru: 'terezin-memorial-kholokost-ekskursiya-praga',
  },
  'hluboka-castle': {
    en: 'hluboka-castle-windsor-neo-gothic-vltava-river',
  },
  'cesky-sternberk': {
    en: 'cesky-sternberk-castle-oldest-inhabited-bohemia',
    ru: 'zamok-cheski-shternberk-ekskursiya-iz-pragi',
  },
  'kozel-brewery-tour': {
    en: 'kozel-brewery-velke-popovice-beer-tasting-tour',
    ru: 'pivzavod-kozel-velke-popovice-degustatsiya',
  },
  'skoda-factory': {
    en: 'skoda-factory-mlada-boleslav-museum-tour',
    ru: 'zavod-shkoda-mlada-boleslav-muzej-ekskursiya',
  },
  '1630-medieval-dinner-prague': {
    en: 'medieval-dinner-prague-u-pavouka-sword-fight',
    ru: 'srednevekovyj-uzhin-praga-taverna-u-pauka',
  },
  '2000-medieval-dinner-prague': {
    en: 'medieval-dinner-show-prague-evening-banquet',
    ru: 'srednevekovoe-shou-praga-vechernyj-banket',
  },
  // RU-only tours
  'praga-za-3-chasa-obzornaya-ekskursiya': {
    ru: 'obzornaya-ekskursiya-praga-3-chasa-gid',
  },
  'avto-peshaya-obzornaya-ekskursiya-po-prage': {
    ru: 'avto-ekskursiya-praga-panorama-chastnyj-gid',
  },
  'vsya-praga-za-1-den': {
    ru: 'vsya-praga-za-1-den-ekskursiya-gid',
  },
  'cheshskij-krumlov-i-zamok-gluboka-nad-vltavoj': {
    ru: 'cheski-krumlov-zamok-gluboka-ekskursiya',
  },
  'kutna-gora-kostnitse': {
    ru: 'kutna-gora-kostnitsa-ekskursiya-iz-pragi',
  },
  'karlovy-vary-i-pivzavod-krushovitse': {
    ru: 'karlovy-vary-pivzavod-krushovitse-ekskursiya',
  },
  'zamok-karlstejn': {
    ru: 'zamok-karlshtejn-ekskursiya-iz-pragi',
  },
  'terezin': {
    ru: 'terezin-memorial-kholokost-ekskursiya-praga',
  },
  'zamok-cheshskij-shternberg': {
    ru: 'zamok-cheski-shternberk-ekskursiya-iz-pragi',
  },
  'pivzavod-velkopopovitskij-kozel': {
    ru: 'pivzavod-kozel-velke-popovice-degustatsiya',
  },
  'avtozavod-muzej-shkoda': {
    ru: 'zavod-shkoda-mlada-boleslav-muzej-ekskursiya',
  },
  'prazhskij-evrejskij-kvartal': {
    ru: 'evrejskij-kvartal-praga-jozefov-sinagogi',
  },
  'misticheskaya-praga-3-v-1': {
    ru: 'misticheskaya-praga-podzemelya-alkhimiya-tur',
  },
  'karlovy-vary-i-zamok-krepost-loket': {
    ru: 'karlovy-vary-zamok-loket-ekskursiya',
  },
  'krepost-vyshegrad': {
    ru: 'vysherad-krepost-praga-bazilika-ekskursiya',
  },
  'pivnoj-tur-po-luchshim-prazhskim-pivnym': {
    ru: 'pivnoj-tur-praga-luchshie-pivnye-degustatsiya',
  },
  'zamok-konopishte': {
    ru: 'zamok-konopishte-frants-ferdinand-ekskursiya',
  },
  'iz-pragi-v-drezden': {
    ru: 'drezden-iz-pragi-tsvinger-frauenkirhe-tur',
  },
  'vodnyj-zamok-blatna': {
    ru: 'vodnyj-zamok-blatna-ekskursiya-iz-pragi',
  },
  'kruiz-po-reke-s-uzhinom-i-zhivoj-muzykoj': {
    ru: 'kruiz-vltava-uzhin-zhivaya-muzyka-praga',
  },
  'onlajn-ekskursiya-po-prage': {
    ru: 'onlajn-ekskursiya-praga-virtualnyj-tur-gid',
  },
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-init-secret')
    const payload = await getPayload({ config })
    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = payload.db.drizzle
    const results: any[] = []
    const errors: any[] = []

    // Process each locale
    for (const locale of ['en', 'ru'] as const) {
      const tours = await payload.find({
        collection: 'tours',
        where: { publishedLocales: { in: [locale] } },
        limit: 200,
        locale,
        depth: 1,
      })

      for (const tour of tours.docs) {
        const altData = altTextMap[tour.slug]
        if (!altData) continue

        const altText = altData[locale]
        if (!altText) continue

        // Get heroImage media ID
        const heroImage = typeof tour.heroImage === 'object' ? tour.heroImage : null
        const heroImageId = heroImage?.id || (typeof tour.heroImage === 'number' ? tour.heroImage : null)
        if (!heroImageId) continue

        try {
          // Update alt text in media_locales
          await db.execute(
            sql`UPDATE media_locales SET alt = ${altText}
                WHERE _parent_id = ${heroImageId} AND _locale = ${locale}`
          )

          // Also update gallery images if they exist
          const gallery = (tour as any).gallery || []
          for (let i = 0; i < gallery.length; i++) {
            const galleryItem = gallery[i]
            const galleryImage = typeof galleryItem?.image === 'object' ? galleryItem.image : null
            const galleryImageId = galleryImage?.id || (typeof galleryItem?.image === 'number' ? galleryItem.image : null)
            if (!galleryImageId) continue

            // Gallery alt: base alt + gallery index
            const galleryAlt = `${altText}-gallery-${i + 1}`
            if (galleryAlt.length <= 60) {
              await db.execute(
                sql`UPDATE media_locales SET alt = ${galleryAlt}
                    WHERE _parent_id = ${galleryImageId} AND _locale = ${locale}
                    AND (alt IS NULL OR alt = '' OR alt LIKE '%photo_%' OR alt LIKE '%IMG_%')`
              )
            }
          }

          results.push({
            slug: tour.slug,
            locale,
            heroImageId,
            alt: altText,
            altLen: altText.length,
            galleryCount: gallery.length,
          })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown'
          errors.push({ slug: tour.slug, locale, error: msg })
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
