import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST() {
  try {
    const payload = await getPayload({ config })

    // ─── Seed SiteSettings ───
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'en',
      data: {
        siteName: 'Best Prague Guide',
        tagline: 'Private tours in Prague from a team of licensed guides',
        contactEmail: 'info@bestpragueguide.com',
        contactPhone: '+420776306858',
        contactPhoneDisplay: '+420 776 306 858',
        whatsappNumber: '420776306858',
        whatsappMessageTemplate: "Hi! I'd like to learn about your tours.",
        whatsappTourMessageTemplate: 'Hi! I\'m interested in the "{tourName}" tour.',
        telegramHandle: 'bestpragueguide',
        instagramHandle: 'bestpragueguide',
        businessHours: '09:00–20:00 CET',
        socialLinks: {
          instagramUrl: 'https://instagram.com/bestpragueguide',
        },
        mapCoordinates: { lat: 50.0875, lng: 14.4213 },
        licenseText: 'Licensed Guide, Czech Guide Association',
        copyrightText: '© {year} Best Prague Guide. All rights reserved.',
      },
    })
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'ru',
      data: {
        tagline: 'Индивидуальные экскурсии по Праге от команды лицензированных гидов',
        whatsappMessageTemplate: 'Здравствуйте! Я хотел(а) бы узнать об экскурсиях.',
        whatsappTourMessageTemplate: 'Здравствуйте! Меня интересует экскурсия "{tourName}".',
        licenseText: 'Лицензированный гид, Ассоциация гидов Чехии',
        copyrightText: '© {year} Best Prague Guide. Все права защищены.',
      },
    })

    // ─── Seed Navigation ───
    await payload.updateGlobal({
      slug: 'navigation',
      locale: 'en',
      data: {
        headerLinks: [
          { label: 'Tours', href: '/tours' },
          { label: 'About Us', href: '/about' },
          { label: 'Reviews', href: '/reviews' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contact', href: '/contact' },
        ],
        headerCta: { label: 'Choose a Tour', href: '/tours' },
        footerColumns: [
          {
            title: 'Tours',
            links: [{ label: 'Tours', href: '/tours' }],
          },
          {
            title: 'Company',
            links: [
              { label: 'About Us', href: '/about' },
              { label: 'Reviews', href: '/reviews' },
              { label: 'Contact', href: '/contact' },
              { label: 'FAQ', href: '/faq' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cancellation Policy', href: '/cancellation-policy' },
            ],
          },
        ],
        footerLicense: 'Licensed Guide, Czech Guide Association',
        footerCopyright: '© {year} Best Prague Guide. All rights reserved.',
      },
    })
    await payload.updateGlobal({
      slug: 'navigation',
      locale: 'ru',
      data: {
        headerLinks: [
          { label: 'Экскурсии', href: '/tours' },
          { label: 'О нас', href: '/about' },
          { label: 'Отзывы', href: '/reviews' },
          { label: 'Блог', href: '/blog' },
          { label: 'Контакты', href: '/contact' },
        ],
        headerCta: { label: 'Выбрать экскурсию', href: '/tours' },
        footerColumns: [
          {
            title: 'Экскурсии',
            links: [{ label: 'Экскурсии', href: '/tours' }],
          },
          {
            title: 'Компания',
            links: [
              { label: 'О нас', href: '/about' },
              { label: 'Отзывы', href: '/reviews' },
              { label: 'Контакты', href: '/contact' },
              { label: 'FAQ', href: '/faq' },
            ],
          },
          {
            title: 'Юридическое',
            links: [
              { label: 'Политика конфиденциальности', href: '/privacy' },
              { label: 'Условия использования', href: '/terms' },
              { label: 'Условия отмены', href: '/cancellation-policy' },
            ],
          },
        ],
        footerLicense: 'Лицензированный гид, Ассоциация гидов Чехии',
        footerCopyright: '© {year} Best Prague Guide. Все права защищены.',
      },
    })

    // ─── Seed Homepage ───
    await payload.updateGlobal({
      slug: 'homepage',
      locale: 'en',
      data: {
        heroTagline: 'Discover the Prague Tourists Never See',
        heroSubtitle: 'Private tours from a guide with 17 years of experience. Just your group — no strangers.',
        heroCta: 'Explore Tours',
        heroCtaHref: '/tours',
        trustBarItems: [
          { icon: 'experience', text: '17 Years Experience' },
          { icon: 'guests', text: '10,000+ Happy Guests' },
          { icon: 'licensed', text: 'Team of Licensed Guides' },
          { icon: 'curated', text: 'Every Tour Curated by Founder' },
        ],
        guideHeading: 'Meet Your Guide',
        guideBio: 'Uliana Formina has been sharing her passion for Prague for over 17 years. As a highest-category licensed guide and founder of Best Prague Guide, she personally curates every tour route and hand-picks each guide on her team.',
        guideLearnMore: 'Learn More About Us',
        guideLearnMoreHref: '/about',
        categoriesHeading: 'All Tours',
        categories: [
          { label: 'Prague Tours', href: '/tours?category=prague-tours' },
          { label: 'From Prague', href: '/tours?category=from-prague' },
        ],
        processHeading: 'How It Works',
        processSteps: [
          { icon: 'form', title: 'Submit a Request', description: 'Choose a tour and tell us your preferred date and group size.' },
          { icon: 'check', title: 'We Confirm', description: 'We check availability and confirm within 2 hours.' },
          { icon: 'card', title: 'Pay Securely', description: 'After confirmation, pay online via a secure payment link.' },
          { icon: 'pin', title: 'Enjoy Your Tour', description: 'Meet your guide and discover Prague like a local.' },
        ],
        testimonialsHeading: 'What Our Guests Say',
        faqSectionHeading: 'Frequently Asked Questions',
        ctaHeading: 'Ready to Explore Prague?',
        ctaSubtitle: 'Book your private tour today',
        ctaButtonLabel: 'Choose a Tour',
        ctaButtonHref: '/tours',
        ctaWhatsappLabel: 'WhatsApp Us',
      },
    })
    await payload.updateGlobal({
      slug: 'homepage',
      locale: 'ru',
      data: {
        heroTagline: 'Откройте Прагу, которую не видят туристы',
        heroSubtitle: 'Индивидуальные экскурсии от гида с 17-летним опытом. Только ваша группа — никаких посторонних.',
        heroCta: 'Смотреть экскурсии',
        trustBarItems: [
          { icon: 'experience', text: '17 лет опыта' },
          { icon: 'guests', text: '10 000+ довольных гостей' },
          { icon: 'licensed', text: 'Команда лицензированных гидов' },
          { icon: 'curated', text: 'Каждая экскурсия создана основателем' },
        ],
        guideHeading: 'Ваш гид',
        guideBio: 'Ульяна Формина делится своей любовью к Праге уже более 17 лет. Как лицензированный гид высшей категории и основатель Best Prague Guide, она лично разрабатывает каждый маршрут и подбирает каждого гида в команду.',
        guideLearnMore: 'Подробнее о нас',
        categoriesHeading: 'Все экскурсии',
        categories: [
          { label: 'Экскурсии по Праге', href: '/tours?category=prague-tours' },
          { label: 'Из Праги', href: '/tours?category=from-prague' },
        ],
        processHeading: 'Как это работает',
        processSteps: [
          { icon: 'form', title: 'Отправьте запрос', description: 'Выберите экскурсию и укажите дату и размер группы.' },
          { icon: 'check', title: 'Мы подтвердим', description: 'Проверим доступность и подтвердим в течение 2 часов.' },
          { icon: 'card', title: 'Оплатите онлайн', description: 'После подтверждения оплатите по безопасной ссылке.' },
          { icon: 'pin', title: 'Наслаждайтесь экскурсией', description: 'Встретьтесь с гидом и откройте Прагу как местный житель.' },
        ],
        testimonialsHeading: 'Отзывы наших гостей',
        faqSectionHeading: 'Часто задаваемые вопросы',
        ctaHeading: 'Готовы исследовать Прагу?',
        ctaSubtitle: 'Забронируйте вашу индивидуальную экскурсию сегодня',
        ctaButtonLabel: 'Выбрать экскурсию',
        ctaWhatsappLabel: 'Написать в WhatsApp',
      },
    })

    // ─── Seed AboutPage ───
    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'en',
      data: {
        founderHeading: 'Founder and Lead Guide',
        founderBio: 'For over 17 years, Uliana Formina has been sharing her deep love for Prague with travelers from around the world. As a highest-category licensed guide and member of the Czech Guide Association, she has welcomed more than 10,000 guests to the city\'s hidden corners and iconic landmarks.',
        founderQuote: 'I built this company to deliver tour quality as if I personally led every single one.',
        stats: [
          { value: '17+', label: 'years experience' },
          { value: '10,000+', label: 'happy guests' },
          { value: 'EN + RU', label: 'tour languages' },
        ],
        teamHeading: 'Our Team of Licensed Guides',
        teamDescription: 'Every guide on our team is personally selected and trained by Uliana. All hold official licenses from the Czech Guide Association and undergo regular quality reviews.',
        teamBadges: [
          { text: 'All Licensed' },
          { text: 'Personally Selected by Founder' },
          { text: 'Regular Training and QC' },
        ],
        valuesHeading: 'Our Values',
        values: [
          { title: 'Private Tours Only', description: 'No group buses. Every tour is exclusive to you.' },
          { title: 'Every Tour Curated', description: 'Each route personally designed by our founder.' },
          { title: 'Licensed Guides', description: 'Official Czech Guide Association certification.' },
          { title: 'Routes Tailored to You', description: 'We adapt every tour to your interests and pace.' },
        ],
        ctaPrimaryLabel: 'Choose a Tour',
        ctaPrimaryHref: '/tours',
        ctaSecondaryLabel: 'Contact Us',
        ctaSecondaryHref: '/contact',
      },
    })
    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'ru',
      data: {
        founderHeading: 'Основатель и ведущий гид',
        founderBio: 'Более 17 лет Ульяна Формина делится своей глубокой любовью к Праге с путешественниками со всего мира. Как лицензированный гид высшей категории и член Ассоциации гидов Чехии, она приняла более 10 000 гостей, показав им скрытые уголки и знаковые достопримечательности города.',
        founderQuote: 'Я создала эту компанию, чтобы обеспечить качество экскурсий, как если бы я лично вела каждую из них.',
        stats: [
          { value: '17+', label: 'лет опыта' },
          { value: '10,000+', label: 'довольных гостей' },
          { value: 'EN + RU', label: 'языки экскурсий' },
        ],
        teamHeading: 'Наша команда лицензированных гидов',
        teamDescription: 'Каждый гид в нашей команде лично отобран и обучен Ульяной. Все имеют официальные лицензии Ассоциации гидов Чехии и регулярно проходят проверку качества.',
        teamBadges: [
          { text: 'Все лицензированы' },
          { text: 'Лично отобраны основателем' },
          { text: 'Регулярное обучение и контроль' },
        ],
        valuesHeading: 'Наши ценности',
        values: [
          { title: 'Только индивидуальные экскурсии', description: 'Никаких автобусных групп. Каждая экскурсия — только для вас.' },
          { title: 'Каждая экскурсия авторская', description: 'Каждый маршрут лично разработан нашим основателем.' },
          { title: 'Лицензированные гиды', description: 'Официальная сертификация Ассоциации гидов Чехии.' },
          { title: 'Маршруты под вас', description: 'Мы адаптируем каждую экскурсию под ваши интересы и темп.' },
        ],
        ctaPrimaryLabel: 'Выбрать экскурсию',
        ctaSecondaryLabel: 'Связаться с нами',
      },
    })

    // ─── Seed ReviewsPage ───
    await payload.updateGlobal({
      slug: 'reviews-page',
      locale: 'en',
      data: {
        heading: 'Guest Reviews',
        photoGalleryHeading: 'Our Guests in Prague',
      },
    })
    await payload.updateGlobal({
      slug: 'reviews-page',
      locale: 'ru',
      data: {
        heading: 'Отзывы гостей',
        photoGalleryHeading: 'Наши гости в Праге',
      },
    })

    // ─── Seed FAQ items ───
    const faqData = [
      { q_en: 'How do I book a tour?', a_en: 'Choose a tour from our catalog, fill out the booking request form with your preferred date and group size, and we\'ll confirm availability within 2 hours.', q_ru: 'Как забронировать экскурсию?', a_ru: 'Выберите экскурсию из каталога, заполните форму бронирования с указанием даты и размера группы, и мы подтвердим доступность в течение 2 часов.', category: 'booking' as const, sortOrder: 1, showOnHomepage: true },
      { q_en: 'What is the cancellation policy?', a_en: 'Free cancellation up to 24 hours before the tour start time. After that, the full amount is charged.', q_ru: 'Какова политика отмены?', a_ru: 'Бесплатная отмена за 24 часа до начала экскурсии. После этого взимается полная стоимость.', category: 'booking' as const, sortOrder: 2, showOnHomepage: true },
      { q_en: 'How many people can join a tour?', a_en: 'Our tours are designed for groups of 1–4 people at the base price. Groups of 5–8 are welcome with a 30% surcharge.', q_ru: 'Сколько человек может участвовать в экскурсии?', a_ru: 'Наши экскурсии рассчитаны на группы от 1 до 4 человек по базовой цене. Группы от 5 до 8 человек приветствуются с доплатой 30%.', category: 'booking' as const, sortOrder: 3, showOnHomepage: true },
      { q_en: 'What languages are tours available in?', a_en: 'Our guides speak English and Russian fluently. All tours are available in both languages.', q_ru: 'На каких языках проводятся экскурсии?', a_ru: 'Наши гиды свободно говорят на английском и русском. Все экскурсии доступны на обоих языках.', category: 'tours' as const, sortOrder: 4, showOnHomepage: false },
      { q_en: 'What happens if it rains?', a_en: 'Tours run rain or shine! We recommend comfortable shoes and weather-appropriate clothing. In case of extreme weather, we\'ll contact you to reschedule.', q_ru: 'Что делать, если идёт дождь?', a_ru: 'Экскурсии проводятся в любую погоду! Рекомендуем удобную обувь и одежду по сезону. При экстремальных погодных условиях мы свяжемся с вами для переноса.', category: 'tours' as const, sortOrder: 5, showOnHomepage: true },
      { q_en: 'Do you offer hotel pickup?', a_en: 'We meet at a designated meeting point for each tour. The exact location with a map is sent after booking confirmation.', q_ru: 'Вы забираете из отеля?', a_ru: 'Для каждой экскурсии назначается точка встречи. Точное местоположение с картой высылается после подтверждения бронирования.', category: 'logistics' as const, sortOrder: 6, showOnHomepage: false },
      { q_en: 'How do I pay?', a_en: 'After we confirm your booking, you\'ll receive a secure payment link via email. We accept all major credit cards.', q_ru: 'Как оплатить?', a_ru: 'После подтверждения бронирования вы получите безопасную ссылку для оплаты на email. Мы принимаем все основные банковские карты.', category: 'payment' as const, sortOrder: 7, showOnHomepage: false },
      { q_en: 'Are tours suitable for children?', a_en: 'Yes! Most of our tours are family-friendly. Let us know the ages of your children in the booking form and we\'ll adapt the tour.', q_ru: 'Подходят ли экскурсии для детей?', a_ru: 'Да! Большинство наших экскурсий подходят для семей с детьми. Укажите возраст детей в форме бронирования, и мы адаптируем экскурсию.', category: 'tours' as const, sortOrder: 8, showOnHomepage: true },
      { q_en: 'Can I customize a tour?', a_en: 'Absolutely! Mention your interests in the booking form and we\'ll tailor the route to your preferences.', q_ru: 'Можно ли изменить маршрут?', a_ru: 'Конечно! Укажите ваши интересы в форме бронирования, и мы подстроим маршрут под ваши предпочтения.', category: 'tours' as const, sortOrder: 9, showOnHomepage: true },
      { q_en: 'What should I wear/bring?', a_en: 'Comfortable walking shoes are essential. We recommend bringing water, sunscreen in summer, and warm layers in winter.', q_ru: 'Что надеть / взять с собой?', a_ru: 'Удобная обувь для прогулок обязательна. Рекомендуем взять воду, солнцезащитный крем летом и тёплую одежду зимой.', category: 'logistics' as const, sortOrder: 10, showOnHomepage: false },
    ]

    // Delete existing FAQs
    const existing = await payload.find({ collection: 'faqs', limit: 100 })
    for (const doc of existing.docs) {
      await payload.delete({ collection: 'faqs', id: doc.id })
    }

    // Create new FAQs
    for (const faq of faqData) {
      const doc = await payload.create({
        collection: 'faqs',
        locale: 'en',
        data: {
          question: faq.q_en,
          answer: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: faq.a_en, version: 1 }], version: 1 }], direction: null, format: '', indent: 0, version: 1 } },
          category: faq.category,
          sortOrder: faq.sortOrder,
          status: 'published',
          showOnHomepage: faq.showOnHomepage,
        },
      })
      await payload.update({
        collection: 'faqs',
        id: doc.id,
        locale: 'ru',
        data: {
          question: faq.q_ru,
          answer: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: faq.a_ru, version: 1 }], version: 1 }], direction: null, format: '', indent: 0, version: 1 } },
        },
      })
    }

    return NextResponse.json({ success: true, message: 'CMS data seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
