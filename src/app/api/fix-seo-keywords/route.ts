import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// Keyword-optimized SEO data from marketing/seo-task-bestpragueguide.md
// Meta titles: EN max 60 chars, RU max 50 chars
// Meta descriptions: EN max 160 chars, RU max 130 chars
// Prices must be included in descriptions

interface TourSeo {
  metaTitle: string
  metaDescription: string
}

const enSeoData: Record<string, TourSeo> = {
  'charles-bridge-old-town': {
    metaTitle: 'Charles Bridge Walking Tour Prague | Best Prague Guide',
    metaDescription: 'Private Charles Bridge walking tour from €139 per group. Astronomical Clock, 30 Baroque statues, Old Town Square with a licensed guide →',
  },
  'prague-castle-lesser-town': {
    metaTitle: 'Prague Castle Private Tour | Best Prague Guide',
    metaDescription: 'Private Prague Castle and Lesser Town walking tour from €139 per group. St. Vitus Cathedral, Golden Lane, Mala Strana with licensed guide →',
  },
  'best-of-prague-car-tour': {
    metaTitle: 'Best of Prague Car Tour Private | Best Prague Guide',
    metaDescription: 'Private car and walking tour of Prague from €249 per group. Prague Castle, Charles Bridge, Old Town — see all highlights in one day →',
  },
  'cesky-krumlov': {
    metaTitle: 'Cesky Krumlov Day Trip from Prague | Best Prague Guide',
    metaDescription: 'Private Cesky Krumlov day trip from Prague. UNESCO medieval town, castle, Vltava River rafting option. Licensed guide, hotel pickup →',
  },
  'kutna-hora': {
    metaTitle: 'Kutna Hora Bone Church Trip Prague | Best Prague Guide',
    metaDescription: 'Private Kutna Hora and Sedlec Ossuary day trip from Prague. Bone Church, St. Barbara Cathedral, Italian Court. Licensed guide →',
  },
  'karlsbad': {
    metaTitle: 'Karlsbad Day Trip from Prague | Best Prague Guide',
    metaDescription: 'Private Karlovy Vary day trip from Prague. Hot springs, colonnades, Moser Glass, Becherovka Museum. Licensed guide, hotel pickup →',
  },
  'karlstejn-castle': {
    metaTitle: 'Karlstejn Castle Day Trip Prague | Best Prague Guide',
    metaDescription: 'Private Karlstejn Castle day trip from Prague. Gothic castle of Charles IV, Crown Jewels vault, Bohemian countryside. Licensed guide →',
  },
  'Terezin-Memorial': {
    metaTitle: 'Terezin Memorial Day Trip Prague | Best Prague Guide',
    metaDescription: 'Private Terezin Memorial day trip from Prague. Small Fortress, Ghetto Museum, Magdeburg Barracks. Licensed guide, hotel pickup →',
  },
  'hluboka-castle': {
    metaTitle: 'Hluboka Castle Day Trip Prague | Best Prague Guide',
    metaDescription: 'Private Hluboka Castle day trip from Prague. Neo-Gothic Windsor-style castle, English gardens, Vltava River views. Licensed guide →',
  },
  'cesky-sternberk': {
    metaTitle: 'Cesky Sternberk Castle Trip Prague | Best Prague Guide',
    metaDescription: 'Private Cesky Sternberk day trip from Prague. Oldest continuously inhabited castle in Czech Republic, 760 years of history →',
  },
  'kozel-brewery-tour': {
    metaTitle: 'Kozel Brewery Tour from Prague | Best Prague Guide',
    metaDescription: 'Private Kozel brewery tour from Prague. Velke Popovice brewery, beer tasting, Czech countryside. Licensed guide, hotel pickup →',
  },
  'skoda-factory': {
    metaTitle: 'Skoda Factory Tour from Prague | Best Prague Guide',
    metaDescription: 'Private Skoda factory and museum tour from Prague. Mlada Boleslav production line, car history, test drive option. Licensed guide →',
  },
  '1630-medieval-dinner-prague': {
    metaTitle: 'Medieval Dinner Prague Afternoon | Best Prague Guide',
    metaDescription: 'Medieval dinner show in Prague at 16:30 — €59 per person. U Pavouka tavern, sword fights, fire dancing, 5-course feast, unlimited drinks →',
  },
  '2000-medieval-dinner-prague': {
    metaTitle: 'Medieval Dinner Prague Evening | Best Prague Guide',
    metaDescription: 'Medieval dinner show in Prague at 20:00 — €75 per person. U Pavouka tavern, 5-course banquet, sword fights, fire show, unlimited drinks →',
  },
}

