# Changelog

All notable changes to this project will be documented in this file.

## [1.1.2] - 2026-03-04

### Fixed
- Language switcher on tour and blog detail pages now redirects to the correct localized slug
- LanguageSwitcher reads hreflang metadata links for dynamic pages, with manual path mapping fallback
- CTA "Choose a Tour" button text stays visible after visiting the link (added `visited:` styles)
- Blog post and tour description rich text now properly formatted (headings, spacing, paragraphs)

### Added
- `@tailwindcss/typography` plugin for proper prose/rich text styling

### Changed
- Homepage category cards (Prague Tours, From Prague) now show real photos with hover zoom effect
- All tour prices updated: minimum €399, scaled by duration (Prague tours €399–€599, day trips €599–€899)

## [1.1.1] - 2026-03-04

### Fixed
- Language switcher now correctly redirects to localized URLs (e.g., `/en/tours` → `/ru/ekskursii`)
- Use next-intl `createNavigation` for locale-aware routing instead of manual path segment replacement
- Blog and tour detail pages pass alternate locale slug to language switcher for correct cross-locale navigation

## [1.1.0] - 2026-03-03

### Added
- BlogPosts collection in Payload CMS (title, slug, excerpt, content, category, heroImage, publishedLocales, SEO)
- Blog listing page at `/[locale]/blog/` with category badges, dates, and card layout
- Blog detail page at `/[locale]/blog/[slug]/` with rich text rendering, related posts, and tour CTA
- Blog seed API endpoint with 3 bilingual articles (Prague hidden gems, food guide, Český Krumlov day trip)
- Blog route added to next-intl routing configuration

### Changed
- About page: replaced placeholder gray boxes with real photos (founder portrait, team gallery, bottom photo gallery)
- Homepage Hero: added real background image (Prague panoramic view)
- Homepage GuideProfile: replaced placeholder with real Uliana portrait photo
- Reviews page: replaced 12 placeholder squares with 7 real tour photos in responsive grid
- Removed unused PhotoGallery import from Reviews page

## [1.0.5] - 2026-03-03

### Fixed
- Docker Compose: add `coolify` external network so container can reach PostgreSQL database
- Fixes Payload CMS initialization error (500) after switching to dockercompose buildpack

## [1.0.4] - 2026-03-03

### Changed
- Switch from Cloudflare R2 to self-hosted local filesystem for media storage
- Remove `@payloadcms/storage-s3` dependency
- Media collection uses `MEDIA_DIR` env var for configurable storage path
- Dockerfile creates writable `/app/media` directory for container uploads
- Docker volume `bestpragueguide-media` persists uploads across deployments

### Added
- `/api/upload-photos` endpoint for bulk photo upload via multipart form
- `/api/assign-photos` endpoint to assign media to tours as hero images

## [1.0.3] - 2026-03-03

### Fixed
- Tour queries: change `publishedLocales: { contains }` to `{ in: [] }` for PostgreSQL compatibility
- Payload's `contains` operator uses ILIKE on hasMany select fields in PostgreSQL, causing query failures
- Affected: tours catalog page, tour detail related tours, homepage featured tours

## [1.0.2] - 2026-03-03

### Added
- `/api/init-db` endpoint for production database schema initialization (bypasses Next.js NODE_ENV compilation)

### Fixed
- Dockerfile: set NODE_ENV=development at runtime so Payload schema push works

## [1.0.1] - 2026-03-03

### Fixed
- Dockerfile: add ARG declarations for build-time env vars (DATABASE_URL, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL)

## [1.0.0] - 2026-03-03

### Added
- Favicon (SVG with navy bg, gold "B" letter)
- metadataBase for proper Open Graph URL resolution

### Fixed
- ESLint configuration for Next.js 15 + eslint 9 flat config
- TypeScript errors: ZodError.issues (not .errors), sitemap date casting
- Unused variable warnings in Button and BookingRequestForm
- Production build now passes cleanly (TypeScript + ESLint)

## [0.17.0] - 2026-03-03

### Added
- Production Dockerfile with multi-stage build (deps → builder → runner)
- .dockerignore for efficient builds
- Runs as non-root user (nextjs:nodejs)

## [0.16.0] - 2026-03-03

### Added
- Standalone output mode for production Docker builds
- Remote image patterns for R2 and bestpragueguide.com domains
- WebP/AVIF image format support via Sharp
- ISR with 1-hour revalidation on tour detail pages

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
