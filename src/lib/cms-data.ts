import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  NavigationData,
  SiteSettingsData,
  HomepageData,
  AboutPageData,
  ReviewsPageData,
  FAQItem,
  PageData,
} from './cms-types'

// ─── Fallback data ───────────────────────────────────────────────

function siteSettingsFallback(locale: string): SiteSettingsData {
  return {
    siteName: 'Best Prague Guide',
    tagline: locale === 'ru'
      ? 'Индивидуальные экскурсии по Праге от команды лицензированных гидов'
      : 'Private tours in Prague from a team of licensed guides',
    contactEmail: 'info@bestpragueguide.com',
    contactPhone: '+420776306858',
    contactPhoneDisplay: '+420 776 306 858',
    whatsappNumber: '420776306858',
    whatsappMessageTemplate: locale === 'ru'
      ? 'Здравствуйте! Я хотел(а) бы узнать об экскурсиях.'
      : "Hi! I'd like to learn about your tours.",
    whatsappTourMessageTemplate: locale === 'ru'
      ? 'Здравствуйте! Меня интересует экскурсия "{tourName}".'
      : 'Hi! I\'m interested in the "{tourName}" tour.',
    telegramHandle: 'bestpragueguide',
    instagramHandle: 'bestpragueguide',
    businessHours: '09:00–20:00 CET',
    socialLinks: {
      instagramUrl: 'https://instagram.com/bestpragueguide',
    },
    mapCoordinates: { lat: 50.0875, lng: 14.4213 },
    licenseText: locale === 'ru'
      ? 'Лицензированный гид, Ассоциация гидов Чехии'
      : 'Licensed Guide, Czech Guide Association',
    copyrightText: locale === 'ru'
      ? '© {year} Best Prague Guide. Все права защищены.'
      : '© {year} Best Prague Guide. All rights reserved.',
  }
}