const ruSeoData: Record<string, TourSeo> = {
  'praga-za-3-chasa-obzornaya-ekskursiya': {
    metaTitle: 'Экскурсия по Праге 3 часа | Best Prague Guide',
    metaDescription: 'Обзорная экскурсия по Праге за 3 часа с лицензированным гидом. Пражский Град, Карлов мост, Староместская площадь. От €139 →',
  },
  'avto-peshaya-obzornaya-ekskursiya-po-prage': {
    metaTitle: 'Автоэкскурсия по Праге | Best Prague Guide',
    metaDescription: 'Автомобильно-пешеходная экскурсия по Праге с частным гидом. Все достопримечательности за один день. От €249 →',
  },
  'vsya-praga-za-1-den': {
    metaTitle: 'Вся Прага за 1 день | Best Prague Guide',
    metaDescription: 'Обзорная экскурсия по Праге на целый день. Пражский Град, Карлов мост, Старый город, Вышеград. Частный гид →',
  },
  'cheshskij-krumlov-i-zamok-gluboka-nad-vltavoj': {
    metaTitle: 'Чески Крумлов из Праги | Best Prague Guide',
    metaDescription: 'Экскурсия в Чески Крумлов и замок Глубока из Праги. ЮНЕСКО, средневековый город, замок. Частный гид →',
  },
  'kutna-gora-kostnitse': {
    metaTitle: 'Кутна Гора Костница из Праги | Best Prague Guide',
    metaDescription: 'Экскурсия в Кутна Гору и Костницу из Праги. Собор Св. Варвары, Итальянский двор. Частный гид →',
  },
  'karlovy-vary-i-pivzavod-krushovitse': {
    metaTitle: 'Карловы Вары из Праги | Best Prague Guide',
    metaDescription: 'Экскурсия в Карловы Вары и пивзавод Крушовице из Праги. Горячие источники, колоннады. Частный гид →',
  },
  'zamok-karlstejn': {
    metaTitle: 'Замок Карлштейн из Праги | Best Prague Guide',
    metaDescription: 'Экскурсия в замок Карлштейн из Праги. Готический замок Карла IV, хранилище сокровищ. Частный гид →',
  },
  'terezin': {
    metaTitle: 'Экскурсия в Терезин из Праги | Best Prague Guide',
    metaDescription: 'Экскурсия в мемориал Терезин из Праги. Малая крепость, Музей гетто, Магдебургские казармы. Частный гид →',
  },
  'zamok-cheshskij-shternberg': {
    metaTitle: 'Замок Чески Штернберк | Best Prague Guide',
    metaDescription: 'Экскурсия в замок Чески Штернберк из Праги. Старейший обитаемый замок Чехии, 760 лет истории →',
  },
  'pivzavod-velkopopovitskij-kozel': {
    metaTitle: 'Пивзавод Козел из Праги | Best Prague Guide',
    metaDescription: 'Экскурсия на пивзавод Велкопоповицкий Козел из Праги. Дегустация пива, чешская деревня. Частный гид →',
  },
  'avtozavod-muzej-shkoda': {
    metaTitle: 'Завод Шкода из Праги | Best Prague Guide',
    metaDescription: 'Экскурсия на завод и музей Шкода в Млада Болеслав из Праги. Производственная линия, история. Частный гид →',
  },
  'prazhskij-evrejskij-kvartal': {
    metaTitle: 'Еврейский квартал Праги | Best Prague Guide',
    metaDescription: 'Экскурсия по еврейскому кварталу Праги — Йозефов. Старое еврейское кладбище, синагоги. Частный гид →',
  },
  'misticheskaya-praga-3-v-1': {
    metaTitle: 'Мистическая Прага экскурсия | Best Prague Guide',
    metaDescription: 'Мистическая экскурсия по Праге 3 в 1. Подземелья, музей алхимии, легенды Старого города. Частный гид →',
  },
  'karlovy-vary-i-zamok-krepost-loket': {
    metaTitle: 'Карловы Вары и Локет | Best Prague Guide',
    metaDescription: 'Экскурсия в Карловы Вары и замок Локет из Праги. Горячие источники, средневековая крепость. Частный гид →',
  },
  'krepost-vyshegrad': {
    metaTitle: 'Вышеград экскурсия Прага | Best Prague Guide',
    metaDescription: 'Экскурсия по крепости Вышеград в Праге. Базилика Св. Петра и Павла, кладбище Славин. Частный гид →',
  },
  'pivnoj-tur-po-luchshim-prazhskim-pivnym': {
    metaTitle: 'Пивной тур по Праге | Best Prague Guide',
    metaDescription: 'Пивной тур по лучшим пражским пивным с частным гидом. Дегустация чешского пива, крафтовые пивоварни →',
  },
  'zamok-konopishte': {
    metaTitle: 'Замок Конопиште из Праги | Best Prague Guide',
    metaDescription: 'Экскурсия в замок Конопиште из Праги. Резиденция Франца Фердинанда, коллекция оружия. Частный гид →',
  },
  'iz-pragi-v-drezden': {
    metaTitle: 'Дрезден из Праги экскурсия | Best Prague Guide',
    metaDescription: 'Однодневная экскурсия из Праги в Дрезден. Цвингер, Фрауэнкирхе, Старый город. Частный гид →',
  },
  'vodnyj-zamok-blatna': {
    metaTitle: 'Водный замок Блатна | Best Prague Guide',
    metaDescription: 'Экскурсия в водный замок Блатна из Праги. Уникальный замок на воде, парк, розарий. Частный гид →',
  },
  '1630-uzhin-i-srednevekovoe-shou-v-taverne-u-pauka': {
    metaTitle: 'Средневековый ужин Прага 16:30 | Best Prague Guide',
    metaDescription: 'Средневековый ужин и шоу в таверне У Паука в 16:30 — €59/чел. Бои на мечах, огненное шоу, 5 блюд →',
  },
  '2000-uzhin-i-srednevekovoe-shou-v-taverne-u-pauka': {
    metaTitle: 'Средневековый ужин Прага 20:00 | Best Prague Guide',
    metaDescription: 'Средневековый ужин и шоу в таверне У Паука в 20:00 — €75/чел. Бои на мечах, огненное шоу, 5 блюд →',
  },
  'kruiz-po-reke-s-uzhinom-i-zhivoj-muzykoj': {
    metaTitle: 'Круиз по Влтаве с ужином | Best Prague Guide',
    metaDescription: 'Круиз по Влтаве с ужином и живой музыкой — €79/чел. Виды на Пражский Град, Карлов мост. Бронь →',
  },
  'onlajn-ekskursiya-po-prage': {
    metaTitle: 'Онлайн экскурсия по Праге | Best Prague Guide',
    metaDescription: 'Виртуальная онлайн экскурсия по Праге с лицензированным гидом. Пражский Град, Карлов мост, легенды →',
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

    // Process EN tours
    const enTours = await payload.find({
      collection: 'tours',
      where: { publishedLocales: { in: ['en'] } },
      limit: 200,
      locale: 'en',
      depth: 0,
    })

    for (const tour of enTours.docs) {
      const seoData = enSeoData[tour.slug]
      if (!seoData) continue

      try {
        // Update metaTitle (overwrite — keyword-optimized)
        await db.execute(
          sql`UPDATE tours_locales SET seo_meta_title = ${seoData.metaTitle}
              WHERE _parent_id = ${tour.id} AND _locale = 'en'`
        )
        await db.execute(
          sql`UPDATE _tours_v_locales SET version_seo_meta_title = ${seoData.metaTitle}
              WHERE _parent_id IN (
                SELECT id FROM _tours_v WHERE parent_id = ${tour.id} ORDER BY id DESC LIMIT 1
              ) AND _locale = 'en'`
        )

        // Update metaDescription (overwrite — keyword + price optimized)
        await db.execute(
          sql`UPDATE tours_locales SET seo_meta_description = ${seoData.metaDescription}
              WHERE _parent_id = ${tour.id} AND _locale = 'en'`
        )
        await db.execute(
          sql`UPDATE _tours_v_locales SET version_seo_meta_description = ${seoData.metaDescription}
              WHERE _parent_id IN (
                SELECT id FROM _tours_v WHERE parent_id = ${tour.id} ORDER BY id DESC LIMIT 1
              ) AND _locale = 'en'`
        )

        results.push({
          slug: tour.slug,
          locale: 'en',
          title: seoData.metaTitle,
          descLen: seoData.metaDescription.length,
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown'
        errors.push({ slug: tour.slug, locale: 'en', error: msg })
      }
    }

    // Process RU tours
    const ruTours = await payload.find({
      collection: 'tours',
      where: { publishedLocales: { in: ['ru'] } },
      limit: 200,
      locale: 'ru',
      depth: 0,
    })

    for (const tour of ruTours.docs) {
      const seoData = ruSeoData[tour.slug]
      if (!seoData) continue

      try {
        await db.execute(
          sql`UPDATE tours_locales SET seo_meta_title = ${seoData.metaTitle}
              WHERE _parent_id = ${tour.id} AND _locale = 'ru'`
        )
        await db.execute(
          sql`UPDATE _tours_v_locales SET version_seo_meta_title = ${seoData.metaTitle}
              WHERE _parent_id IN (
                SELECT id FROM _tours_v WHERE parent_id = ${tour.id} ORDER BY id DESC LIMIT 1
              ) AND _locale = 'ru'`
        )

        await db.execute(
          sql`UPDATE tours_locales SET seo_meta_description = ${seoData.metaDescription}
              WHERE _parent_id = ${tour.id} AND _locale = 'ru'`
        )
        await db.execute(
          sql`UPDATE _tours_v_locales SET version_seo_meta_description = ${seoData.metaDescription}
              WHERE _parent_id IN (
                SELECT id FROM _tours_v WHERE parent_id = ${tour.id} ORDER BY id DESC LIMIT 1
              ) AND _locale = 'ru'`
        )

        results.push({
          slug: tour.slug,
          locale: 'ru',
          title: seoData.metaTitle,
          descLen: seoData.metaDescription.length,
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown'
        errors.push({ slug: tour.slug, locale: 'ru', error: msg })
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
