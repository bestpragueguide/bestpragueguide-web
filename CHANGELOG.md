# Changelog

All notable changes to this project will be documented in this file.

## [1.3.5] - 2026-03-04

### Added
- Customer language (EN/RU) shown in Slack booking notifications

## [1.3.4] - 2026-03-04

### Changed
- Currency selector (EUR/CZK/USD pills) moved to top of booking form as single price display with dynamic total
- Booking form shows total price at top (updates live when guests > 4 triggers surcharge)
- Removed duplicate static price block from tour detail sidebar — form handles price display with currency switching
- Surcharge note in guest selector simplified to text-only "+30% surcharge for group of 5–8"

## [1.3.3] - 2026-03-04

### Added
- Multicurrency price display on tour detail pages — EUR (primary) with secondary USD/CZK prices below
- Currency selector (EUR/CZK/USD pills) on booking form surcharge display
- `currency` field on BookingRequests collection and Zod schema (optional, default EUR)
- Shared `src/lib/currency.ts` module with `formatPrice`, `secondaryPrices`, rates, and symbols
- Fixed conversion rates: CZK = EUR x 25, USD = EUR x 1.25

### Changed
- All booking notifications (email, Telegram, WhatsApp, Slack) now show price in customer-selected currency
- Tour detail sidebar, StickyBookButton, and BookingModal show secondary prices (e.g. "≈ $624 / 12 475 Kč")
- Schema.org structured data unchanged — stays EUR only for SEO

## [1.3.2] - 2026-03-04

### Added
- Calculated total price (€) included in booking requests — stored in CMS, shown in admin email, Telegram, WhatsApp, and Slack notifications
- `totalPrice` field on BookingRequests collection (base price + surcharge for groups 5–8)

## [1.3.1] - 2026-03-04

### Changed
- Booking request rate limit increased from 5 to 20 requests/hour per IP

### Fixed
- Booking form now shows "Too many requests" message with phone number on 429 instead of generic error

## [1.3.0] - 2026-03-04

### Added
- Slack Incoming Webhook notifications for booking requests and contact messages (`src/lib/slack.ts`)
- Booking notifications use gold accent color, contact messages use blue
- Messages formatted with Slack Block Kit (header, fields grid, context block for IP/location)
- Env var: `SLACK_WEBHOOK_URL` — silently skips if not configured

## [1.2.9] - 2026-03-04

### Added
- Blog category filter pills on listing page (`/blog`) — filters posts by category via URL params
- Blog detail sidebar (desktop) with category list + post counts, popular articles, and "Choose a Tour" CTA
- Shared `src/lib/blog.ts` module with `categoryLabels` and `allCategories` constants
- IP address and geolocation (city, region, country, ISP) on booking requests — stored in CMS, shown in admin email, Telegram, and WhatsApp notifications
- Shared `src/lib/ip.ts` module with `getIpInfo` and `formatLocation` helpers (extracted from contact route)

### Changed
- Blog detail page layout changed from single-column `max-w-4xl` to 2-column `max-w-7xl` with 300px sidebar on desktop
- Blog listing page accepts `?category=` search param for server-side filtering
- Inline CTA on blog detail hidden on desktop (moved to sidebar)
- Contact route refactored to use shared `getIpInfo` from `src/lib/ip.ts`

## [1.2.8] - 2026-03-04

### Changed
- Reviews photo gallery shows 6 photos on mobile (3x2 grid), 7th photo hidden below `sm` breakpoint

## [1.2.7] - 2026-03-04

### Added
- Booking form auto-calculates and displays total price when group size is 5–8 (base + surcharge %)

## [1.2.6] - 2026-03-04

### Changed
- Tour itinerary times changed from exact clock times (10:00, 10:45) to relative durations (Start, +45 min) — customers choose their own starting time
- Contact form emails now sent from info@bestpragueguide.com (fixed RESEND_FROM_EMAIL env var)

## [1.2.5] - 2026-03-04

### Added
- Instagram link on contact page and footer
- Icons on all footer contact items (email, WhatsApp, Telegram, phone, Instagram)
- Customer confirmation email now includes a copy of submitted data (name, email, phone, message)

### Changed
- Contact emails sent from info@bestpragueguide.com (was noreply@) so customers can reply directly

## [1.2.4] - 2026-03-04

### Changed
- Contact form message minimum length reduced from 10 to 4 characters

## [1.2.3] - 2026-03-04

### Changed
- Contact form message limit reduced from 5000 to 1000 characters
- Shows "Message is too long" error when limit exceeded (EN/RU)

## [1.2.2] - 2026-03-04

### Fixed
- Contact form 400 errors on short input — added client-side `minLength`/`maxLength` validation matching server-side Zod schema (name ≥2, phone ≥3, message ≥10)