function navigationFallback(locale: string): NavigationData {
  const prefix = `/${locale}`
  return {
    headerLinks: [
      { label: locale === 'ru' ? 'Экскурсии' : 'Tours', href: `${prefix}/tours` },
      { label: locale === 'ru' ? 'О нас' : 'About Us', href: `${prefix}/about` },
      { label: locale === 'ru' ? 'Отзывы' : 'Reviews', href: `${prefix}/reviews` },
      { label: locale === 'ru' ? 'Блог' : 'Blog', href: `${prefix}/blog` },
      { label: locale === 'ru' ? 'Контакты' : 'Contact', href: `${prefix}/contact` },
    ],
    headerCta: {
      label: locale === 'ru' ? 'Выбрать экскурсию' : 'Choose a Tour',
      href: `${prefix}/tours`,
    },
    footerColumns: [
      {
        title: locale === 'ru' ? 'Экскурсии' : 'Tours',
        links: [
          { label: locale === 'ru' ? 'Экскурсии' : 'Tours', href: `${prefix}/tours` },
        ],
      },
      {
        title: locale === 'ru' ? 'Компания' : 'Company',
        links: [
          { label: locale === 'ru' ? 'О нас' : 'About Us', href: `${prefix}/about` },
          { label: locale === 'ru' ? 'Отзывы' : 'Reviews', href: `${prefix}/reviews` },
          { label: locale === 'ru' ? 'Контакты' : 'Contact', href: `${prefix}/contact` },
          { label: 'FAQ', href: `${prefix}/faq` },
        ],
      },
      {
        title: locale === 'ru' ? 'Юридическое' : 'Legal',
        links: [
          { label: locale === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy', href: `${prefix}/privacy` },
          { label: locale === 'ru' ? 'Условия использования' : 'Terms of Service', href: `${prefix}/terms` },
          { label: locale === 'ru' ? 'Условия отмены' : 'Cancellation Policy', href: `${prefix}/cancellation-policy` },
        ],
      },
    ],
    footerLicense: locale === 'ru'
      ? 'Лицензированный гид, Ассоциация гидов Чехии'
      : 'Licensed Guide, Czech Guide Association',
    footerCopyright: locale === 'ru'
      ? '© {year} Best Prague Guide. Все права защищены.'
      : '© {year} Best Prague Guide. All rights reserved.',
  }
}

function homepageFallback(locale: string): HomepageData {
  return {
    heroTagline: locale === 'ru'
      ? 'Откройте Прагу, которую не видят туристы'
      : 'Discover the Prague Tourists Never See',
    heroSubtitle: locale === 'ru'
      ? 'Индивидуальные экскурсии от гида с 17-летним опытом. Только ваша группа — никаких посторонних.'
      : 'Private tours from a guide with 17 years of experience. Just your group — no strangers.',
    heroCta: locale === 'ru' ? 'Смотреть экскурсии' : 'Explore Tours',
    heroCtaHref: '/tours',
    trustBarItems: [
      { icon: 'experience', text: locale === 'ru' ? '17 лет опыта' : '17 Years Experience' },
      { icon: 'guests', text: locale === 'ru' ? '10 000+ довольных гостей' : '10,000+ Happy Guests' },
      { icon: 'licensed', text: locale === 'ru' ? 'Команда лицензированных гидов' : 'Team of Licensed Guides' },
      { icon: 'curated', text: locale === 'ru' ? 'Каждая экскурсия создана основателем' : 'Every Tour Curated by Founder' },
    ],
    guideHeading: locale === 'ru' ? 'Ваш гид' : 'Meet Your Guide',
    guideBio: locale === 'ru'
      ? 'Ульяна Формина делится своей любовью к Праге уже более 17 лет. Как лицензированный гид высшей категории и основатель Best Prague Guide, она лично разрабатывает каждый маршрут и подбирает каждого гида в команду.'
      : 'Uliana Formina has been sharing her passion for Prague for over 17 years. As a highest-category licensed guide and founder of Best Prague Guide, she personally curates every tour route and hand-picks each guide on her team.',
    guideLearnMore: locale === 'ru' ? 'Подробнее о нас' : 'Learn More About Us',
    guideLearnMoreHref: '/about',
    categoriesHeading: locale === 'ru' ? 'Все экскурсии' : 'All Tours',
    categories: [
      { label: locale === 'ru' ? 'Экскурсии по Праге' : 'Prague Tours', href: '/tours?category=prague-tours' },
      { label: locale === 'ru' ? 'Из Праги' : 'From Prague', href: '/tours?category=from-prague' },
    ],
    processHeading: locale === 'ru' ? 'Как это работает' : 'How It Works',
    processSteps: [
      { icon: 'form', title: locale === 'ru' ? 'Отправьте запрос' : 'Submit a Request', description: locale === 'ru' ? 'Выберите экскурсию и укажите дату и размер группы.' : 'Choose a tour and tell us your preferred date and group size.' },
      { icon: 'check', title: locale === 'ru' ? 'Мы подтвердим' : 'We Confirm', description: locale === 'ru' ? 'Проверим доступность и подтвердим в течение 2 часов.' : 'We check availability and confirm within 2 hours.' },
      { icon: 'card', title: locale === 'ru' ? 'Оплатите онлайн' : 'Pay Securely', description: locale === 'ru' ? 'После подтверждения оплатите по безопасной ссылке.' : 'After confirmation, pay online via a secure payment link.' },
      { icon: 'pin', title: locale === 'ru' ? 'Наслаждайтесь экскурсией' : 'Enjoy Your Tour', description: locale === 'ru' ? 'Встретьтесь с гидом и откройте Прагу как местный житель.' : 'Meet your guide and discover Prague like a local.' },
    ],
    testimonialsHeading: locale === 'ru' ? 'Отзывы наших гостей' : 'What Our Guests Say',
    faqSectionHeading: locale === 'ru' ? 'Часто задаваемые вопросы' : 'Frequently Asked Questions',
    ctaHeading: locale === 'ru' ? 'Готовы исследовать Прагу?' : 'Ready to Explore Prague?',
    ctaSubtitle: locale === 'ru' ? 'Забронируйте вашу индивидуальную экскурсию сегодня' : 'Book your private tour today',
    ctaButtonLabel: locale === 'ru' ? 'Выбрать экскурсию' : 'Choose a Tour',
    ctaButtonHref: '/tours',
    ctaWhatsappLabel: locale === 'ru' ? 'Написать в WhatsApp' : 'WhatsApp Us',
  }
}

function aboutPageFallback(locale: string): AboutPageData {
  return {
    founderHeading: locale === 'ru' ? 'Основатель и ведущий гид' : 'Founder and Lead Guide',
    founderBio: locale === 'ru'
      ? 'Более 17 лет Ульяна Формина делится своей глубокой любовью к Праге с путешественниками со всего мира. Как лицензированный гид высшей категории и член Ассоциации гидов Чехии, она приняла более 10 000 гостей, показав им скрытые уголки и знаковые достопримечательности города.'
      : 'For over 17 years, Uliana Formina has been sharing her deep love for Prague with travelers from around the world. As a highest-category licensed guide and member of the Czech Guide Association, she has welcomed more than 10,000 guests to the city\'s hidden corners and iconic landmarks.',
    founderQuote: locale === 'ru'
      ? 'Я создала эту компанию, чтобы обеспечить качество экскурсий, как если бы я лично вела каждую из них.'
      : 'I built this company to deliver tour quality as if I personally led every single one.',
    stats: [
      { value: '17+', label: locale === 'ru' ? 'лет опыта' : 'years experience' },
      { value: '10,000+', label: locale === 'ru' ? 'довольных гостей' : 'happy guests' },
      { value: 'EN + RU', label: locale === 'ru' ? 'языки экскурсий' : 'tour languages' },
    ],
    teamHeading: locale === 'ru' ? 'Наша команда лицензированных гидов' : 'Our Team of Licensed Guides',
    teamDescription: locale === 'ru'
      ? 'Каждый гид в нашей команде лично отобран и обучен Ульяной. Все имеют официальные лицензии Ассоциации гидов Чехии и регулярно проходят проверку качества.'
      : 'Every guide on our team is personally selected and trained by Uliana. All hold official licenses from the Czech Guide Association and undergo regular quality reviews.',
    teamPhotos: [],
    teamBadges: [
      { text: locale === 'ru' ? 'Все лицензированы' : 'All Licensed' },
      { text: locale === 'ru' ? 'Лично отобраны основателем' : 'Personally Selected by Founder' },
      { text: locale === 'ru' ? 'Регулярное обучение и контроль' : 'Regular Training and QC' },
    ],
    valuesHeading: locale === 'ru' ? 'Наши ценности' : 'Our Values',
    values: [
      { title: locale === 'ru' ? 'Только индивидуальные экскурсии' : 'Private Tours Only', description: locale === 'ru' ? 'Никаких автобусных групп. Каждая экскурсия — только для вас.' : 'No group buses. Every tour is exclusive to you.' },
      { title: locale === 'ru' ? 'Каждая экскурсия авторская' : 'Every Tour Curated', description: locale === 'ru' ? 'Каждый маршрут лично разработан нашим основателем.' : 'Each route personally designed by our founder.' },
      { title: locale === 'ru' ? 'Лицензированные гиды' : 'Licensed Guides', description: locale === 'ru' ? 'Официальная сертификация Ассоциации гидов Чехии.' : 'Official Czech Guide Association certification.' },
      { title: locale === 'ru' ? 'Маршруты под вас' : 'Routes Tailored to You', description: locale === 'ru' ? 'Мы адаптируем каждую экскурсию под ваши интересы и темп.' : 'We adapt every tour to your interests and pace.' },
    ],
    galleryPhotos: [],
    ctaPrimaryLabel: locale === 'ru' ? 'Выбрать экскурсию' : 'Choose a Tour',
    ctaPrimaryHref: '/tours',
    ctaSecondaryLabel: locale === 'ru' ? 'Связаться с нами' : 'Contact Us',
    ctaSecondaryHref: '/contact',
  }
}

function reviewsPageFallback(locale: string): ReviewsPageData {
  return {
    heading: locale === 'ru' ? 'Отзывы гостей' : 'Guest Reviews',
    photoGalleryHeading: locale === 'ru' ? 'Наши гости в Праге' : 'Our Guests in Prague',
    galleryPhotos: [],
  }
}

// ─── Data-fetching functions ─────────────────────────────────────

export async function getSiteSettings(locale: string): Promise<SiteSettingsData> {
  try {
    const payload = await getPayload({ config })
    const data = await payload.findGlobal({
      slug: 'site-settings',
      locale: locale as 'en' | 'ru',
    })
    return {
      siteName: data.siteName || 'Best Prague Guide',
      tagline: data.tagline || siteSettingsFallback(locale).tagline,
      contactEmail: data.contactEmail || 'info@bestpragueguide.com',
      contactPhone: data.contactPhone || '+420776306858',
      contactPhoneDisplay: data.contactPhoneDisplay || '+420 776 306 858',
      whatsappNumber: data.whatsappNumber || '420776306858',
      whatsappMessageTemplate: data.whatsappMessageTemplate || siteSettingsFallback(locale).whatsappMessageTemplate,
      whatsappTourMessageTemplate: data.whatsappTourMessageTemplate || siteSettingsFallback(locale).whatsappTourMessageTemplate,
      telegramHandle: data.telegramHandle || 'bestpragueguide',
      instagramHandle: data.instagramHandle || 'bestpragueguide',
      businessHours: data.businessHours || '09:00–20:00 CET',
      socialLinks: data.socialLinks || { instagramUrl: 'https://instagram.com/bestpragueguide' },
      mapCoordinates: data.mapCoordinates || { lat: 50.0875, lng: 14.4213 },
      licenseText: data.licenseText || siteSettingsFallback(locale).licenseText,
      copyrightText: data.copyrightText || siteSettingsFallback(locale).copyrightText,
      announcement: data.announcement,
    } as SiteSettingsData
  } catch {
    return siteSettingsFallback(locale)
  }
}

export async function getNavigation(locale: string): Promise<NavigationData> {
  try {
    const payload = await getPayload({ config })
    const data = await payload.findGlobal({
      slug: 'navigation',
      locale: locale as 'en' | 'ru',
    })
    const fallback = navigationFallback(locale)
    const headerLinks = data.headerLinks && data.headerLinks.length > 0
      ? data.headerLinks.map((l: any) => ({ label: l.label, href: l.href, openInNewTab: l.openInNewTab }))
      : fallback.headerLinks
    const headerCta = data.headerCta?.label
      ? { label: data.headerCta.label, href: data.headerCta.href }
      : fallback.headerCta
    const footerColumns = data.footerColumns && data.footerColumns.length > 0
      ? data.footerColumns.map((col: any) => ({
          title: col.title,
          links: (col.links || []).map((l: any) => ({ label: l.label, href: l.href, openInNewTab: l.openInNewTab })),
        }))
      : fallback.footerColumns
    return {
      headerLinks,
      headerCta,
      footerColumns,
      footerLicense: data.footerLicense || fallback.footerLicense,
      footerCopyright: data.footerCopyright || fallback.footerCopyright,
    }
  } catch {
    return navigationFallback(locale)
  }
}

export async function getHomepageData(locale: string): Promise<HomepageData> {
  try {
    const payload = await getPayload({ config })
    const data: any = await payload.findGlobal({
      slug: 'homepage',
      locale: locale as 'en' | 'ru',
    })
    const fallback = homepageFallback(locale)
    return {
      heroTagline: data.heroTagline || fallback.heroTagline,
      heroSubtitle: data.heroSubtitle || fallback.heroSubtitle,
      heroCta: data.heroCta || fallback.heroCta,
      heroCtaHref: data.heroCtaHref || fallback.heroCtaHref,
      heroBackgroundImage: data.heroBackgroundImage || fallback.heroBackgroundImage,
      trustBarItems: data.trustBarItems && data.trustBarItems.length > 0
        ? data.trustBarItems
        : fallback.trustBarItems,
      guideHeading: data.guideHeading || fallback.guideHeading,
      guideBio: data.guideBio || fallback.guideBio,
      guideLearnMore: data.guideLearnMore || fallback.guideLearnMore,
      guideLearnMoreHref: data.guideLearnMoreHref || fallback.guideLearnMoreHref,
      guidePhoto: data.guidePhoto || fallback.guidePhoto,
      categoriesHeading: data.categoriesHeading || fallback.categoriesHeading,
      categories: data.categories && data.categories.length > 0
        ? data.categories
        : fallback.categories,
      processHeading: data.processHeading || fallback.processHeading,
      processSteps: data.processSteps && data.processSteps.length > 0
        ? data.processSteps
        : fallback.processSteps,
      testimonialsHeading: data.testimonialsHeading || fallback.testimonialsHeading,
      faqSectionHeading: data.faqSectionHeading || fallback.faqSectionHeading,
      ctaHeading: data.ctaHeading || fallback.ctaHeading,
      ctaSubtitle: data.ctaSubtitle || fallback.ctaSubtitle,
      ctaButtonLabel: data.ctaButtonLabel || fallback.ctaButtonLabel,
      ctaButtonHref: data.ctaButtonHref || fallback.ctaButtonHref,
      ctaWhatsappLabel: data.ctaWhatsappLabel || fallback.ctaWhatsappLabel,
      seo: data.seo,
    }
  } catch {
    return homepageFallback(locale)
  }
}

export async function getAboutPageData(locale: string): Promise<AboutPageData> {
  try {
    const payload = await getPayload({ config })
    const data: any = await payload.findGlobal({
      slug: 'about-page',
      locale: locale as 'en' | 'ru',
    })
    const fallback = aboutPageFallback(locale)
    return {
      founderPhoto: data.founderPhoto || fallback.founderPhoto,
      founderHeading: data.founderHeading || fallback.founderHeading,
      founderBio: data.founderBio || fallback.founderBio,
      founderQuote: data.founderQuote || fallback.founderQuote,
      stats: data.stats && data.stats.length > 0 ? data.stats : fallback.stats,
      teamHeading: data.teamHeading || fallback.teamHeading,
      teamDescription: data.teamDescription || fallback.teamDescription,
      teamPhotos: data.teamPhotos && data.teamPhotos.length > 0 ? data.teamPhotos : fallback.teamPhotos,
      teamBadges: data.teamBadges && data.teamBadges.length > 0 ? data.teamBadges : fallback.teamBadges,
      valuesHeading: data.valuesHeading || fallback.valuesHeading,
      values: data.values && data.values.length > 0 ? data.values : fallback.values,
      galleryPhotos: data.galleryPhotos && data.galleryPhotos.length > 0 ? data.galleryPhotos : fallback.galleryPhotos,
      ctaPrimaryLabel: data.ctaPrimaryLabel || fallback.ctaPrimaryLabel,
      ctaPrimaryHref: data.ctaPrimaryHref || fallback.ctaPrimaryHref,
      ctaSecondaryLabel: data.ctaSecondaryLabel || fallback.ctaSecondaryLabel,
      ctaSecondaryHref: data.ctaSecondaryHref || fallback.ctaSecondaryHref,
      seo: data.seo,
    }
  } catch {
    return aboutPageFallback(locale)
  }
}

export async function getReviewsPageData(locale: string): Promise<ReviewsPageData> {
  try {
    const payload = await getPayload({ config })
    const data: any = await payload.findGlobal({
      slug: 'reviews-page',
      locale: locale as 'en' | 'ru',
    })
    const fallback = reviewsPageFallback(locale)
    return {
      heading: data.heading || fallback.heading,
      photoGalleryHeading: data.photoGalleryHeading || fallback.photoGalleryHeading,
      galleryPhotos: data.galleryPhotos && data.galleryPhotos.length > 0
        ? data.galleryPhotos
        : fallback.galleryPhotos,
      seo: data.seo,
    }
  } catch {
    return reviewsPageFallback(locale)
  }
}

export async function getFAQItems(
  locale: string,
  options?: { homepageOnly?: boolean },
): Promise<FAQItem[]> {
  try {
    const payload = await getPayload({ config })
    const where: any = { status: { equals: 'published' } }
    if (options?.homepageOnly) {
      where.showOnHomepage = { equals: true }
    }
    const result = await payload.find({
      collection: 'faqs',
      where,
      sort: 'sortOrder',
      limit: 100,
      locale: locale as 'en' | 'ru',
    })
    return result.docs as unknown as FAQItem[]
  } catch {
    return []
  }
}

export async function getPageBySlug(
  slug: string,
  locale: string,
): Promise<PageData | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      locale: locale as 'en' | 'ru',
    })
    if (result.docs.length === 0) return null
    return result.docs[0] as unknown as PageData
  } catch {
    return null
  }
}

// ─── Helper to resolve media URL ─────────────────────────────────

export function resolveMediaUrl(
  media: any,
  size?: 'thumbnail' | 'card' | 'hero' | 'og',
): string | null {
  if (!media || typeof media === 'number') return null
  if (size && media.sizes?.[size]?.url) return media.sizes[size].url
  if (media.url) return media.url
  return null
}
