export interface MediaImage {
  id: number
  url?: string
  alt?: string
  focalX?: number
  focalY?: number
  sizes?: {
    thumbnail?: { url?: string }
    card?: { url?: string }
    mobileCard?: { url?: string }
    hero?: { url?: string }
    mobileHero?: { url?: string }
    og?: { url?: string }
  }
}

export interface NavigationLink {
  label: string
  href: string
  openInNewTab?: boolean
}

export interface NavigationColumn {
  title: string
  links: NavigationLink[]
}

export interface NavigationData {
  headerLinks: NavigationLink[]
  headerCta: { label: string; href: string }
  footerColumns: NavigationColumn[]
  footerLicense: string
  footerCopyright: string
}

export interface SiteSettingsData {
  siteName: string
  tagline: string
  contactEmail: string
  contactPhone: string
  contactPhoneDisplay: string
  whatsappNumber: string
  whatsappMessageTemplate: string
  whatsappTourMessageTemplate: string
  telegramHandle: string
  instagramHandle: string
  businessHours: string
  socialLinks: {
    instagramUrl?: string
    youtubeUrl?: string
    tripAdvisorUrl?: string
    googleBusinessUrl?: string
  }
  mapCoordinates: { lat: number; lng: number }
  licenseText: string
  copyrightText: string
  announcement?: {
    enabled?: boolean
    text?: string
    link?: string
  }
}

export interface TrustBarItem {
  icon: string
  text: string
}

export interface ProcessStep {
  icon: string
  title: string
  description: string
}

export interface CategoryItem {
  label: string
  href: string
  image?: MediaImage | number
}

export interface HomepageData {
  heroTagline: string
  heroSubtitle: string
  heroCta: string
  heroCtaHref: string
  heroBackgroundImage?: MediaImage | number
  trustBarItems: TrustBarItem[]
  guideHeading: string
  guideBio: string
  guideLearnMore: string
  guideLearnMoreHref: string
  guidePhoto?: MediaImage | number
  categoriesHeading: string
  categories: CategoryItem[]
  processHeading: string
  processSteps: ProcessStep[]
  testimonialsHeading: string
  faqSectionHeading: string
  ctaHeading: string
  ctaSubtitle: string
  ctaButtonLabel: string
  ctaButtonHref: string
  ctaWhatsappLabel: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: MediaImage | number
  }
}

export interface AboutStat {
  value: string
  label: string
}

export interface AboutValue {
  title: string
  description: string
}

export interface AboutPageData {
  founderPhoto?: MediaImage | number
  founderHeading: string
  founderBio: string
  founderQuote: string
  stats: AboutStat[]
  teamHeading: string
  teamDescription: string
  teamPhotos: Array<{ image: MediaImage | number }>
  teamBadges: Array<{ text: string }>
  valuesHeading: string
  values: AboutValue[]
  galleryPhotos: Array<{ image: MediaImage | number }>
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: MediaImage | number
  }
}

export interface ReviewsPageData {
  heading: string
  photoGalleryHeading: string
  galleryPhotos: Array<{ image: MediaImage | number }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: MediaImage | number
  }
}

export interface FAQItem {
  id: number
  question: string
  answer: any // Lexical richText
  category: 'booking' | 'tours' | 'logistics' | 'payment'
  sortOrder: number
  showOnHomepage: boolean
}

export interface PageData {
  id: number
  title: string
  slug: string
  content: any // Lexical richText
  template?: string
  lastUpdated?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: MediaImage | number
  }
}
