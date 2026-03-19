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

/** Lexical richText JSON structure — used instead of `any` for richText fields */
export interface LexicalRichText {
  root: {
    children: LexicalNode[]
    direction: string | null
    format: string
    indent: number
    type: string
    version: number
  }
}

interface LexicalNode {
  type: string
  version: number
  children?: LexicalNode[]
  text?: string
  format?: number | string
  direction?: string | null
  indent?: number
  tag?: string
  listType?: string
  [key: string]: unknown
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
  bookingPricingDescription?: string
  bookingFormTitle?: string
  bookingSubmitLabel?: string
  bookingSuccessTitle?: string
  bookingSuccessMessage?: string
  bookingDisclaimerText?: string
  bookingConsentText?: string
  bookingTrustBadges?: Array<{ text: string }>
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
  mobileHeroImage?: MediaImage | number
  trustBarItems: TrustBarItem[]
  guideHeading: string
  guideBio: LexicalRichText | string
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
  founderBio: LexicalRichText | string
  founderQuote: string
  stats: AboutStat[]
  teamHeading: string
  teamDescription: LexicalRichText | string
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

// --- Tour Pricing ---

export type PricingModel = 'GROUP_TIERS' | 'PER_PERSON' | 'FLAT_RATE' | 'ON_REQUEST'

export interface GroupTier {
  minGuests: number
  maxGuests?: number | null
  price?: number | null
  onRequest?: boolean
}

export interface GuestCategory {
  label: string
  ageMin?: number
  ageMax?: number | null
  priceModifier?: number
  isFree?: boolean
  onRequest?: boolean
}

export interface TourServiceAttachment {
  service: ServiceData | number
  overridePricing?: boolean
  customPricingNote?: string
}

export interface TourPricing {
  model: PricingModel
  currency?: string
  groupTiers?: GroupTier[]
  perPersonPrice?: number
  perPersonMaxGuests?: number
  flatRatePrice?: number
  flatRateMaxGuests?: number
  onRequestNote?: string
  guestCategoriesHeading?: string
  guestCategories?: GuestCategory[]
  additionalServices?: TourServiceAttachment[]
}

export type ServiceType =
  | 'ENTRY_TICKET' | 'VEHICLE' | 'RESTAURANT' | 'DRIVER'
  | 'BOAT_TICKET' | 'AUDIO_HEADSET' | 'VR' | 'OTHER'

export type ServicePricingModel = 'PER_PERSON' | 'GROUP_TIERS' | 'FLAT' | 'ON_REQUEST'

export interface ServiceGuestCategoryPrice {
  label: string
  ageMin?: number
  ageMax?: number | null
  price?: number | null
  isFree?: boolean
  onRequest?: boolean
}

export interface ServiceGroupTier {
  minGuests: number
  maxGuests?: number | null
  price?: number | null
  onRequest?: boolean
}

export interface ServiceData {
  id: number
  name: string
  type: ServiceType
  description?: string
  pricingModel: ServicePricingModel
  requireGuestBreakdown?: boolean
  guestCategoryPricing?: ServiceGuestCategoryPrice[]
  groupTierPricing?: ServiceGroupTier[]
  flatPrice?: number
  onRequestThreshold?: number
}

export type GuestBreakdown = Record<string, number>

// --- FAQs ---

export interface FAQItem {
  id: number
  question: string
  answer: LexicalRichText | string
  category: 'booking' | 'tours' | 'logistics' | 'payment'
  sortOrder: number
  showOnHomepage: boolean
}

export interface PageData {
  id: number
  title: string
  slug: string
  content: LexicalRichText | string
  template?: string
  lastUpdated?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: MediaImage | number
  }
}

/** Tour document from Payload CMS */
export interface TourData {
  id: number
  title: string
  slug: string
  excerpt: LexicalRichText | string
  description?: LexicalRichText | string
  category: string
  subcategory?: string | null
  duration: number
  groupPrice?: number
  maxGroupSize?: number
  rating?: number | null
  reviewCount?: number | null
  sortOrder?: number
  status: 'published' | 'draft'
  heroImage?: MediaImage | number
  mobileHeroImage?: MediaImage | number
  gallery?: TourGalleryItem[]
  included?: TourListItem[]
  excluded?: TourListItem[]
  meetingPoint?: {
    address?: string
    instructions?: LexicalRichText | string
    lat?: number
    lng?: number
  }
  faq?: TourFaqItem[]
  pricing?: TourPricing
  relatedTours?: (TourData | number)[]
  preferredTimes?: string[]
  publishedLocales?: ('en' | 'ru')[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: MediaImage | number
  }
}

export interface TourGalleryItem {
  image: MediaImage | number
  mobileImage?: MediaImage | number
  alt?: string
  caption?: string
  objectFit?: string
}

export interface TourListItem {
  text: string
}

export interface TourFaqItem {
  question: string
  answer: LexicalRichText | string
}
