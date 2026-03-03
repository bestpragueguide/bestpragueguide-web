# Changelog

All notable changes to this project will be documented in this file.

## [0.15.0] - 2026-03-03

### Added
- Google Tag Manager integration (conditional on NEXT_PUBLIC_GTM_ID)
- Yandex Metrika with Webvisor (conditional on NEXT_PUBLIC_YANDEX_METRIKA_ID)
- Both render nothing if env vars are not set (safe for dev)

## [0.14.0] - 2026-03-03

### Added
- Schema.org JSON-LD: TouristTrip on tour pages, TravelAgency on all pages, FAQPage on FAQ
- Dynamic sitemap with all static pages + tours, hreflang alternates for EN/RU
- robots.txt with Yandex crawl-delay and admin/API exclusion
- Canonical URLs and hreflang link tags on tour detail pages
- Open Graph metadata on tour detail pages

## [0.13.0] - 2026-03-03

### Added
- Admin workflow hooks for BookingRequests collection
- beforeChange hook: auto-generates requestRef on create
- afterChange hook: sends status-driven emails (confirmed, declined, paid)
- Searchable fields in admin: requestRef, customerName, customerEmail

## [0.12.0] - 2026-03-03

### Added
- WhatsApp floating button on all pages with pre-filled message
- Telegram notification helper with HTML formatting
- WhatsApp Business API notification helper
- Telegram + WhatsApp admin notifications on new booking requests
- All notifications fire in parallel via Promise.allSettled

## [0.11.0] - 2026-03-03

### Added
- Email notification system with Resend + React Email
- 6 email templates: request-received, new-request-admin, request-confirmed, payment-received, pre-tour-reminder, request-declined
- Email helper library (`src/lib/email.ts`) with graceful fallback when no API key
- Wired email sending into booking request API (customer + admin notifications)

## [0.10.0] - 2026-03-03

### Added
- BookingRequestForm with Zod validation, date/time/guests selectors
- Booking API endpoint (`/api/booking/request`) with rate limiting
- Booking validation schema and request ref generator (`src/lib/booking.ts`)
- Form wired into tour detail page sidebar and mobile BookingModal
- Booking success/error states with reference number display

## [0.9.0] - 2026-03-03

### Added
- StickyBookButton for mobile tour detail pages (fixed bottom CTA)
- BookingModal with slide-up animation for mobile booking flow
- Bottom padding on tour detail pages to prevent sticky button overlap
- Slide-up CSS animation for modal

## [0.8.0] - 2026-03-03

### Added
- About page with founder profile, team, values, and CTA sections
- Reviews page with photo gallery placeholders and text review filter
- Contact page with form (Zod-validated API), direct contacts, and Google Maps embed
- FAQ page with categorized accordion and FAQPage JSON-LD schema
- Privacy Policy, Terms of Service, and Cancellation Policy pages (EN/RU)
- Custom 404 page
- Contact form API endpoint (`/api/contact`) with rate limiting
- FAQAccordion reusable component
- JsonLd reusable component for structured data
- ReviewCard, ReviewFilter, PhotoGallery components
- Legal page content in EN/RU i18n message files

## [0.7.0] - 2026-03-03

### Added
- Tour catalog page with category/subcategory filters and localized routes
- Tour detail page with two-column layout (content + sticky sidebar)
- ImageGallery with masonry grid and lightbox
- TourItinerary timeline, TourIncluded lists, TourFAQ accordion
- TourReviews section and TourRelated cross-sell cards
- Breadcrumbs component with BreadcrumbList JSON-LD schema
- ISR with 1-hour revalidation for tour pages

## [0.6.0] - 2026-03-03

### Added
- Homepage with Hero, TrustBar, GuideProfile, FeaturedTours, ProcessSteps, TestimonialSlider, FAQ, CTA sections
- TourCard reusable component
- Server-side data fetching from Payload API for featured tours and testimonials

## [0.5.0] - 2026-03-03

### Added
- Layout shell with Nav, Footer, MobileMenu, LanguageSwitcher
- Fixed top navigation with backdrop blur and responsive design
- Slide-out mobile menu with scroll lock

## [0.4.0] - 2026-03-03

### Added
- Design system with navy/gold/cream palette
- Cormorant Garamond (headings) + DM Sans (body) fonts with Cyrillic
- Button component (primary/secondary/ghost, sm/md/lg)
- Badge component (category/trust/tag variants)

## [0.3.0] - 2026-03-03

### Added
- next-intl with EN/RU routing and localized pathnames
- Comprehensive UI strings for all pages (nav, hero, booking, FAQ, about, reviews, contact, meta)

## [0.2.0] - 2026-03-03

### Added
- Payload CMS collections: Tours, BookingRequests, Reviews, Pages, Media
- SiteSettings global with contacts, social links, announcement
- EN/RU localization in Payload with fallback

## [0.1.0] - 2026-03-03

### Added
- Initial project scaffold with Next.js 15 + Payload CMS 3.x
- Docker Compose for local PostgreSQL 16 + Redis 7
- Project structure with (payload) and (frontend) route groups
- Basic Payload admin panel integration