## [1.2.1] - 2026-03-04

### Fixed
- Admin dashboard 500 error — pushed missing `contact_messages_id` column to `payload_locked_documents_rels` table

### Changed
- IP geolocation switched from ipinfo.io to ip-api.com (free, no API key required)

## [1.2.0] - 2026-03-04

### Changed
- Rate-limited contact form submissions are now saved to CMS with "Rate Limited" status — no message is lost
- Rate limit error message now shows phone number (+420 776 306 858) so users can still reach us

## [1.1.9] - 2026-03-04

### Fixed
- Contact form phone validation too strict (min 5 chars) — reduced to min 3 chars to accept short international formats

### Changed
- Reviews page shows only reviews in the current site language — removed language filter buttons (All/EN/RU)

## [1.1.8] - 2026-03-04

### Added
- ContactMessages Payload CMS collection — all contact form submissions are now stored in the database and visible in admin panel under Bookings group
- Contact messages saved with name, email, phone, message, locale, IP geolocation, and status (new/read/replied)

### Fixed
- Reviews page now shows only reviews matching the current language by default (EN page shows EN reviews, RU page shows RU reviews)
- ReviewFilter component defaults to current locale instead of "All"

## [1.1.7] - 2026-03-04

### Fixed
- Contact form showing generic error on rate limit — now shows "Too many requests" message for 429 responses

### Changed
- Contact form rate limit increased from 5 to 20 requests/hour per IP

## [1.1.6] - 2026-03-04

### Added
- Phone number field (required) on contact form
- IP address and geolocation (city, region, country, ISP) in admin contact notifications (email + Telegram)
- IP geolocation via ipinfo.io with 3s timeout fallback

### Changed
- Contact form Zod schema now requires `phone` field (min 5 chars)

## [1.1.5] - 2026-03-04

### Added
- `buildPageMetadata` helper (`src/lib/metadata.ts`) for canonical URLs, hreflang alternates, OG, and Twitter card metadata
- Analytics event tracking utility (`src/lib/analytics.ts`) with GTM dataLayer + Yandex Metrika reachGoal integration
- `TourViewTracker` client component fires `tour_view` event on tour detail page mount
- Default branded OG image (`public/og-default.jpg`, 1200x630) as fallback for all pages
- Canonical URLs and hreflang alternates on all 10 static pages (homepage, tours, blog, about, reviews, contact, FAQ, privacy, terms, cancellation policy)
- OG image + Twitter card metadata on tour detail pages (hero image with fallback)
- Twitter card metadata on blog detail pages (with OG image fallback)
- Default OG + Twitter card metadata in layout.tsx (inherited by all pages)
- `booking_submit` analytics event on successful booking form submission
- `cta_click` analytics event on mobile "Book Now" sticky button
- `whatsapp_click` analytics event on floating WhatsApp button
- `siteName` and `alternateLocale` to tour and blog detail OG metadata

## [1.1.4] - 2026-03-04

### Added
- `Product` schema alongside `TouristTrip` on tour detail pages for price rich snippets in Google
- `priceSpecification` with `unitText: "per group"` on tour schema offers
- Hero image now passed to TourSchema for image-rich search results
- `BlogPostSchema` component with `BlogPosting` structured data (headline, author, publisher, dates, inLanguage)
- Blog post detail pages now render BlogPosting JSON-LD
- `WebSiteSchema` component with `WebSite` + `SearchAction` for sitelinks search box
- Homepage now renders WebSite JSON-LD
- `AggregateRating` + `LocalBusiness` JSON-LD on reviews page (calculated from approved reviews)
- Blog posts included in sitemap.xml with hreflang alternates and lastModified dates
- Blog listing page (`/blog`) added to sitemap static pages

### Fixed
- Sitemap: tours and blog posts not appearing — removed `select` option that fails with localized fields on PostgreSQL
- Sitemap: fetch tours/blogs per-locale (EN + RU) to get correct localized slugs for hreflang alternates
- Sitemap: force dynamic rendering — was statically pre-rendered at build time when DB was unreachable

## [1.1.3] - 2026-03-04

### Fixed
- Homepage category card images (Prague Tours, From Prague) returning 500 — corrected media filenames

## [1.1.2] - 2026-03-04

### Fixed
- Language switcher on tour and blog detail pages now redirects to the correct localized slug
- LanguageSwitcher reads hreflang metadata links for dynamic pages, with manual path mapping fallback
- CTA "Choose a Tour" button text stays visible after visiting the link (added `visited:` styles)
- Blog post and tour description rich text now properly formatted (headings, spacing, paragraphs)

### Added
- `@tailwindcss/typography` plugin for proper prose/rich text styling
- Contact form now sends emails via Resend (admin notification + customer confirmation) and Telegram notification

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
