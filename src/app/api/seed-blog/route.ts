import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const blogPosts = [
  {
    title: { en: '10 Hidden Gems in Prague Most Tourists Miss', ru: '10 секретных мест Праги, которые не знают туристы' },
    slug: { en: '10-hidden-gems-prague', ru: '10-sekretnyh-mest-pragi' },
    excerpt: {
      en: 'Prague is full of surprises beyond the Charles Bridge and Old Town Square. After 17 years of guiding, here are my favorite hidden spots that most visitors walk right past.',
      ru: 'Прага полна сюрпризов за пределами Карлова моста и Староместской площади. За 17 лет работы гидом я собрала любимые места, мимо которых проходят большинство туристов.',
    },
    content: {
      en: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'Prague is one of the most visited cities in Europe, yet so many of its treasures remain undiscovered by the average tourist. After guiding thousands of visitors through this magical city for over 17 years, I\'ve collected my absolute favorite hidden spots that deserve more attention.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '1. Vyšehrad Cemetery' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'While most visitors flock to Prague Castle, the ancient fortress of Vyšehrad offers equally stunning views without the crowds. The cemetery here is the final resting place of Czech cultural legends including Dvořák and Smetana. The rotunda of St. Martin, dating back to the 11th century, is one of the oldest surviving buildings in Prague.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '2. Kampa Island' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Often called "Prague\'s Venice," this island in the Vltava River is accessible from Charles Bridge but surprisingly few tourists venture here. The Grand Priory Mill waterwheel, the John Lennon Wall, and the quirky David Černý baby sculptures make it a photographer\'s paradise.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '3. Nový Svět (New World)' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Tucked behind the Loreto Church near Prague Castle, this tiny neighborhood of colorful cottages feels like stepping into a fairy tale. Once home to Prague\'s poorest residents, it later attracted artists and intellectuals including Tycho Brahe and Johannes Kepler.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '4. Vrtba Garden' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'This UNESCO-listed Baroque garden is hidden behind an unassuming door on Karmelitská Street. The terraced garden offers some of the best views of Prague Castle and Lesser Town, all for a minimal entrance fee and without the crowds.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '5. Letná Beer Garden' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'The panoramic views from Letná Park are legendary among locals but overlooked by many tourists. Grab a beer at the open-air garden and watch the sunset paint the city\'s spires golden. The giant metronome on the hill is a quirky bonus — it stands where a massive Stalin statue once loomed.' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Want to discover these hidden gems and more with a local guide? Our private tours are designed to go beyond the standard tourist routes. We\'ll show you the Prague that even many guidebooks miss.' }] },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      ru: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'Прага — один из самых посещаемых городов Европы, но многие его сокровища остаются неизвестными для большинства туристов. За более чем 17 лет работы гидом я собрала свои абсолютно любимые скрытые места, которые заслуживают большего внимания.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '1. Вышеградское кладбище' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Пока большинство туристов стремятся в Пражский Град, древняя крепость Вышеград предлагает столь же потрясающие виды без толп. Кладбище здесь — последнее пристанище чешских культурных легенд, включая Дворжака и Сметану. Ротонда Святого Мартина XI века — одно из старейших сохранившихся зданий Праги.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '2. Остров Кампа' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Часто называемый «Пражской Венецией», этот остров на Влтаве доступен с Карлова моста, но удивительно мало туристов заходят сюда. Водяное колесо Великоприорской мельницы, стена Джона Леннона и причудливые скульптуры младенцев Давида Черного делают его раем для фотографов.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '3. Новый Свет' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Спрятанный за Лоретой рядом с Пражским Градом, этот крошечный район с разноцветными домиками напоминает сказку. Когда-то здесь жили беднейшие жители Праги, а позже — художники и интеллектуалы, включая Тихо Браге и Иоганна Кеплера.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '4. Вртбовский сад' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Этот барочный сад из списка ЮНЕСКО скрыт за неприметной дверью на улице Кармелитска. Террасный сад предлагает одни из лучших видов на Пражский Град и Малу Страну за минимальную плату и без толп туристов.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '5. Пивной сад на Летне' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Панорамные виды из парка Летна легендарны среди местных, но часто остаются незамеченными туристами. Возьмите пиво в открытом кафе и наблюдайте, как закат окрашивает шпили города в золото. Гигантский метроном на холме — забавный бонус: он стоит там, где когда-то возвышалась огромная статуя Сталина.' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Хотите открыть эти и другие секретные места с местным гидом? Наши индивидуальные экскурсии выходят за рамки стандартных туристических маршрутов. Мы покажем вам Прагу, которую не найти даже в путеводителях.' }] },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
    category: 'prague-guide',
    heroImageId: 17, // Prague panoramic view
    publishedAt: '2026-02-28',
  },
  {
    title: { en: 'Prague Food Guide: What to Eat and Where', ru: 'Гастрономический гид по Праге: что попробовать и где' },
    slug: { en: 'prague-food-guide', ru: 'gastronomicheskij-gid-po-prage' },
    excerpt: {
      en: 'From trdelník to svíčková, Prague\'s food scene is a delicious blend of hearty tradition and modern creativity. Here\'s your insider guide to eating like a local.',
      ru: 'От трдельника до свичковой — пражская кухня сочетает сытные традиции и современную креативность. Ваш инсайдерский гид по еде как местный житель.',
    },
    content: {
      en: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'Czech cuisine is hearty, flavorful, and pairs perfectly with the country\'s world-famous beer. While Prague has embraced international food trends, the traditional dishes remain the heart and soul of the local dining scene. Here\'s what you absolutely must try.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Must-Try Czech Dishes' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Svíčková na smetaně (marinated beef sirloin with cream sauce and dumplings) is considered the national dish. Vepřo-knedlo-zelo (roasted pork with sauerkraut and dumplings) is the quintessential pub meal. And for something unique, try kulajda — a creamy mushroom and dill soup with a poached egg.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Best Beer Experiences' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'The Czech Republic has the highest beer consumption per capita in the world, and for good reason. Skip the tourist traps and head to authentic pivnice (beer halls) like U Fleků (brewing since 1499), Lokál Dlouhááá for perfectly poured Pilsner Urquell, or the craft beer bars in Vinohrady neighborhood.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Street Food Worth Trying' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Trdelník (chimney cake) is everywhere, but it\'s actually more of a tourist invention than a Czech tradition. For authentic street food, look for klobása (grilled sausage) from the farmers\' markets, or langoš (fried dough with garlic and cheese) for a more Hungarian-influenced treat.' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Our Beer and Food tours take you to the best local spots that tourists rarely find on their own. From historic beer halls to hidden restaurants, we\'ll guide your taste buds through the real Prague.' }] },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      ru: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'Чешская кухня — сытная, ароматная и идеально сочетается со всемирно известным пивом. Хотя Прага приняла международные гастрономические тренды, традиционные блюда остаются сердцем и душой местной кухни. Вот что обязательно нужно попробовать.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Блюда, которые нужно попробовать' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Свичкова на сметане (маринованная говяжья вырезка с кремовым соусом и кнедликами) считается национальным блюдом. Вепржо-кнедло-зело (жареная свинина с квашеной капустой и кнедликами) — классическое блюдо в пивных. А для уникального опыта попробуйте кулайду — кремовый грибной суп с укропом и яйцом пашот.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Лучшие пивные впечатления' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Чехия лидирует в мире по потреблению пива на душу населения, и не без причины. Пропустите туристические ловушки и направляйтесь в настоящие пивницы: U Fleků (варят пиво с 1499 года), Lokál Dlouhááá для идеально налитого Pilsner Urquell или крафтовые бары в районе Винограды.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Уличная еда' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Трдельник (дымковый пирог) повсюду, но на самом деле это больше туристическое изобретение, чем чешская традиция. Для настоящей уличной еды ищите клобасу (жареную колбасу) на фермерских рынках или лангош (жареное тесто с чесноком и сыром) — блюдо с венгерским влиянием.' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Наши пивные и гастрономические туры проведут вас по лучшим местным заведениям, которые туристы редко находят самостоятельно. От исторических пивных до скрытых ресторанов — мы проведём ваши вкусовые рецепторы через настоящую Прагу.' }] },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
    category: 'food-and-drink',
    heroImageId: 22, // Family at Kampa (closest to food/street scene)
    publishedAt: '2026-02-25',
  },
  {
    title: { en: 'Day Trip from Prague: Český Krumlov Complete Guide', ru: 'Однодневная поездка из Праги: полный гид по Чески-Крумлову' },
    slug: { en: 'day-trip-cesky-krumlov', ru: 'poezdka-chesky-krumlov' },
    excerpt: {
      en: 'Český Krumlov is the most popular day trip from Prague — and for good reason. This UNESCO gem feels like stepping back in time. Here\'s everything you need to know.',
      ru: 'Чески-Крумлов — самая популярная однодневная поездка из Праги. Этот город из списка ЮНЕСКО словно переносит во времени. Всё, что нужно знать.',
    },
    content: {
      en: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'About 180 km south of Prague lies Český Krumlov, a fairy-tale town wrapped around a bend in the Vltava River. Its castle is the second-largest in the Czech Republic (after Prague Castle), and the entire historic center is a UNESCO World Heritage site. It\'s easily the most rewarding day trip you can take from Prague.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Getting There' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'By car, the drive takes about 2.5 hours via the D3 motorway. By bus (RegioJet or FlixBus), it takes about 3 hours. We recommend a private car tour — you can stop at scenic viewpoints along the way and visit at your own pace without worrying about bus schedules.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'What to See' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'The Castle and its famous Cloak Bridge offer spectacular views. The castle gardens feature a Baroque theater — one of only three remaining in the world. In the old town, wander the narrow streets, visit the Church of St. Vitus, and cross the stone bridges over the Vltava. Don\'t miss the Egon Schiele Art Centrum if you appreciate early 20th-century art.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Where to Eat' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'For traditional Czech food with a river view, try Na Louži or Krčma v Šatlavské. For a more upscale experience, Krumlov Mill offers excellent regional cuisine. And of course, try the local Eggenberg beer — brewed right in town since the 14th century.' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Our Český Krumlov day trip includes comfortable private transport, a guided tour of the castle and old town, and recommendations for the best lunch spots. It\'s a full 10-hour experience that covers everything this magical town has to offer.' }] },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      ru: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'Примерно в 180 км к югу от Праги расположен Чески-Крумлов — сказочный город, обвивающий излучину Влтавы. Его замок — второй по величине в Чехии (после Пражского Града), а весь исторический центр включён в список Всемирного наследия ЮНЕСКО. Это, безусловно, самая стоящая однодневная поездка из Праги.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Как добраться' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'На машине дорога занимает около 2,5 часов по автомагистрали D3. Автобусом (RegioJet или FlixBus) — около 3 часов. Мы рекомендуем поездку на частном автомобиле — можно останавливаться на живописных смотровых площадках и посещать всё в своём темпе.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Что посмотреть' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Замок и его знаменитый Плащевой мост предлагают захватывающие виды. В замковых садах находится барочный театр — один из трёх сохранившихся в мире. В старом городе бродите по узким улочкам, посетите костёл Святого Вита и перейдите каменные мосты через Влтаву. Не пропустите Центр искусств Эгона Шиле.' }] },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Где поесть' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Для традиционной чешской кухни с видом на реку попробуйте Na Louži или Krčma v Šatlavské. Для более изысканного опыта — Krumlov Mill с отличной региональной кухней. И конечно, попробуйте местное пиво Eggenberg — его варят прямо в городе с XIV века.' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Наша поездка в Чески-Крумлов включает комфортный частный транспорт, экскурсию по замку и старому городу, а также рекомендации лучших мест для обеда. Это полноценный 10-часовой опыт, который покрывает всё, что может предложить этот волшебный город.' }] },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
    category: 'day-trips',
    heroImageId: 18, // Guide by Vltava (scenic)
    publishedAt: '2026-02-20',
  },
]

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const results: Array<{ title: string; id: number; slug: string }> = []
    const errors: Array<{ title: string; error: string }> = []

    for (const post of blogPosts) {
      try {
        const created = await payload.create({
          collection: 'blog-posts',
          data: {
            title: post.title.en,
            slug: post.slug.en,
            excerpt: post.excerpt.en,
            content: post.content.en,
            category: post.category,
            heroImage: post.heroImageId,
            author: 'Uliana Formina',
            publishedAt: post.publishedAt,
            status: 'published',
            publishedLocales: ['en', 'ru'],
          },
          locale: 'en',
        })

        // Update with RU locale data
        await payload.update({
          collection: 'blog-posts',
          id: created.id,
          data: {
            title: post.title.ru,
            slug: post.slug.ru,
            excerpt: post.excerpt.ru,
            content: post.content.ru,
          },
          locale: 'ru',
        })

        results.push({ title: post.title.en, id: created.id as number, slug: post.slug.en })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        errors.push({ title: post.title.en, error: message })
      }
    }

    return NextResponse.json({ success: true, created: results, errors })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
