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
    // Fetch to get array item IDs, then update RU with matching IDs
    // (passing new arrays without IDs replaces them, erasing EN labels)
    const nav = await payload.findGlobal({ slug: 'navigation', locale: 'en' }) as any
    const ruHeaderLabels = ['Экскурсии', 'О нас', 'Отзывы', 'Блог', 'Контакты']
    const ruFooterData = [
      { title: 'Экскурсии', links: ['Экскурсии'] },
      { title: 'Компания', links: ['О нас', 'Отзывы', 'Контакты', 'FAQ'] },
      { title: 'Юридическое', links: ['Политика конфиденциальности', 'Условия использования', 'Условия отмены'] },
    ]
    await payload.updateGlobal({
      slug: 'navigation',
      locale: 'ru',
      data: {
        headerLinks: nav.headerLinks.map((link: any, i: number) => ({
          id: link.id,
          label: ruHeaderLabels[i],
          href: link.href,
        })),
        headerCta: { label: 'Выбрать экскурсию', href: '/tours' },
        footerColumns: nav.footerColumns.map((col: any, i: number) => ({
          id: col.id,
          title: ruFooterData[i].title,
          links: col.links.map((link: any, j: number) => ({
            id: link.id,
            label: ruFooterData[i].links[j],
            href: link.href,
          })),
        })),
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
    // Fetch to get array item IDs for Homepage
    const hp = await payload.findGlobal({ slug: 'homepage', locale: 'en' }) as any
    const ruTrustBarTexts = ['17 лет опыта', '10 000+ довольных гостей', 'Команда лицензированных гидов', 'Каждая экскурсия создана основателем']
    const ruCategoryLabels = ['Экскурсии по Праге', 'Из Праги']
    const ruProcessSteps = [
      { title: 'Отправьте запрос', description: 'Выберите экскурсию и укажите дату и размер группы.' },
      { title: 'Мы подтвердим', description: 'Проверим доступность и подтвердим в течение 2 часов.' },
      { title: 'Оплатите онлайн', description: 'После подтверждения оплатите по безопасной ссылке.' },
      { title: 'Наслаждайтесь экскурсией', description: 'Встретьтесь с гидом и откройте Прагу как местный житель.' },
    ]
    await payload.updateGlobal({
      slug: 'homepage',
      locale: 'ru',
      data: {
        heroTagline: 'Откройте Прагу, которую не видят туристы',
        heroSubtitle: 'Индивидуальные экскурсии от гида с 17-летним опытом. Только ваша группа — никаких посторонних.',
        heroCta: 'Смотреть экскурсии',
        trustBarItems: hp.trustBarItems.map((item: any, i: number) => ({
          id: item.id,
          icon: item.icon,
          text: ruTrustBarTexts[i],
        })),
        guideHeading: 'Ваш гид',
        guideBio: 'Ульяна Формина делится своей любовью к Праге уже более 17 лет. Как лицензированный гид высшей категории и основатель Best Prague Guide, она лично разрабатывает каждый маршрут и подбирает каждого гида в команду.',
        guideLearnMore: 'Подробнее о нас',
        categoriesHeading: 'Все экскурсии',
        categories: hp.categories.map((cat: any, i: number) => ({
          id: cat.id,
          label: ruCategoryLabels[i],
          href: cat.href,
        })),
        processHeading: 'Как это работает',
        processSteps: hp.processSteps.map((step: any, i: number) => ({
          id: step.id,
          icon: step.icon,
          title: ruProcessSteps[i].title,
          description: ruProcessSteps[i].description,
        })),
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
    // Fetch to get array item IDs for AboutPage
    const about = await payload.findGlobal({ slug: 'about-page', locale: 'en' }) as any
    const ruStats = [
      { value: '17+', label: 'лет опыта' },
      { value: '10,000+', label: 'довольных гостей' },
      { value: 'EN + RU', label: 'языки экскурсий' },
    ]
    const ruBadges = ['Все лицензированы', 'Лично отобраны основателем', 'Регулярное обучение и контроль']
    const ruValues = [
      { title: 'Только индивидуальные экскурсии', description: 'Никаких автобусных групп. Каждая экскурсия — только для вас.' },
      { title: 'Каждая экскурсия авторская', description: 'Каждый маршрут лично разработан нашим основателем.' },
      { title: 'Лицензированные гиды', description: 'Официальная сертификация Ассоциации гидов Чехии.' },
      { title: 'Маршруты под вас', description: 'Мы адаптируем каждую экскурсию под ваши интересы и темп.' },
    ]
    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'ru',
      data: {
        founderHeading: 'Основатель и ведущий гид',
        founderBio: 'Более 17 лет Ульяна Формина делится своей глубокой любовью к Праге с путешественниками со всего мира. Как лицензированный гид высшей категории и член Ассоциации гидов Чехии, она приняла более 10 000 гостей, показав им скрытые уголки и знаковые достопримечательности города.',
        founderQuote: 'Я создала эту компанию, чтобы обеспечить качество экскурсий, как если бы я лично вела каждую из них.',
        stats: about.stats.map((stat: any, i: number) => ({
          id: stat.id,
          value: ruStats[i].value,
          label: ruStats[i].label,
        })),
        teamHeading: 'Наша команда лицензированных гидов',
        teamDescription: 'Каждый гид в нашей команде лично отобран и обучен Ульяной. Все имеют официальные лицензии Ассоциации гидов Чехии и регулярно проходят проверку качества.',
        teamBadges: about.teamBadges.map((badge: any, i: number) => ({
          id: badge.id,
          text: ruBadges[i],
        })),
        valuesHeading: 'Наши ценности',
        values: about.values.map((val: any, i: number) => ({
          id: val.id,
          title: ruValues[i].title,
          description: ruValues[i].description,
        })),
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

    // ─── Seed Legal Pages ───
    const richParagraph = (text: string) => ({
      type: 'paragraph',
      children: [{ type: 'text', text, version: 1 }],
      version: 1,
    })
    const richHeading = (text: string, tag: string = 'h2') => ({
      type: 'heading',
      tag,
      children: [{ type: 'text', text, version: 1 }],
      version: 1,
    })
    const richRoot = (children: any[]) => ({
      root: {
        type: 'root',
        children,
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    })

    const legalPages = [
      {
        slug: 'privacy',
        title_en: 'Privacy Policy',
        title_ru: 'Политика конфиденциальности',
        lastUpdated_en: 'Last updated: March 2026',
        lastUpdated_ru: 'Последнее обновление: март 2026',
        seo_en: { metaTitle: 'Privacy Policy — Best Prague Guide', metaDescription: 'Privacy policy for Best Prague Guide. How we collect, use, and protect your personal data.' },
        seo_ru: { metaTitle: 'Политика конфиденциальности — Best Prague Guide', metaDescription: 'Политика конфиденциальности Best Prague Guide. Как мы собираем, используем и защищаем ваши персональные данные.' },
        content_en: richRoot([
          richParagraph('Best Prague Guide ("we", "us", "our") operates the bestpragueguide.com website. This page informs you of our policies regarding the collection, use, and disclosure of personal data.'),
          richHeading('Information We Collect'),
          richParagraph('We collect information you provide when submitting a booking request or contact form: your name, email address, phone number, and any messages you send us. We also collect standard web analytics data (pages visited, browser type, IP address) through Google Analytics and Yandex Metrika.'),
          richHeading('How We Use Your Information'),
          richParagraph('We use your information to process booking requests, communicate with you about your tours, send confirmation and reminder emails, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.'),
          richHeading('Cookies'),
          richParagraph('We use essential cookies for site functionality and analytics cookies (Google Analytics, Yandex Metrika) to understand how visitors use our site. You can disable cookies in your browser settings.'),
          richHeading('Your Rights'),
          richParagraph('You have the right to access, correct, or delete your personal data. Contact us at info@bestpragueguide.com for any privacy-related requests.'),
          richHeading('Contact'),
          richParagraph('If you have questions about this privacy policy, contact us at info@bestpragueguide.com.'),
        ]),
        content_ru: richRoot([
          richParagraph('Best Prague Guide («мы», «нас», «наш») управляет сайтом bestpragueguide.com. На этой странице описана наша политика в отношении сбора, использования и раскрытия персональных данных.'),
          richHeading('Какую информацию мы собираем'),
          richParagraph('Мы собираем информацию, которую вы предоставляете при отправке запроса на бронирование или контактной формы: ваше имя, адрес электронной почты, номер телефона и любые сообщения. Мы также собираем стандартные данные веб-аналитики (посещённые страницы, тип браузера, IP-адрес) через Google Analytics и Яндекс Метрику.'),
          richHeading('Как мы используем вашу информацию'),
          richParagraph('Мы используем вашу информацию для обработки запросов на бронирование, связи с вами по поводу экскурсий, отправки подтверждений и напоминаний, а также для улучшения наших услуг. Мы не продаём и не передаём ваши персональные данные третьим лицам в маркетинговых целях.'),
          richHeading('Cookies'),
          richParagraph('Мы используем обязательные cookies для функциональности сайта и аналитические cookies (Google Analytics, Яндекс Метрика) для понимания того, как посетители используют наш сайт. Вы можете отключить cookies в настройках браузера.'),
          richHeading('Ваши права'),
          richParagraph('Вы имеете право на доступ, исправление или удаление ваших персональных данных. Свяжитесь с нами по адресу info@bestpragueguide.com для любых запросов, связанных с конфиденциальностью.'),
          richHeading('Контакт'),
          richParagraph('Если у вас есть вопросы об этой политике конфиденциальности, свяжитесь с нами по адресу info@bestpragueguide.com.'),
        ]),
      },
      {
        slug: 'terms',
        title_en: 'Terms of Service',
        title_ru: 'Условия использования',
        lastUpdated_en: 'Last updated: March 2026',
        lastUpdated_ru: 'Последнее обновление: март 2026',
        seo_en: { metaTitle: 'Terms of Service — Best Prague Guide', metaDescription: 'Terms of service for Best Prague Guide private tours in Prague.' },
        seo_ru: { metaTitle: 'Условия использования — Best Prague Guide', metaDescription: 'Условия использования услуг индивидуальных экскурсий Best Prague Guide в Праге.' },
        content_en: richRoot([
          richParagraph('These Terms of Service govern your use of bestpragueguide.com and the booking of private tour services provided by Best Prague Guide.'),
          richHeading('Booking and Confirmation'),
          richParagraph('Submitting a booking request does not constitute a confirmed reservation. Your booking is confirmed only after you receive an official confirmation email from us. We reserve the right to decline booking requests based on availability.'),
          richHeading('Pricing and Payment'),
          richParagraph('Tour prices are listed in EUR per group of up to 4 people. Groups of 5–8 guests are subject to a 30% surcharge. Payment is due after booking confirmation via the payment link provided. All prices include the services of a licensed guide.'),
          richHeading('Liability'),
          richParagraph('Best Prague Guide provides professional guide services with due care. We are not liable for circumstances beyond our control, including weather, public transport disruptions, or venue closures. We recommend travel insurance for all guests.'),
          richHeading('Changes to Terms'),
          richParagraph('We may update these terms from time to time. Continued use of our website and services constitutes acceptance of the current terms.'),
        ]),
        content_ru: richRoot([
          richParagraph('Настоящие Условия использования регулируют использование вами сайта bestpragueguide.com и бронирование индивидуальных экскурсионных услуг, предоставляемых Best Prague Guide.'),
          richHeading('Бронирование и подтверждение'),
          richParagraph('Отправка запроса на бронирование не является подтверждённым бронированием. Ваше бронирование подтверждено только после получения официального письма-подтверждения от нас. Мы оставляем за собой право отклонить запросы на бронирование в зависимости от доступности.'),
          richHeading('Цены и оплата'),
          richParagraph('Цены на экскурсии указаны в EUR за группу до 4 человек. Для групп из 5–8 человек применяется надбавка 30%. Оплата производится после подтверждения бронирования по ссылке для оплаты. Все цены включают услуги лицензированного гида.'),
          richHeading('Ответственность'),
          richParagraph('Best Prague Guide предоставляет профессиональные экскурсионные услуги с должной заботой. Мы не несём ответственности за обстоятельства, не зависящие от нас, включая погоду, сбои в общественном транспорте или закрытие объектов. Мы рекомендуем всем гостям оформить туристическую страховку.'),
          richHeading('Изменения условий'),
          richParagraph('Мы можем время от времени обновлять эти условия. Продолжение использования нашего сайта и услуг означает принятие текущих условий.'),
        ]),
      },
      {
        slug: 'cancellation-policy',
        title_en: 'Cancellation Policy',
        title_ru: 'Условия отмены',
        lastUpdated_en: 'Last updated: March 2026',
        lastUpdated_ru: 'Последнее обновление: март 2026',
        seo_en: { metaTitle: 'Cancellation Policy — Best Prague Guide', metaDescription: 'Cancellation and refund policy for Best Prague Guide private tours.' },
        seo_ru: { metaTitle: 'Условия отмены — Best Prague Guide', metaDescription: 'Условия отмены и возврата средств за индивидуальные экскурсии Best Prague Guide.' },
        content_en: richRoot([
          richParagraph('We understand plans can change. Our cancellation policy is designed to be fair and transparent.'),
          richHeading('Free Cancellation'),
          richParagraph('You may cancel your confirmed booking free of charge up to 24 hours before the scheduled tour start time. Cancellations must be communicated via email, WhatsApp, or Telegram.'),
          richHeading('Late Cancellation'),
          richParagraph('Cancellations made less than 24 hours before the tour start time are subject to a 100% cancellation fee.'),
          richHeading('No-Show'),
          richParagraph('If you do not appear at the meeting point at the scheduled time without prior notice, the full tour price will be charged.'),
          richHeading('Cancellation by Us'),
          richParagraph('In the rare event that we need to cancel a tour (e.g., due to extreme weather or guide illness), we will offer a full refund or reschedule at no extra cost.'),
          richHeading('Refunds'),
          richParagraph('Approved refunds are processed within 5–10 business days via the original payment method.'),
        ]),
        content_ru: richRoot([
          richParagraph('Мы понимаем, что планы могут измениться. Наша политика отмены разработана для обеспечения справедливости и прозрачности.'),
          richHeading('Бесплатная отмена'),
          richParagraph('Вы можете бесплатно отменить подтверждённое бронирование не позднее чем за 24 часа до запланированного начала экскурсии. Отмена должна быть сообщена по электронной почте, WhatsApp или Telegram.'),
          richHeading('Поздняя отмена'),
          richParagraph('При отмене менее чем за 24 часа до начала экскурсии взимается полная стоимость экскурсии.'),
          richHeading('Неявка'),
          richParagraph('Если вы не появитесь в месте встречи в назначенное время без предварительного уведомления, будет взиматься полная стоимость экскурсии.'),
          richHeading('Отмена с нашей стороны'),
          richParagraph('В редких случаях, когда нам необходимо отменить экскурсию (например, из-за экстремальных погодных условий или болезни гида), мы предложим полный возврат средств или перенос на другую дату без дополнительной оплаты.'),
          richHeading('Возвраты'),
          richParagraph('Одобренные возвраты обрабатываются в течение 5–10 рабочих дней через исходный способ оплаты.'),
        ]),
      },
    ]

    // Delete existing legal pages
    const existingPages = await payload.find({ collection: 'pages', limit: 100 })
    for (const doc of existingPages.docs) {
      await payload.delete({ collection: 'pages', id: doc.id })
    }

    // Create legal pages
    for (const page of legalPages) {
      const doc = await payload.create({
        collection: 'pages',
        locale: 'en',
        data: {
          title: page.title_en,
          slug: page.slug,
          template: 'legal',
          lastUpdated: page.lastUpdated_en,
          content: page.content_en,
          seo: page.seo_en,
          _status: 'published',
        },
      })
      await payload.update({
        collection: 'pages',
        id: doc.id,
        locale: 'ru',
        data: {
          title: page.title_ru,
          slug: page.slug,
          lastUpdated: page.lastUpdated_ru,
          content: page.content_ru,
          seo: page.seo_ru,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'CMS data seeded successfully (including legal pages)' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
