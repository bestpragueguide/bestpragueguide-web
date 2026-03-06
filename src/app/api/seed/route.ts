import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const maxDuration = 300

interface PhotoData {
  name: string
  base64: string
  alt: string
  altRu: string
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const results: string[] = []

  try {
    // Check if tours already exist
    const existingTours = await payload.find({ collection: 'tours', limit: 1 })
    if (existingTours.totalDocs > 0) {
      return NextResponse.json({ error: 'Tours already seeded. Delete existing tours first.' }, { status: 400 })
    }

    // Parse body for photos
    let photos: PhotoData[] = []
    try {
      const body = await req.json()
      photos = body.photos || []
    } catch {
      // No photos provided — will create tours without images
    }

    const mediaIds: number[] = []

    for (const photo of photos) {
      try {
        const buffer = Buffer.from(photo.base64, 'base64')
        const media = await payload.create({
          collection: 'media',
          data: { alt: photo.alt },
          file: {
            data: buffer,
            mimetype: 'image/jpeg',
            name: photo.name,
            size: buffer.length,
          },
          locale: 'en',
        })

        await payload.update({
          collection: 'media',
          id: media.id,
          data: { alt: photo.altRu },
          locale: 'ru',
        })

        mediaIds.push(media.id as number)
        results.push(`Uploaded ${photo.name} → media ID ${media.id}`)
      } catch (e) {
        results.push(`Failed to upload ${photo.name}: ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    // Helper for richText (minimal Lexical format)
    const richText = (text: string) => ({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
            textFormat: 0,
            textStyle: '',
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    })

    // If no media was uploaded, use null for heroImage (make tours without images)
    const getMediaId = (index: number) => mediaIds.length > 0 ? mediaIds[index % mediaIds.length] : undefined
    const hasMedia = mediaIds.length > 0

    // Define all 21 tours - bilingual tours first
    const bilingualTours = [
      {
        en: { title: 'Charles Bridge and Old Town', slug: 'charles-bridge-old-town', excerpt: 'Walking tour of the right bank: Old Town Square, Astronomical Clock, Charles Bridge, hidden courtyards and medieval passages.', description: richText('Discover the heart of Prague on this 3-hour walking tour through the Old Town. Starting at the magnificent Old Town Square with its iconic Astronomical Clock, we\'ll explore hidden courtyards, medieval passages, and cross the legendary Charles Bridge. Your private guide will share centuries of history, local legends, and insider tips that only a longtime resident would know.') },
        ru: { title: 'Старый город', slug: 'staryj-gorod', excerpt: 'Пешеходная экскурсия по правому берегу: Староместская площадь, Астрономические часы, Карлов мост, скрытые дворики.', description: richText('Откройте для себя сердце Праги во время этой трёхчасовой пешеходной экскурсии по Старому городу. Начиная с величественной Староместской площади с её знаменитыми Астрономическими часами, мы исследуем скрытые дворики, средневековые пассажи и пересечём легендарный Карлов мост. Ваш персональный гид расскажет о многовековой истории, местных легендах и поделится секретами, которые знают только старожилы.') },
        category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 3, groupPrice: 139, publishedLocales: ['en', 'ru'],
        heroIdx: 0, galleryIdx: [4, 5],
        tags: ['best-seller', 'free-cancel', 'family-friendly'], difficulty: 'easy' as const, rating: 4.9, reviewCount: 47, sortOrder: 1,
        meetingPoint: { address: 'Old Town Square, near the Astronomical Clock', lat: 50.0870, lng: 14.4210, instructions: 'Meet at the statue of Jan Hus in the center of Old Town Square.' },
        meetingPointRu: { address: 'Староместская площадь, у Астрономических часов', instructions: 'Встречаемся у памятника Яну Гусу в центре Староместской площади.' },
        included: [{ en: 'Licensed English/Russian-speaking guide', ru: 'Лицензированный гид на русском языке' }, { en: 'Private tour — just your group', ru: 'Приватная экскурсия — только ваша группа' }, { en: 'Complimentary water bottle', ru: 'Бутылка воды в подарок' }],
        excluded: [{ en: 'Entrance fees (not required for the route)', ru: 'Входные билеты (не требуются по маршруту)' }, { en: 'Food and drinks', ru: 'Еда и напитки' }, { en: 'Transportation', ru: 'Транспорт' }],
        faq: [{ qEn: 'Is this tour suitable for children?', qRu: 'Подходит ли экскурсия для детей?', aEn: 'Absolutely! We adjust the pace and content for families with children of all ages.', aRu: 'Безусловно! Мы адаптируем темп и содержание для семей с детьми любого возраста.' }, { qEn: 'What happens in bad weather?', qRu: 'Что происходит в плохую погоду?', aEn: 'The tour runs rain or shine. We recommend comfortable walking shoes and weather-appropriate clothing.', aRu: 'Экскурсия проводится в любую погоду. Рекомендуем удобную обувь и одежду по погоде.' }],
      },
      {
        en: { title: 'Prague Castle and Lesser Town', slug: 'prague-castle-lesser-town', excerpt: 'Walking tour of the left bank: St. Vitus Cathedral, Castle grounds, Golden Lane, Royal Garden, and descent through Lesser Town.', description: richText('Explore the majestic Prague Castle complex, the largest ancient castle in the world. This 3-hour private tour takes you through the stunning St. Vitus Cathedral, along the charming Golden Lane, through the Royal Garden, and down through the picturesque Lesser Town with its baroque architecture and hidden gems.') },
        ru: { title: 'Пражский Град и Градчаны', slug: 'prazhskij-grad-i-gradchany', excerpt: 'Пешеходная экскурсия по левому берегу: Собор Святого Вита, Злата уличка, сады, спуск по Нерудовой улице.', description: richText('Исследуйте величественный Пражский Град — крупнейший древний замковый комплекс в мире. Эта трёхчасовая приватная экскурсия проведёт вас через потрясающий Собор Святого Вита, по очаровательной Златой уличке, через Королевский сад и вниз через живописную Малую Страну с её барочной архитектурой и скрытыми жемчужинами.') },
        category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 3, groupPrice: 149, publishedLocales: ['en', 'ru'],
        heroIdx: 1, galleryIdx: [0, 6],
        tags: ['best-seller', 'top-rated', 'free-cancel'], difficulty: 'moderate' as const, rating: 4.9, reviewCount: 38, sortOrder: 2,
        meetingPoint: { address: 'Prague Castle main entrance, Hradcanske namesti', lat: 50.0909, lng: 14.3986, instructions: 'Meet at the main gate of Prague Castle (Hradcanske namesti).' },
        meetingPointRu: { address: 'Главный вход в Пражский Град, Градчанская площадь', instructions: 'Встречаемся у главных ворот Пражского Града (Градчанская площадь).' },
        included: [{ en: 'Licensed English/Russian-speaking guide', ru: 'Лицензированный гид на русском языке' }, { en: 'Private tour — just your group', ru: 'Приватная экскурсия — только ваша группа' }],
        excluded: [{ en: 'Castle entrance tickets (optional, ~350 CZK)', ru: 'Входные билеты в Град (по желанию, ~350 CZK)' }, { en: 'Food and drinks', ru: 'Еда и напитки' }],
        faq: [{ qEn: 'Do we need tickets for Prague Castle?', qRu: 'Нужны ли билеты в Пражский Град?', aEn: 'The castle grounds are free. Interior tickets are optional and can be purchased on site.', aRu: 'Территория Града бесплатна. Билеты в интерьеры по желанию, можно купить на месте.' }],
      },
      {
        en: { title: 'Best of Prague: Car and Walking Tour', slug: 'best-of-prague-car-tour', excerpt: 'Combination driving and walking tour covering both banks and extended areas not reachable on foot in a single day.', description: richText('See the best of Prague in just 4 hours with this unique combination of driving and walking. Your private guide and driver take you through both banks of the Vltava, including areas that walking tours can\'t reach. Perfect for those with limited time or mobility, this tour covers Prague Castle, Old Town, Vysehrad, and hidden neighborhoods — all in comfort.') },
        ru: { title: 'Сити-тур', slug: 'siti-tur', excerpt: 'Обзорная экскурсия на автомобиле с пешими прогулками по обоим берегам Влтавы и отдалённым районам города.', description: richText('Увидьте лучшее в Праге всего за 4 часа с этой уникальной комбинацией автомобильной и пешеходной экскурсии. Персональный гид и водитель проведут вас по обоим берегам Влтавы, включая места, недоступные пешим маршрутам. Идеально для тех, у кого ограничено время — Пражский Град, Старый город, Вышеград и скрытые кварталы в комфорте.') },
        category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 4, groupPrice: 199, publishedLocales: ['en', 'ru'],
        heroIdx: 2, galleryIdx: [1, 3],
        tags: ['top-rated', 'free-cancel', 'accessible', 'transport'], difficulty: 'easy' as const, rating: 5.0, reviewCount: 23, sortOrder: 3,
        meetingPoint: { address: 'Your hotel or any location in Prague center', lat: 50.0755, lng: 14.4378, instructions: 'Hotel pickup included. Please provide your hotel address when booking.' },
        meetingPointRu: { address: 'Ваш отель или любое место в центре Праги', instructions: 'Трансфер от отеля включён. Пожалуйста, укажите адрес отеля при бронировании.' },
        included: [{ en: 'Licensed English/Russian-speaking guide', ru: 'Лицензированный гид на русском языке' }, { en: 'Private car with driver', ru: 'Автомобиль с водителем' }, { en: 'Hotel pickup and drop-off', ru: 'Трансфер от отеля и обратно' }, { en: 'Water and snacks', ru: 'Вода и лёгкие закуски' }],
        excluded: [{ en: 'Entrance fees', ru: 'Входные билеты' }, { en: 'Lunch', ru: 'Обед' }],
        faq: [{ qEn: 'What type of car is used?', qRu: 'Какой автомобиль используется?', aEn: 'A comfortable sedan or minivan depending on group size.', aRu: 'Комфортабельный седан или минивэн в зависимости от размера группы.' }],
      },
    ]

    const ruOnlyTours = [
      { title: 'Прага глазами местного жителя', slug: 'praga-glazami-mestnogo', excerpt: 'Обзорная пешеходная экскурсия по туристическим и нетуристическим местам Праги', desc: 'Увидьте Прагу такой, какой её знают местные жители. Эта экскурсия откроет вам не только знаменитые достопримечательности, но и скрытые уголки, о которых не пишут в путеводителях. Ваш гид — старожил Праги — покажет любимые места и расскажет реальные истории из жизни города.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 3, price: 119, sortOrder: 4, difficulty: 'easy' as const, tags: ['hidden-gem', 'free-cancel'], rating: 4.8, reviews: 31 },
      { title: 'Новый город', slug: 'novyj-gorod', excerpt: 'Вацлавская площадь, Танцующий дом, набережная Влтавы', desc: 'Откройте для себя Новый город Праги — район, полный контрастов: от готических храмов до модернистских зданий. Вацлавская площадь, Танцующий дом, набережная Влтавы и уютные кафе на каждом углу.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 2, price: 99, sortOrder: 5, difficulty: 'easy' as const, tags: ['free-cancel'], rating: 4.7, reviews: 15 },
      { title: 'Круиз по Влтаве', slug: 'kruiz-po-vltave', excerpt: 'Речной круиз по Влтаве с видами на Пражский Град, Карлов мост и набережные', desc: 'Насладитесь Прагой с воды! Речной круиз по Влтаве откроет потрясающие виды на Пражский Град, Карлов мост, Национальный театр и живописные набережные. Идеальное дополнение к пешеходным экскурсиям.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 2, price: 99, sortOrder: 6, difficulty: 'easy' as const, tags: ['family-friendly', 'accessible'], rating: 4.8, reviews: 22 },
      { title: 'Пражская Венеция', slug: 'prazhskaya-venetsiya', excerpt: 'Прогулка на лодке по каналу Чертовка — самому романтичному месту Праги', desc: 'Канал Чертовка — это «Пражская Венеция», одно из самых романтичных мест города. Прогулка на лодке по узкому каналу среди старинных мельниц и под низкими мостиками оставит незабываемые впечатления.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 1.5, price: 89, sortOrder: 7, difficulty: 'easy' as const, tags: ['hidden-gem'], rating: 4.9, reviews: 18 },
      { title: 'Вечерняя на теплоходе Легенды Праги', slug: 'vechernyaya-legendy-pragi', excerpt: 'Вечерний круиз с рассказами о легендах и тайнах Праги', desc: 'Вечерний круиз по Влтаве — когда Прага загорается тысячами огней, а гид рассказывает захватывающие легенды и тайны города. Романтическая атмосфера, великолепные виды и истории, которые не забудете.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 2, price: 119, sortOrder: 8, difficulty: 'easy' as const, tags: ['top-rated'], rating: 4.9, reviews: 27 },
      { title: 'Мистическая Прага', slug: 'misticheskaya-praga', excerpt: 'Вечерняя тематическая экскурсия: легенды, призраки, алхимики Праги', desc: 'Когда солнце садится, Прага раскрывает свои тайны. Эта вечерняя экскурсия проведёт вас по мистическим местам города: от алхимических лабораторий до домов с призраками. Услышите леденящие кровь легенды и увидите Прагу, которую скрывает дневной свет.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 2, price: 119, sortOrder: 9, difficulty: 'easy' as const, tags: ['hidden-gem'], rating: 4.8, reviews: 19 },
      { title: 'Еврейский квартал', slug: 'evrejskij-kvartal', excerpt: 'Синагоги, Старое кладбище, легенда о Големе, мир Кафки', desc: 'Еврейский квартал Праги — Йозефов — одно из самых мистических и исторически значимых мест в Европе. Древние синагоги, Старое кладбище, легенда о Големе раввина Лёва и мир Франца Кафки оживут в рассказах вашего гида.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 2.5, price: 109, sortOrder: 10, difficulty: 'easy' as const, tags: ['top-rated', 'free-cancel'], rating: 4.9, reviews: 25 },
      { title: 'Вышеград', slug: 'vysehrad', excerpt: 'Крепость, легенда о Либуше, кладбище знаменитостей', desc: 'Вышеград — древняя крепость на скале над Влтавой, откуда, по легенде, княгиня Либуше предсказала великое будущее Праги. Базилика, кладбище, где покоятся Дворжак и Сметана, и потрясающие виды на город.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 2, price: 99, sortOrder: 11, difficulty: 'moderate' as const, tags: ['hidden-gem', 'free-cancel'], rating: 4.7, reviews: 12 },
      { title: 'Голливуд Восточной Европы — Баррандов', slug: 'gollivud-barrandov', excerpt: 'Посещение легендарной киностудии Баррандов с экскурсией', desc: 'Баррандов — знаменитая пражская киностудия, где снимались голливудские блокбастеры. Уникальная возможность заглянуть за кулисы кинопроизводства, увидеть декорации и узнать историю чешского и мирового кинематографа.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 4, price: 179, sortOrder: 12, difficulty: 'easy' as const, tags: ['transport'], rating: 4.8, reviews: 9 },
      { title: 'Чёрный театр — театр Теней', slug: 'chernyj-teatr', excerpt: 'Организация посещения знаменитого чёрного театра теней в Праге', desc: 'Чёрный театр теней — уникальное пражское искусство, которое не имеет аналогов в мире. Мы организуем посещение лучшего представления с пояснениями гида.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 2, price: 89, sortOrder: 13, difficulty: 'easy' as const, tags: ['family-friendly'], rating: 4.6, reviews: 8 },
      { title: 'Онлайн-экскурсия по Праге', slug: 'onlajn-ekskursiya', excerpt: 'Виртуальная экскурсия по Праге — идеально для подготовки к поездке', desc: 'Не выходя из дома, совершите виртуальное путешествие по Праге. Идеально для подготовки к поездке: узнаете, что обязательно нужно увидеть, где лучше поесть и как избежать туристических ловушек.', category: 'prague-tours' as const, subcategory: 'sightseeing' as const, duration: 1.5, price: 49, sortOrder: 14, difficulty: 'easy' as const, tags: ['accessible'], rating: 4.5, reviews: 6 },
      { title: 'Пивной тур', slug: 'pivnoj-tur', excerpt: 'Крафтовые пивоварни, дегустации чешского пива — от монастырских традиций до современных микропивоварен', desc: 'Чешское пиво — мировое наследие. Этот гастрономический тур проведёт вас по лучшим крафтовым пивоварням Праги: от монастырских традиций до современных микропивоварен. Дегустации, истории и секреты чешского пивоварения.', category: 'prague-tours' as const, subcategory: 'beer-and-food' as const, duration: 3.5, price: 139, sortOrder: 15, difficulty: 'easy' as const, tags: ['best-seller'], rating: 4.9, reviews: 35 },
      { title: 'Средневековое шоу (ужин У Паука)', slug: 'srednevekovoe-shou', excerpt: 'Ресторан с историческим средневековым представлением', desc: 'Погрузитесь в атмосферу средневековой Праги! Ужин в ресторане «У Паука» с живым средневековым представлением: фехтовальщики, жонглёры, огненное шоу и традиционная чешская кухня.', category: 'prague-tours' as const, subcategory: 'beer-and-food' as const, duration: 3, price: 79, sortOrder: 16, difficulty: 'easy' as const, tags: ['family-friendly'], rating: 4.7, reviews: 14 },
      { title: 'Фольклорный вечер', slug: 'folklornyj-vecher', excerpt: 'Традиционный чешский вечер с национальной кухней и живой музыкой', desc: 'Проведите незабываемый вечер в традиционном чешском ресторане с живой фольклорной музыкой, национальными танцами и аутентичной кухней. Полное погружение в чешскую культуру.', category: 'prague-tours' as const, subcategory: 'beer-and-food' as const, duration: 3, price: 119, sortOrder: 17, difficulty: 'easy' as const, tags: [] as string[], rating: 4.6, reviews: 11 },
      { title: 'Чески-Крумлов', slug: 'chesky-krumlov', excerpt: 'ЮНЕСКО, замок, средневековый город, обед у реки, живописная дорога', desc: 'Чески-Крумлов — жемчужина Южной Чехии и объект ЮНЕСКО. Средневековый замок, извилистые улочки, обед на берегу реки и живописная дорога через чешскую деревню. Полный день незабываемых впечатлений.', category: 'day-trips-from-prague' as const, subcategory: undefined, duration: 10, price: 299, sortOrder: 18, difficulty: 'easy' as const, tags: ['top-rated', 'transport', 'free-cancel'], rating: 5.0, reviews: 29 },
      { title: 'Кутна Гора', slug: 'kutna-gora', excerpt: 'Костница, Собор Святой Варвары, средневековый центр города', desc: 'Кутна Гора — город серебра и костей. Знаменитая Костница (Седлецкий оссуарий), величественный Собор Святой Варвары и средневековый центр города с богатой историей горнодобычи.', category: 'day-trips-from-prague' as const, subcategory: undefined, duration: 7, price: 249, sortOrder: 19, difficulty: 'easy' as const, tags: ['transport', 'free-cancel'], rating: 4.8, reviews: 17 },
      { title: 'Дрезден + Саксонская Швейцария', slug: 'drezden-saksonskaya-shvejtsariya', excerpt: 'Цвингер, Фрауэнкирхе, Зелёные своды + природный парк Саксонская Швейцария', desc: 'Два путешествия за один день: Дрезден — «Флоренция на Эльбе» с Цвингером, Фрауэнкирхе и Зелёными сводами, и Саксонская Швейцария — природный парк с фантастическими скальными формациями.', category: 'day-trips-from-prague' as const, subcategory: undefined, duration: 10, price: 349, sortOrder: 20, difficulty: 'moderate' as const, tags: ['transport'], rating: 4.9, reviews: 13 },
      { title: 'Вена', slug: 'vena', excerpt: 'Столица Австрии — дворцы, исторический центр, имперская архитектура', desc: 'Однодневная экскурсия в столицу Австрии. Шёнбрунн, Хофбург, Собор Святого Стефана, Рингштрассе и знаменитые венские кафе. Погружение в имперскую атмосферу одной из красивейших столиц Европы.', category: 'day-trips-from-prague' as const, subcategory: undefined, duration: 12, price: 399, sortOrder: 21, difficulty: 'easy' as const, tags: ['transport'], rating: 4.8, reviews: 8 },
    ]

    // Create bilingual tours
    for (const tour of bilingualTours) {
      const heroImg = getMediaId(tour.heroIdx)
      const galleryItems = hasMedia ? tour.galleryIdx.map(idx => ({ image: getMediaId(idx) })) : []

      const data: Record<string, unknown> = {
        title: tour.en.title,
        slug: tour.en.slug,
        excerpt: tour.en.excerpt,
        description: tour.en.description,
        category: tour.category,
        subcategory: tour.subcategory,
        duration: tour.duration,
        groupPrice: tour.groupPrice,
        publishedLocales: tour.publishedLocales,
        status: 'published',
        sortOrder: tour.sortOrder,
        rating: tour.rating,
        reviewCount: tour.reviewCount,
        tags: tour.tags,
        difficulty: tour.difficulty,
        meetingPoint: tour.meetingPoint,
        included: tour.included.map(i => ({ text: i.en })),
        excluded: tour.excluded.map(i => ({ text: i.en })),
        faq: tour.faq.map(f => ({ question: f.qEn, answer: f.aEn })),
        _status: 'published',
      }

      if (heroImg) data.heroImage = heroImg
      if (galleryItems.length > 0) data.gallery = galleryItems

      const created = await payload.create({ collection: 'tours', locale: 'en', data })

      await payload.update({
        collection: 'tours',
        id: created.id,
        locale: 'ru',
        data: {
          title: tour.ru.title,
          slug: tour.ru.slug,
          excerpt: tour.ru.excerpt,
          description: tour.ru.description,
          meetingPoint: { ...tour.meetingPoint, address: tour.meetingPointRu.address, instructions: tour.meetingPointRu.instructions },
          included: tour.included.map(i => ({ text: i.ru })),
          excluded: tour.excluded.map(i => ({ text: i.ru })),
          faq: tour.faq.map(f => ({ question: f.qRu, answer: f.aRu })),
        },
      })

      results.push(`Created bilingual tour: ${tour.en.title} / ${tour.ru.title} (ID: ${created.id})`)
    }

    // Create RU-only tours
    for (let i = 0; i < ruOnlyTours.length; i++) {
      const tour = ruOnlyTours[i]
      const heroImg = getMediaId(i)
      const galleryImg1 = getMediaId(i + 1)
      const galleryImg2 = getMediaId(i + 2)

      const data: Record<string, unknown> = {
        title: tour.title,
        slug: tour.slug,
        excerpt: tour.excerpt,
        description: richText(tour.desc),
        category: tour.category,
        subcategory: tour.subcategory,
        duration: tour.duration,
        groupPrice: tour.price,
        publishedLocales: ['ru'],
        status: 'published',
        sortOrder: tour.sortOrder,
        rating: tour.rating,
        reviewCount: tour.reviews,
        tags: tour.tags,
        difficulty: tour.difficulty,
        _status: 'published',
      }

      if (heroImg) data.heroImage = heroImg
      if (hasMedia) data.gallery = [{ image: galleryImg1 }, { image: galleryImg2 }]

      const created = await payload.create({ collection: 'tours', locale: 'ru', data })

      // EN fallback for admin
      await payload.update({
        collection: 'tours',
        id: created.id,
        locale: 'en',
        data: {
          title: tour.title,
          slug: tour.slug,
          excerpt: tour.excerpt,
          description: richText(tour.desc),
        },
      })

      results.push(`Created RU-only tour: ${tour.title} (ID: ${created.id})`)
    }

    // Create reviews
    const allTours = await payload.find({ collection: 'tours', limit: 100, sort: 'sortOrder' })
    const tourIds = allTours.docs.map(t => t.id)

    const reviews = [
      { tourIdx: 0, name: 'James M.', country: 'United Kingdom', rating: 5, title: 'Absolutely wonderful!', body: 'Uliana was an amazing guide. Her knowledge of Prague\'s history and hidden spots made this tour unforgettable. Highly recommend!', language: 'en', featured: true },
      { tourIdx: 0, name: 'Sarah K.', country: 'United States', rating: 5, title: 'Best tour in Prague', body: 'We\'ve done many tours in Europe, but this was by far the best. Private, personalized, and full of fascinating stories.', language: 'en', featured: true },
      { tourIdx: 1, name: 'Robert L.', country: 'Canada', rating: 5, title: 'Perfect private tour', body: 'The Prague Castle tour was perfectly organized. Our guide knew every corner and shared stories you won\'t find in any guidebook.', language: 'en', featured: true },
      { tourIdx: 0, name: 'Мария К.', country: 'Россия', rating: 5, title: 'Потрясающая экскурсия!', body: 'Улиана — невероятный гид! Три часа пролетели незаметно. Узнали столько интересного о Праге, что в путеводителях не прочитаешь.', language: 'ru', featured: true },
      { tourIdx: 1, name: 'Андрей В.', country: 'Россия', rating: 5, title: 'Лучший гид в Праге', body: 'Экскурсия в Пражский Град превзошла все ожидания. Улиана знает каждый камень и рассказывает так, что не хочется уходить.', language: 'ru', featured: true },
      { tourIdx: 2, name: 'Елена С.', country: 'Россия', rating: 5, title: 'Идеальный сити-тур!', body: 'Замечательная экскурсия на автомобиле. За 4 часа увидели всю Прагу, включая места, куда бы сами не добрались. Очень рекомендую!', language: 'ru', featured: true },
      { tourIdx: 0, name: 'David H.', country: 'Australia', rating: 4, title: 'Great experience', body: 'Really enjoyed the walking tour through Old Town. Our guide was knowledgeable and friendly. Would have loved it to be a bit longer!', language: 'en', featured: false },
      { tourIdx: 2, name: 'Ольга П.', country: 'Россия', rating: 5, title: 'Вся Прага за один день', body: 'Брали сити-тур с детьми — идеальный формат. Не устали, увидели всё самое важное, гид прекрасно ладит с детьми.', language: 'ru', featured: true },
    ]

    for (const review of reviews) {
      const tourId = tourIds[review.tourIdx]
      if (!tourId) continue

      await payload.create({
        collection: 'reviews',
        data: {
          tour: tourId,
          customerName: review.name,
          customerCountry: review.country,
          rating: review.rating,
          title: review.title,
          body: review.body,
          language: review.language,
          status: 'approved',
          featured: review.featured,
        },
      })
      results.push(`Created review by ${review.name}`)
    }

    // Update SiteSettings
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'en',
      data: {
        siteName: 'Best Prague Guide',
        tagline: 'Private Tours with Licensed Guides',
        contactEmail: 'info@bestpragueguide.com',
        contactPhone: '+420 XXX XXX XXX',
        whatsappNumber: '+420XXXXXXXXX',
        telegramHandle: 'bestpragueguide',
        businessHours: '09:00–20:00 CET',
        social: {
          instagramUrl: 'https://instagram.com/bestpragueguide',
          youtubeUrl: 'https://youtube.com/@bestpragueguide',
          tripAdvisorUrl: 'https://tripadvisor.com/bestpragueguide',
          googleBusinessUrl: 'https://g.page/bestpragueguide',
        },
      },
    })

    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'ru',
      data: {
        tagline: 'Приватные экскурсии с лицензированными гидами',
      },
    })

    results.push('Updated SiteSettings')

    return NextResponse.json({
      success: true,
      message: `Seeded ${bilingualTours.length + ruOnlyTours.length} tours, ${reviews.length} reviews, site settings`,
      results,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({ error: message, stack, results }, { status: 500 })
  }
}
