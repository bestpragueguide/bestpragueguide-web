import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import path from 'path'
import fs from 'fs'

export const maxDuration = 300

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

    // Upload media files
    const mediaDir = '/home/bestpragueguide/workspace/bestpragueguide-docs/FIRST-SAMPLE-WEB/images'
    const photoFiles = [
      { file: 'photo_1_2025-02-27_02-04-23.jpg', alt: 'Uliana at Old Town Square near Astronomical Clock', altRu: 'Улиана на Староместской площади у Астрономических часов' },
      { file: 'photo_2_2025-02-27_02-04-23.jpg', alt: 'Uliana overlooking Prague from the Castle area', altRu: 'Улиана с видом на Прагу с территории Града' },
      { file: 'photo_3_2025-02-27_02-04-23.jpg', alt: 'Uliana by Vltava river with Charles Bridge', altRu: 'Улиана у Влтавы с видом на Карлов мост' },
      { file: 'photo_4_2025-02-27_02-04-23.jpg', alt: 'Uliana at Prague Astronomical Clock', altRu: 'Улиана у пражских Астрономических часов' },
      { file: 'photo_5_2025-02-27_02-04-23.jpg', alt: 'Uliana guiding a family at Old Town Square', altRu: 'Улиана проводит экскурсию для семьи на Староместской площади' },
      { file: 'photo_6_2025-02-27_02-04-23.jpg', alt: 'Uliana with tourists near Charles Bridge', altRu: 'Улиана с туристами у Карлова моста' },
      { file: 'photo_7_2025-02-27_02-04-23.jpg', alt: 'Uliana with family near Kampa island', altRu: 'Улиана с семьёй у острова Кампа' },
    ]

    const mediaIds: number[] = []

    for (const photo of photoFiles) {
      const filePath = path.join(mediaDir, photo.file)
      if (!fs.existsSync(filePath)) {
        results.push(`Skipped ${photo.file} (not found)`)
        continue
      }

      const buffer = fs.readFileSync(filePath)
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: photo.alt,
        },
        file: {
          data: buffer,
          mimetype: 'image/jpeg',
          name: photo.file,
          size: buffer.length,
        },
        locale: 'en',
      })

      // Update RU alt text
      await payload.update({
        collection: 'media',
        id: media.id,
        data: {
          alt: photo.altRu,
        },
        locale: 'ru',
      })

      mediaIds.push(media.id as number)
      results.push(`Uploaded ${photo.file} → media ID ${media.id}`)
    }

    if (mediaIds.length === 0) {
      return NextResponse.json({ error: 'No media files found to upload', results }, { status: 500 })
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

    // Define all 21 tours
    const tours = [
      // Tour 1: Charles Bridge and Old Town (EN+RU)
      {
        en: {
          title: 'Charles Bridge and Old Town',
          slug: 'charles-bridge-old-town',
          excerpt: 'Walking tour of the right bank: Old Town Square, Astronomical Clock, Charles Bridge, hidden courtyards and medieval passages.',
          description: richText('Discover the heart of Prague on this 3-hour walking tour through the Old Town. Starting at the magnificent Old Town Square with its iconic Astronomical Clock, we\'ll explore hidden courtyards, medieval passages, and cross the legendary Charles Bridge. Your private guide will share centuries of history, local legends, and insider tips that only a longtime resident would know.'),
        },
        ru: {
          title: 'Старый город',
          slug: 'staryj-gorod',
          excerpt: 'Пешеходная экскурсия по правому берегу: Староместская площадь, Астрономические часы, Карлов мост, скрытые дворики.',
          description: richText('Откройте для себя сердце Праги во время этой трёхчасовой пешеходной экскурсии по Старому городу. Начиная с величественной Староместской площади с её знаменитыми Астрономическими часами, мы исследуем скрытые дворики, средневековые пассажи и пересечём легендарный Карлов мост. Ваш персональный гид расскажет о многовековой истории, местных легендах и поделится секретами, которые знают только старожилы.'),
        },
        category: 'prague-tours',
        subcategory: 'sightseeing',
        duration: 3,
        groupPrice: 139,
        publishedLocales: ['en', 'ru'],
        heroImage: mediaIds[0],
        gallery: [mediaIds[4], mediaIds[5]],
        tags: ['best-seller', 'free-cancel', 'family-friendly'],
        difficulty: 'easy',
        rating: 4.9,
        reviewCount: 47,
        sortOrder: 1,
        meetingPoint: { address: 'Old Town Square, near the Astronomical Clock', lat: 50.0870, lng: 14.4210, instructions: 'Meet at the statue of Jan Hus in the center of Old Town Square.' },
        meetingPointRu: { address: 'Староместская площадь, у Астрономических часов', instructions: 'Встречаемся у памятника Яну Гусу в центре Староместской площади.' },
        highlights: [
          { en: 'Old Town Square and Astronomical Clock', ru: 'Староместская площадь и Астрономические часы' },
          { en: 'Charles Bridge with panoramic views', ru: 'Карлов мост с панорамными видами' },
          { en: 'Hidden medieval courtyards', ru: 'Скрытые средневековые дворики' },
          { en: 'Tyn Church and Old Town Hall', ru: 'Тынский храм и Староместская ратуша' },
        ],
        itinerary: [
          { time: '10:00', titleEn: 'Old Town Square', titleRu: 'Староместская площадь', descEn: 'Meet your guide and explore the historic heart of Prague', descRu: 'Встреча с гидом и знакомство с историческим центром Праги' },
          { time: '10:45', titleEn: 'Medieval Streets', titleRu: 'Средневековые улицы', descEn: 'Wander through hidden courtyards and passages', descRu: 'Прогулка по скрытым дворикам и пассажам' },
          { time: '11:30', titleEn: 'Charles Bridge', titleRu: 'Карлов мост', descEn: 'Cross the legendary bridge with stories of its saints', descRu: 'Переход через легендарный мост с историями о его святых' },
          { time: '12:30', titleEn: 'Bridge Tower', titleRu: 'Мостовая башня', descEn: 'Final views and photo opportunities', descRu: 'Финальные виды и возможности для фото' },
        ],
        included: [
          { en: 'Licensed English/Russian-speaking guide', ru: 'Лицензированный гид на русском языке' },
          { en: 'Private tour — just your group', ru: 'Приватная экскурсия — только ваша группа' },
          { en: 'Complimentary water bottle', ru: 'Бутылка воды в подарок' },
        ],
        excluded: [
          { en: 'Entrance fees (not required for the route)', ru: 'Входные билеты (не требуются по маршруту)' },
          { en: 'Food and drinks', ru: 'Еда и напитки' },
          { en: 'Transportation', ru: 'Транспорт' },
        ],
        faq: [
          { qEn: 'Is this tour suitable for children?', qRu: 'Подходит ли экскурсия для детей?', aEn: 'Absolutely! We adjust the pace and content for families with children of all ages.', aRu: 'Безусловно! Мы адаптируем темп и содержание для семей с детьми любого возраста.' },
          { qEn: 'What happens in bad weather?', qRu: 'Что происходит в плохую погоду?', aEn: 'The tour runs rain or shine. We recommend comfortable walking shoes and weather-appropriate clothing.', aRu: 'Экскурсия проводится в любую погоду. Рекомендуем удобную обувь и одежду по погоде.' },
        ],
      },
      // Tour 2: Prague Castle and Lesser Town (EN+RU)
      {
        en: {
          title: 'Prague Castle and Lesser Town',
          slug: 'prague-castle-lesser-town',
          excerpt: 'Walking tour of the left bank: St. Vitus Cathedral, Castle grounds, Golden Lane, Royal Garden, and descent through Lesser Town.',
          description: richText('Explore the majestic Prague Castle complex, the largest ancient castle in the world. This 3-hour private tour takes you through the stunning St. Vitus Cathedral, along the charming Golden Lane, through the Royal Garden, and down through the picturesque Lesser Town with its baroque architecture and hidden gems.'),
        },
        ru: {
          title: 'Пражский Град и Градчаны',
          slug: 'prazhskij-grad-i-gradchany',
          excerpt: 'Пешеходная экскурсия по левому берегу: Собор Святого Вита, Злата уличка, сады, спуск по Нерудовой улице.',
          description: richText('Исследуйте величественный Пражский Град — крупнейший древний замковый комплекс в мире. Эта трёхчасовая приватная экскурсия проведёт вас через потрясающий Собор Святого Вита, по очаровательной Златой уличке, через Королевский сад и вниз через живописную Малую Страну с её барочной архитектурой и скрытыми жемчужинами.'),
        },
        category: 'prague-tours',
        subcategory: 'sightseeing',
        duration: 3,
        groupPrice: 149,
        publishedLocales: ['en', 'ru'],
        heroImage: mediaIds[1],
        gallery: [mediaIds[0], mediaIds[6]],
        tags: ['best-seller', 'top-rated', 'free-cancel'],
        difficulty: 'moderate',
        rating: 4.9,
        reviewCount: 38,
        sortOrder: 2,
        meetingPoint: { address: 'Prague Castle main entrance, Hradcanske namesti', lat: 50.0909, lng: 14.3986, instructions: 'Meet at the main gate of Prague Castle (Hradcanske namesti).' },
        meetingPointRu: { address: 'Главный вход в Пражский Град, Градчанская площадь', instructions: 'Встречаемся у главных ворот Пражского Града (Градчанская площадь).' },
        highlights: [
          { en: 'St. Vitus Cathedral', ru: 'Собор Святого Вита' },
          { en: 'Golden Lane', ru: 'Злата уличка' },
          { en: 'Panoramic views of Prague', ru: 'Панорамные виды на Прагу' },
          { en: 'Lesser Town baroque architecture', ru: 'Барочная архитектура Малой Страны' },
        ],
        itinerary: [
          { time: '10:00', titleEn: 'Prague Castle', titleRu: 'Пражский Град', descEn: 'Explore the castle grounds and courtyards', descRu: 'Исследуем территорию и дворы Града' },
          { time: '10:45', titleEn: 'St. Vitus Cathedral', titleRu: 'Собор Святого Вита', descEn: 'Marvel at the Gothic masterpiece', descRu: 'Восхищаемся готическим шедевром' },
          { time: '11:15', titleEn: 'Golden Lane', titleRu: 'Злата уличка', descEn: 'Walk through the charming medieval houses', descRu: 'Прогулка по очаровательным средневековым домикам' },
          { time: '12:00', titleEn: 'Descent to Lesser Town', titleRu: 'Спуск на Малую Страну', descEn: 'Scenic walk down through baroque streets', descRu: 'Живописный спуск по барочным улицам' },
        ],
        included: [
          { en: 'Licensed English/Russian-speaking guide', ru: 'Лицензированный гид на русском языке' },
          { en: 'Private tour — just your group', ru: 'Приватная экскурсия — только ваша группа' },
        ],
        excluded: [
          { en: 'Castle entrance tickets (optional, ~350 CZK)', ru: 'Входные билеты в Град (по желанию, ~350 CZK)' },
          { en: 'Food and drinks', ru: 'Еда и напитки' },
        ],
        faq: [
          { qEn: 'Do we need tickets for Prague Castle?', qRu: 'Нужны ли билеты в Пражский Град?', aEn: 'The castle grounds are free. Interior tickets are optional and can be purchased on site.', aRu: 'Территория Града бесплатна. Билеты в интерьеры по желанию, можно купить на месте.' },
        ],
      },
      // Tour 3: Best of Prague Car Tour (EN+RU)
      {
        en: {
          title: 'Best of Prague: Car and Walking Tour',
          slug: 'best-of-prague-car-tour',
          excerpt: 'Combination driving and walking tour covering both banks and extended areas not reachable on foot in a single day.',
          description: richText('See the best of Prague in just 4 hours with this unique combination of driving and walking. Your private guide and driver take you through both banks of the Vltava, including areas that walking tours can\'t reach. Perfect for those with limited time or mobility, this tour covers Prague Castle, Old Town, Vysehrad, and hidden neighborhoods — all in comfort.'),
        },
        ru: {
          title: 'Сити-тур',
          slug: 'siti-tur',
          excerpt: 'Обзорная экскурсия на автомобиле с пешими прогулками по обоим берегам Влтавы и отдалённым районам города.',
          description: richText('Увидьте лучшее в Праге всего за 4 часа с этой уникальной комбинацией автомобильной и пешеходной экскурсии. Персональный гид и водитель проведут вас по обоим берегам Влтавы, включая места, недоступные пешим маршрутам. Идеально для тех, у кого ограничено время — Пражский Град, Старый город, Вышеград и скрытые кварталы в комфорте.'),
        },
        category: 'prague-tours',
        subcategory: 'sightseeing',
        duration: 4,
        groupPrice: 199,
        publishedLocales: ['en', 'ru'],
        heroImage: mediaIds[2],
        gallery: [mediaIds[1], mediaIds[3]],
        tags: ['top-rated', 'free-cancel', 'accessible', 'transport'],
        difficulty: 'easy',
        rating: 5.0,
        reviewCount: 23,
        sortOrder: 3,
        meetingPoint: { address: 'Your hotel or any location in Prague center', lat: 50.0755, lng: 14.4378, instructions: 'Hotel pickup included. Please provide your hotel address when booking.' },
        meetingPointRu: { address: 'Ваш отель или любое место в центре Праги', instructions: 'Трансфер от отеля включён. Пожалуйста, укажите адрес отеля при бронировании.' },
        highlights: [
          { en: 'Private car with professional driver', ru: 'Личный автомобиль с профессиональным водителем' },
          { en: 'Both banks of the Vltava', ru: 'Оба берега Влтавы' },
          { en: 'Hotel pickup and drop-off', ru: 'Трансфер от отеля и обратно' },
          { en: 'Areas unreachable on foot tours', ru: 'Места, недоступные пешеходным маршрутам' },
        ],
        itinerary: [
          { time: '10:00', titleEn: 'Hotel Pickup', titleRu: 'Трансфер от отеля', descEn: 'Your driver picks you up at your hotel', descRu: 'Водитель забирает вас у отеля' },
          { time: '10:15', titleEn: 'Prague Castle', titleRu: 'Пражский Град', descEn: 'Walking tour of the castle complex', descRu: 'Пешеходная часть по территории Града' },
          { time: '11:15', titleEn: 'Driving tour', titleRu: 'Автомобильная часть', descEn: 'Scenic drive through Mala Strana and New Town', descRu: 'Живописная поездка через Малую Страну и Новый город' },
          { time: '12:00', titleEn: 'Old Town walk', titleRu: 'Пешеходная часть', descEn: 'Walking through Old Town and Charles Bridge', descRu: 'Прогулка по Старому городу и Карлову мосту' },
          { time: '13:30', titleEn: 'Return', titleRu: 'Возвращение', descEn: 'Drop-off at your hotel', descRu: 'Высадка у отеля' },
        ],
        included: [
          { en: 'Licensed English/Russian-speaking guide', ru: 'Лицензированный гид на русском языке' },
          { en: 'Private car with driver', ru: 'Автомобиль с водителем' },
          { en: 'Hotel pickup and drop-off', ru: 'Трансфер от отеля и обратно' },
          { en: 'Water and snacks', ru: 'Вода и лёгкие закуски' },
        ],
        excluded: [
          { en: 'Entrance fees', ru: 'Входные билеты' },
          { en: 'Lunch', ru: 'Обед' },
        ],
        faq: [
          { qEn: 'What type of car is used?', qRu: 'Какой автомобиль используется?', aEn: 'A comfortable sedan or minivan depending on group size.', aRu: 'Комфортабельный седан или минивэн в зависимости от размера группы.' },
        ],
      },
    ]

    // RU-only tours (tours 4-21)
    const ruOnlyTours = [
      { title: 'Прага глазами местного жителя', slug: 'praga-glazami-mestnogo', excerpt: 'Обзорная пешеходная экскурсия по туристическим и нетуристическим местам Праги', desc: 'Увидьте Прагу такой, какой её знают местные жители. Эта экскурсия откроет вам не только знаменитые достопримечательности, но и скрытые уголки, о которых не пишут в путеводителях. Ваш гид — старожил Праги — покажет любимые места и расскажет реальные истории из жизни города.', category: 'prague-tours', subcategory: 'sightseeing', duration: 3, price: 119, sortOrder: 4, difficulty: 'easy', tags: ['hidden-gem', 'free-cancel'], rating: 4.8, reviews: 31 },
      { title: 'Новый город', slug: 'novyj-gorod', excerpt: 'Вацлавская площадь, Танцующий дом, набережная Влтавы', desc: 'Откройте для себя Новый город Праги — район, полный контрастов: от готических храмов до модернистских зданий. Вацлавская площадь, Танцующий дом, набережная Влтавы и уютные кафе на каждом углу.', category: 'prague-tours', subcategory: 'sightseeing', duration: 2, price: 99, sortOrder: 5, difficulty: 'easy', tags: ['free-cancel'], rating: 4.7, reviews: 15 },
      { title: 'Круиз по Влтаве', slug: 'kruiz-po-vltave', excerpt: 'Речной круиз по Влтаве с видами на Пражский Град, Карлов мост и набережные', desc: 'Насладитесь Прагой с воды! Речной круиз по Влтаве откроет потрясающие виды на Пражский Град, Карлов мост, Национальный театр и живописные набережные. Идеальное дополнение к пешеходным экскурсиям.', category: 'prague-tours', subcategory: 'sightseeing', duration: 2, price: 99, sortOrder: 6, difficulty: 'easy', tags: ['family-friendly', 'accessible'], rating: 4.8, reviews: 22 },
      { title: 'Пражская Венеция', slug: 'prazhskaya-venetsiya', excerpt: 'Прогулка на лодке по каналу Чертовка — самому романтичному месту Праги', desc: 'Канал Чертовка — это «Пражская Венеция», одно из самых романтичных мест города. Прогулка на лодке по узкому каналу среди старинных мельниц и под низкими мостиками оставит незабываемые впечатления.', category: 'prague-tours', subcategory: 'sightseeing', duration: 1.5, price: 89, sortOrder: 7, difficulty: 'easy', tags: ['hidden-gem'], rating: 4.9, reviews: 18 },
      { title: 'Вечерняя на теплоходе Легенды Праги', slug: 'vechernyaya-legendy-pragi', excerpt: 'Вечерний круиз с рассказами о легендах и тайнах Праги', desc: 'Вечерний круиз по Влтаве — когда Прага загорается тысячами огней, а гид рассказывает захватывающие легенды и тайны города. Романтическая атмосфера, великолепные виды и истории, которые не забудете.', category: 'prague-tours', subcategory: 'sightseeing', duration: 2, price: 119, sortOrder: 8, difficulty: 'easy', tags: ['top-rated'], rating: 4.9, reviews: 27 },
      { title: 'Мистическая Прага', slug: 'misticheskaya-praga', excerpt: 'Вечерняя тематическая экскурсия: легенды, призраки, алхимики Праги', desc: 'Когда солнце садится, Прага раскрывает свои тайны. Эта вечерняя экскурсия проведёт вас по мистическим местам города: от алхимических лабораторий до домов с призраками. Услышите леденящие кровь легенды и увидите Прагу, которую скрывает дневной свет.', category: 'prague-tours', subcategory: 'sightseeing', duration: 2, price: 119, sortOrder: 9, difficulty: 'easy', tags: ['hidden-gem'], rating: 4.8, reviews: 19 },
      { title: 'Еврейский квартал', slug: 'evrejskij-kvartal', excerpt: 'Синагоги, Старое кладбище, легенда о Големе, мир Кафки', desc: 'Еврейский квартал Праги — Йозефов — одно из самых мистических и исторически значимых мест в Европе. Древние синагоги, Старое кладбище, легенда о Големе раввина Лёва и мир Франца Кафки оживут в рассказах вашего гида.', category: 'prague-tours', subcategory: 'sightseeing', duration: 2.5, price: 109, sortOrder: 10, difficulty: 'easy', tags: ['top-rated', 'free-cancel'], rating: 4.9, reviews: 25 },
      { title: 'Вышеград', slug: 'vysehrad', excerpt: 'Крепость, легенда о Либуше, кладбище знаменитостей', desc: 'Вышеград — древняя крепость на скале над Влтавой, откуда, по легенде, княгиня Либуше предсказала великое будущее Праги. Базилика, кладбище, где покоятся Дворжак и Сметана, и потрясающие виды на город.', category: 'prague-tours', subcategory: 'sightseeing', duration: 2, price: 99, sortOrder: 11, difficulty: 'moderate', tags: ['hidden-gem', 'free-cancel'], rating: 4.7, reviews: 12 },
      { title: 'Голливуд Восточной Европы — Баррандов', slug: 'gollivud-barrandov', excerpt: 'Посещение легендарной киностудии Баррандов с экскурсией', desc: 'Баррандов — знаменитая пражская киностудия, где снимались голливудские блокбастеры. Уникальная возможность заглянуть за кулисы кинопроизводства, увидеть декорации и узнать историю чешского и мирового кинематографа.', category: 'prague-tours', subcategory: 'sightseeing', duration: 4, price: 179, sortOrder: 12, difficulty: 'easy', tags: ['transport'], rating: 4.8, reviews: 9 },
      { title: 'Чёрный театр — театр Теней', slug: 'chernyj-teatr', excerpt: 'Организация посещения знаменитого чёрного театра теней в Праге', desc: 'Чёрный театр теней — уникальное пражское искусство, которое не имеет аналогов в мире. Мы организуем посещение лучшего представления с пояснениями гида.', category: 'prague-tours', subcategory: 'sightseeing', duration: 2, price: 89, sortOrder: 13, difficulty: 'easy', tags: ['family-friendly'], rating: 4.6, reviews: 8 },
      { title: 'Онлайн-экскурсия по Праге', slug: 'onlajn-ekskursiya', excerpt: 'Виртуальная экскурсия по Праге — идеально для подготовки к поездке', desc: 'Не выходя из дома, совершите виртуальное путешествие по Праге. Идеально для подготовки к поездке: узнаете, что обязательно нужно увидеть, где лучше поесть и как избежать туристических ловушек.', category: 'prague-tours', subcategory: 'sightseeing', duration: 1.5, price: 49, sortOrder: 14, difficulty: 'easy', tags: ['accessible'], rating: 4.5, reviews: 6 },
      // Beer and Food
      { title: 'Пивной тур', slug: 'pivnoj-tur', excerpt: 'Крафтовые пивоварни, дегустации чешского пива — от монастырских традиций до современных микропивоварен', desc: 'Чешское пиво — мировое наследие. Этот гастрономический тур проведёт вас по лучшим крафтовым пивоварням Праги: от монастырских традиций до современных микропивоварен. Дегустации, истории и секреты чешского пивоварения.', category: 'prague-tours', subcategory: 'beer-and-food', duration: 3.5, price: 139, sortOrder: 15, difficulty: 'easy', tags: ['best-seller'], rating: 4.9, reviews: 35 },
      { title: 'Средневековое шоу (ужин У Паука)', slug: 'srednevekovoe-shou', excerpt: 'Ресторан с историческим средневековым представлением', desc: 'Погрузитесь в атмосферу средневековой Праги! Ужин в ресторане «У Паука» с живым средневековым представлением: фехтовальщики, жонглёры, огненное шоу и традиционная чешская кухня.', category: 'prague-tours', subcategory: 'beer-and-food', duration: 3, price: 79, sortOrder: 16, difficulty: 'easy', tags: ['family-friendly'], rating: 4.7, reviews: 14 },
      { title: 'Фольклорный вечер', slug: 'folklornyj-vecher', excerpt: 'Традиционный чешский вечер с национальной кухней и живой музыкой', desc: 'Проведите незабываемый вечер в традиционном чешском ресторане с живой фольклорной музыкой, национальными танцами и аутентичной кухней. Полное погружение в чешскую культуру.', category: 'prague-tours', subcategory: 'beer-and-food', duration: 3, price: 119, sortOrder: 17, difficulty: 'easy', tags: [], rating: 4.6, reviews: 11 },
      // From Prague
      { title: 'Чески-Крумлов', slug: 'chesky-krumlov', excerpt: 'ЮНЕСКО, замок, средневековый город, обед у реки, живописная дорога', desc: 'Чески-Крумлов — жемчужина Южной Чехии и объект ЮНЕСКО. Средневековый замок, извилистые улочки, обед на берегу реки и живописная дорога через чешскую деревню. Полный день незабываемых впечатлений.', category: 'from-prague', subcategory: undefined, duration: 10, price: 299, sortOrder: 18, difficulty: 'easy', tags: ['top-rated', 'transport', 'free-cancel'], rating: 5.0, reviews: 29 },
      { title: 'Кутна Гора', slug: 'kutna-gora', excerpt: 'Костница, Собор Святой Варвары, средневековый центр города', desc: 'Кутна Гора — город серебра и костей. Знаменитая Костница (Седлецкий оссуарий), величественный Собор Святой Варвары и средневековый центр города с богатой историей горнодобычи.', category: 'from-prague', subcategory: undefined, duration: 7, price: 249, sortOrder: 19, difficulty: 'easy', tags: ['transport', 'free-cancel'], rating: 4.8, reviews: 17 },
      { title: 'Дрезден + Саксонская Швейцария', slug: 'drezden-saksonskaya-shvejtsariya', excerpt: 'Цвингер, Фрауэнкирхе, Зелёные своды + природный парк Саксонская Швейцария', desc: 'Два путешествия за один день: Дрезден — «Флоренция на Эльбе» с Цвингером, Фрауэнкирхе и Зелёными сводами, и Саксонская Швейцария — природный парк с фантастическими скальными формациями.', category: 'from-prague', subcategory: undefined, duration: 10, price: 349, sortOrder: 20, difficulty: 'moderate', tags: ['transport'], rating: 4.9, reviews: 13 },
      { title: 'Вена', slug: 'vena', excerpt: 'Столица Австрии — дворцы, исторический центр, имперская архитектура', desc: 'Однодневная экскурсия в столицу Австрии. Шёнбрунн, Хофбург, Собор Святого Стефана, Рингштрассе и знаменитые венские кафе. Погружение в имперскую атмосферу одной из красивейших столиц Европы.', category: 'from-prague', subcategory: undefined, duration: 12, price: 399, sortOrder: 21, difficulty: 'easy', tags: ['transport'], rating: 4.8, reviews: 8 },
    ]

    // Create the 3 bilingual tours
    for (const tour of tours) {
      const heroImg = tour.heroImage
      const galleryItems = tour.gallery.map((imgId: number) => ({ image: imgId }))

      const created = await payload.create({
        collection: 'tours',
        locale: 'en',
        data: {
          title: tour.en.title,
          slug: tour.en.slug,
          excerpt: tour.en.excerpt,
          description: tour.en.description as unknown as Record<string, unknown>,
          category: tour.category,
          subcategory: tour.subcategory,
          duration: tour.duration,
          groupPrice: tour.groupPrice,
          publishedLocales: tour.publishedLocales,
          heroImage: heroImg,
          gallery: galleryItems,
          status: 'published',
          sortOrder: tour.sortOrder,
          rating: tour.rating,
          reviewCount: tour.reviewCount,
          tags: tour.tags,
          difficulty: tour.difficulty,
          meetingPoint: tour.meetingPoint,
          highlights: tour.highlights.map((h: { en: string }) => ({ text: h.en })),
          itinerary: tour.itinerary.map((i: { time: string; titleEn: string; descEn: string }) => ({ time: i.time, title: i.titleEn, description: i.descEn })),
          included: tour.included.map((i: { en: string }) => ({ text: i.en })),
          excluded: tour.excluded.map((i: { en: string }) => ({ text: i.en })),
          faq: tour.faq.map((f: { qEn: string; aEn: string }) => ({ question: f.qEn, answer: f.aEn })),
          _status: 'published',
        },
      })

      // Update RU locale
      await payload.update({
        collection: 'tours',
        id: created.id,
        locale: 'ru',
        data: {
          title: tour.ru.title,
          slug: tour.ru.slug,
          excerpt: tour.ru.excerpt,
          description: tour.ru.description as unknown as Record<string, unknown>,
          meetingPoint: {
            ...tour.meetingPoint,
            address: tour.meetingPointRu.address,
            instructions: tour.meetingPointRu.instructions,
          },
          highlights: tour.highlights.map((h: { ru: string }) => ({ text: h.ru })),
          itinerary: tour.itinerary.map((i: { time: string; titleRu: string; descRu: string }) => ({ time: i.time, title: i.titleRu, description: i.descRu })),
          included: tour.included.map((i: { ru: string }) => ({ text: i.ru })),
          excluded: tour.excluded.map((i: { ru: string }) => ({ text: i.ru })),
          faq: tour.faq.map((f: { qRu: string; aRu: string }) => ({ question: f.qRu, answer: f.aRu })),
        },
      })

      results.push(`Created bilingual tour: ${tour.en.title} / ${tour.ru.title} (ID: ${created.id})`)
    }

    // Create RU-only tours
    // Cycle through available media for hero images
    for (let i = 0; i < ruOnlyTours.length; i++) {
      const tour = ruOnlyTours[i]
      const heroImg = mediaIds[i % mediaIds.length]
      const galleryImg1 = mediaIds[(i + 1) % mediaIds.length]
      const galleryImg2 = mediaIds[(i + 2) % mediaIds.length]

      const created = await payload.create({
        collection: 'tours',
        locale: 'ru',
        data: {
          title: tour.title,
          slug: tour.slug,
          excerpt: tour.excerpt,
          description: richText(tour.desc) as unknown as Record<string, unknown>,
          category: tour.category,
          subcategory: tour.subcategory,
          duration: tour.duration,
          groupPrice: tour.price,
          publishedLocales: ['ru'],
          heroImage: heroImg,
          gallery: [{ image: galleryImg1 }, { image: galleryImg2 }],
          status: 'published',
          sortOrder: tour.sortOrder,
          rating: tour.rating,
          reviewCount: tour.reviews,
          tags: tour.tags,
          difficulty: tour.difficulty,
          _status: 'published',
        },
      })

      // Set EN fallback title/slug so admin can identify it
      await payload.update({
        collection: 'tours',
        id: created.id,
        locale: 'en',
        data: {
          title: tour.title, // Keep Russian name in EN for admin reference
          slug: tour.slug,
          excerpt: tour.excerpt,
          description: richText(tour.desc) as unknown as Record<string, unknown>,
        },
      })

      results.push(`Created RU-only tour: ${tour.title} (ID: ${created.id})`)
    }

    // Create some reviews
    const reviews = [
      { tour: 1, name: 'James M.', country: 'United Kingdom', rating: 5, title: 'Absolutely wonderful!', body: 'Uliana was an amazing guide. Her knowledge of Prague\'s history and hidden spots made this tour unforgettable. Highly recommend!', language: 'en', featured: true },
      { tour: 1, name: 'Sarah K.', country: 'United States', rating: 5, title: 'Best tour in Prague', body: 'We\'ve done many tours in Europe, but this was by far the best. Private, personalized, and full of fascinating stories.', language: 'en', featured: true },
      { tour: 2, name: 'Robert L.', country: 'Canada', rating: 5, title: 'Perfect private tour', body: 'The Prague Castle tour was perfectly organized. Our guide knew every corner and shared stories you won\'t find in any guidebook.', language: 'en', featured: true },
      { tour: 1, name: 'Мария К.', country: 'Россия', rating: 5, title: 'Потрясающая экскурсия!', body: 'Улиана — невероятный гид! Три часа пролетели незаметно. Узнали столько интересного о Праге, что в путеводителях не прочитаешь.', language: 'ru', featured: true },
      { tour: 2, name: 'Андрей В.', country: 'Россия', rating: 5, title: 'Лучший гид в Праге', body: 'Экскурсия в Пражский Град превзошла все ожидания. Улиана знает каждый камень и рассказывает так, что не хочется уходить.', language: 'ru', featured: true },
      { tour: 3, name: 'Елена С.', country: 'Россия', rating: 5, title: 'Идеальный сити-тур!', body: 'Замечательная экскурсия на автомобиле. За 4 часа увидели всю Прагу, включая места, куда бы сами не добрались. Очень рекомендую!', language: 'ru', featured: true },
      { tour: 1, name: 'David H.', country: 'Australia', rating: 4, title: 'Great experience', body: 'Really enjoyed the walking tour through Old Town. Our guide was knowledgeable and friendly. Would have loved it to be a bit longer!', language: 'en', featured: false },
      { tour: 3, name: 'Ольга П.', country: 'Россия', rating: 5, title: 'Вся Прага за один день', body: 'Брали сити-тур с детьми — идеальный формат. Не устали, увидели всё самое важное, гид прекрасно ладит с детьми.', language: 'ru', featured: true },
    ]

    // Get all tour IDs
    const allTours = await payload.find({ collection: 'tours', limit: 100 })
    const tourIds = allTours.docs.map(t => t.id)

    for (const review of reviews) {
      const tourId = tourIds[review.tour - 1]
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
      message: `Seeded ${tours.length + ruOnlyTours.length} tours, ${reviews.length} reviews, site settings`,
      results,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({ error: message, stack, results }, { status: 500 })
  }
}
