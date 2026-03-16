# Changelog

All notable changes to this project will be documented in this file.

## [1.23.3] - 2026-03-16

### Fixed
- **Pricing info visible for all pricing models** — desktop sidebar and mobile booking modal now show pricing for PER_PERSON (€X per person), FLAT_RATE (€X per group), and ON_REQUEST tours, not only GROUP_TIERS

## [1.23.2] - 2026-03-16

### Fixed
- **Booking pricing description visibility** — pricing description text in desktop sidebar and mobile booking modal now only displays for tours with GROUP_TIERS pricing model, hidden for PER_PERSON, FLAT_RATE, and ON_REQUEST tours

## [1.23.1] - 2026-03-16

### Fixed
- **Tour order save fails in RU locale** — POST `/api/tour-order` now sends the active locale to `payload.update()`, preventing validation errors on RU-only tours that lack EN values for required fields (title, slug, excerpt, description)
- **Russian duration plural forms** — added `hoursLabel()` to `src/lib/plurals.ts` with correct 3-form Russian pluralization (1 час, 2–4 часа, 5+ часов) and fractional duration support (3.5 часа); tour detail page now uses it instead of a simple singular/plural check

## [1.23.0] - 2026-03-16

### Added
- **Mobile booking modal parity with desktop** — mobile booking modal now shows pricing table (group tiers), pricing description, and additional services before the booking form, matching the desktop sidebar layout

## [1.22.9] - 2026-03-16

### Fixed
- **Restored booking trust badges** — re-seeded 3 EN trust badges via API, added RU locale fix to `/api/fix-richtext` endpoint to insert missing RU translations for trust badges without triggering Payload's localized array overwrite bug

## [1.22.8] - 2026-03-16

### Fixed
- **RichText fixed toolbar missing in admin** — `FixedToolbarFeatureClient` was not in `importMap.js`, so the formatting toolbar never rendered for fields using `fullEditor`; added manually to importMap and set global default editor in `payload.config.ts` to use `FixedToolbarFeature` with full feature set (bold, italic, underline, link, lists, headings, blockquote, horizontal rule)

## [1.22.7] - 2026-03-16

### Changed
- **About page text-justify** — added `text-justify` to founder bio section for consistent paragraph alignment

## [1.22.6] - 2026-03-16

### Changed
- **Justify text alignment** — tour description, tour card excerpts, and legal pages (privacy, terms, cancellation) now use `text-justify` for cleaner paragraph alignment

## [1.22.5] - 2026-03-16

### Fixed
- **Pages richText toolbar missing** — added `fullEditor` to the `content` field in Pages collection; was using default Lexical editor with no formatting toolbar (headings, lists, blockquotes, etc.)

## [1.22.4] - 2026-03-15

### Fixed
- **Admin panel crash on filtered-out documents** — removed `baseFilter` from Tours and Reviews collections; `baseFilter` blocks direct document access (e.g., `/admin/collections/tours/55`) when the document doesn't match the current locale, causing a client-side crash instead of showing the document

### Reverted
- **Tours/Reviews admin locale filtering** — `baseFilter` removed from both collections; all documents now visible regardless of admin locale (use column filters to narrow by locale)

## [1.22.3] - 2026-03-15

### Added
- **Reviews admin locale filtering** — `baseFilter` on Reviews collection filters admin list by `language` matching selected locale (EN shows only English reviews, RU shows only Russian)

## [1.22.2] - 2026-03-15

### Changed
- **Booking form labels** — "Preferred Time" → "Start Time" (EN), "Желаемое время" → "Время начала" (RU); "Количество гостей" → "Сколько вас будет человек" (RU)

## [1.22.1] - 2026-03-15

### Fixed
- **FAQ 42 missing RU translation** — added Russian translation for "Do you accept USD, EUR and card payments?" FAQ; previously showed English text on RU homepage due to Payload locale fallback
- **Review locale data** — fixed all 8 reviews to have proper EN and RU translations (title + body) via fix-schema endpoint

## [1.22.0] - 2026-03-15

### Added
- **Homepage review filtering by locale** — testimonials slider now shows only reviews matching the current locale (EN reviews for EN, RU reviews for RU)
- **`showOnHomepage` flag on Reviews** — new checkbox to control which reviews appear in the homepage testimonials slider (replaces `featured` in homepage query)

## [1.21.1] - 2026-03-15

### Added
- **Booking pricing description in CMS** — `bookingPricingDescription` localized textarea in SiteSettings → Booking tab; renders below pricing table in tour detail sidebar
- **Related tours relationship** — `relatedTours` hasMany self-relationship on Tours collection with fix-schema SQL for `tours_rels` and `_tours_v_rels` tables

## [1.21.0] - 2026-03-15

### Added
- **Booking trust badges editable from CMS** — trust badges ("No payment until we confirm", "Free cancellation 24h before", "100% private") moved from hardcoded i18n/static text to `bookingTrustBadges` array in SiteSettings → Booking tab; localized, user-editable from admin panel
- **SiteSettings Booking tab** — new tab in admin panel for booking-related settings

### Changed
- **Rate-limited phone uses SiteSettings** — booking form rate-limit phone number now uses `contactPhoneDisplay` from SiteSettings instead of hardcoded value
- **BookingModal trust badges from CMS** — mobile modal trust badges now receive data from SiteSettings instead of hardcoded EN/RU strings

## [1.20.6] - 2026-03-15

### Fixed
- **Media upload failing for images matching configured size ratios** — `position: 'focalpoint'` is not a valid Sharp resize position; when Payload's aspect-ratio-match path passes config directly to Sharp, it throws. Changed to `position: 'centre'`; Payload's focal point cropping is handled separately via `focalPoint: true` on the upload config

## [1.20.5] - 2026-03-15

### Fixed
- **Media upload failing** — added `libc6-compat` and `vips-dev` Alpine packages to Docker runner stage + explicitly copy Sharp native binaries (`@img/sharp-*`); standalone output doesn't trace dynamically-loaded native modules, causing image resizing to fail

### Changed
- **Media alt text optional** — `alt` field no longer required; defaults to humanized filename (e.g., `photo_prague_castle.jpg` → `photo prague castle`) via `beforeChange` hook

## [1.20.4] - 2026-03-15

### Fixed
- **Media upload failing** — Sharp native binaries (`@img/sharp-*`) were not included in the Docker runner stage; Next.js standalone output doesn't trace dynamically-loaded native modules, so images >= 400x300 that trigger Sharp resizing would fail with "There was a problem while uploading the file"

## [1.20.3] - 2026-03-15

### Fixed
- **About page plain text rendering** — `SafeRichText` now splits plain strings by newlines into separate `<p>` tags instead of rendering as one unformatted block

## [1.20.2] - 2026-03-15

### Fixed
- **About page Lexical editor error** — added about-page global support to `/api/fix-richtext` endpoint to convert plain-text `founderBio` and `teamDescription` fields to Lexical JSON format in `about_page_locales` table

## [1.20.1] - 2026-03-15

### Fixed
- **Homepage 500 error** — removed `onError` event handlers from Hero and TourCard server components; event handlers are not supported in React Server Components and caused RSC serialization errors on the homepage

## [1.20.0] - 2026-03-15

### Added
- **Viewport metadata** — `export const viewport` with `device-width`, `initialScale: 1`, `maximumScale: 5` for proper mobile scaling
- **Back-to-top button** — `BackToTop` component appears after 400px scroll, fixed at bottom-left, smooth-scrolls to top
- **Homepage FAQ schema** — FAQPage JSON-LD structured data on homepage FAQ section (was only on /faq page)
- **Noscript fallbacks** — bilingual "enable JavaScript" messages on booking and contact forms for progressive enhancement
- **Form autocomplete** — `autoComplete` hints (name, email, tel) on booking and contact form inputs for browser autofill

### Changed
- **Image priority optimization** — `priority` prop on GuideProfile photo and first 2 FeaturedTours category cards for faster LCP
- **Analytics lazy loading** — Umami and Yandex Metrika scripts changed from `afterInteractive` to `lazyOnload` to reduce FID blocking
- **Sitemap lastmod** — static pages use fixed date (`2026-03-15`) instead of `new Date()` for consistent crawl signals
- **Success auto-dismiss** — booking and contact form success messages auto-reset after 5 seconds

## [1.19.1] - 2026-03-15

### Security
- **Next.js 15.3.9 → 15.4.11** — fixes 3 CVEs: SSRF via middleware redirect (GHSA-4342), cache key confusion for Image Optimization (GHSA-g5qg), content injection for Image Optimization (GHSA-xv57)
- **immutable 4.3.7 → 4.3.8** — fixes prototype pollution (GHSA-wf6x, High severity)
- Remaining 11 alerts are transitive dependencies locked by Payload CMS ecosystem — will resolve with upstream Payload updates

## [1.19.0] - 2026-03-15

### Fixed
- **Dockerfile** — changed `NODE_ENV=development` to `NODE_ENV=production` in CMD, enabling production optimizations and CSP headers
- **TourSchema/BlogPostSchema** — replaced hardcoded `bestpragueguide.com` domain with `NEXT_PUBLIC_SERVER_URL` for staging/preview compatibility
- **Form accessibility** — added `aria-invalid` and `aria-describedby` on booking form fields (date, name, email) and contact form (message) for screen reader error association
- **Blog image alt text** — blog listing cards now use `heroImage.alt` from Media collection, falling back to post title
- **Nav accessibility** — hamburger button gets `aria-expanded`, `aria-controls="mobile-menu"`, and locale-aware `aria-label`; mobile menu panel gets `id="mobile-menu"`
- **Filter accessibility** — tour filter buttons now have `aria-pressed` to announce active state to screen readers
- **Image error fallback** — TourCard and Hero images hide gracefully on load failure via `onError` handler, revealing background placeholder

### Added
- **Blog ISR caching** — `revalidate = 3600` on blog listing page (was re-rendering every request)
- **Empty states** — tours grid shows "No tours found for this category" when filter returns zero results; blog already had this
- **Shared constants** — `src/lib/constants.ts` with `FALLBACK_IMAGES` replacing duplicated hardcoded photo URLs in Hero and GuideProfile
- **i18n keys** — `tour.share`, `booking.perPersonAbbr` added to both EN/RU message files; replaces last hardcoded locale ternaries

## [1.18.0] - 2026-03-15

### Added
- **Security headers** — CSP, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`), Referrer-Policy (`strict-origin-when-cross-origin`), Permissions-Policy (camera/microphone/geolocation disabled) via `async headers()` in next.config.ts
- **Loading skeletons** — `loading.tsx` with animate-pulse placeholders for tour detail and blog detail routes (Suspense-based streaming)
- **PWA manifest** — `public/manifest.json` with theme-color `#C4975C`, background `#FAF7F2`, standalone display mode; layout metadata updated with manifest link, apple icon, and theme-color meta tags
- **Disposable email blocking** — `src/lib/email-validation.ts` with ~50 known disposable domains; integrated into both `/api/booking/request` and `/api/contact` routes
- **Server actions** — `src/app/actions/booking.ts` and `src/app/actions/contact.ts` replace client-side `fetch()` calls; BookingRequestForm and ContactForm now use server actions directly
- **Testing infrastructure** — Vitest setup with `@` path aliases; 62 unit tests (51 pricing engine + 11 email validation), all passing

### Changed
- **CMS type safety** — added `LexicalRichText`, `TourData`, `TourGalleryItem`, `TourListItem`, `TourFaqItem` interfaces in `src/lib/cms-types.ts`; removed all 18 `(tour as any)` casts from tour detail page
- **API caching headers** — `Cache-Control: public, s-maxage=60, stale-while-revalidate=120` on tour-order GET; `s-maxage=10, stale-while-revalidate=30` on health endpoint

## [1.17.1] - 2026-03-15

### Changed
- **Universal share button** — on mobile devices, ShareButtons uses the native Web Share API (opens OS share sheet with WhatsApp, Telegram, Instagram, and all installed apps); on desktop, falls back to individual buttons (WhatsApp, Telegram, Facebook, Twitter/X, LinkedIn, copy link)

## [1.17.0] - 2026-03-15

### Added
- **Social share buttons** — new `ShareButtons` component (Facebook, Twitter/X, LinkedIn, copy link) on tour detail and blog post pages
- **Print-friendly styles** — `@media print` CSS hides nav/footer/sticky elements, optimizes layout for A4 printing
- **Redis rate limiting** — shared `src/lib/rate-limit.ts` using Redis sorted sets with sliding window; falls back to in-memory when `REDIS_URL` is unset
- **i18n `pages` namespace** — 23 new translation keys (EN/RU) covering all remaining hardcoded locale ternaries across about, blog, contact, FAQ, reviews, and tours pages
- **i18n `tour.perPerson` / `tour.perGroup`** — new keys for StickyBookButton price labels

### Changed
- **Blog detail ISR** — switched from `force-dynamic` to `revalidate=3600` (1-hour ISR) matching tour detail page caching strategy
- **StickyBookButton i18n** — replaced 5 hardcoded locale ternaries with `useTranslations` calls
- **ContactForm i18n** — replaced 4 hardcoded locale ternaries with `useTranslations('pages')` calls
- **Loading spinners** — booking and contact form submit buttons now show animated spinner during submission
- **WhatsApp button positioning** — increased mobile bottom offset (`bottom-24`) to prevent overlap with StickyBookButton

### Removed
- **Dead code cleanup** — removed unused `TourReviews` import, `getTourReviews` function, and `reviewCards` mapping from tour detail page
- **Duplicate rate limiting** — replaced per-route in-memory rate limit maps with shared utility in both `/api/booking/request` and `/api/contact`

## [1.16.2] - 2026-03-15

### Added
- **Error boundary** — new `error.tsx` client component with bilingual error message and reset button for graceful runtime error handling
- **i18n `tour` namespace** — 10 new translation keys (EN/RU) for tour detail page: breadcrumb, duration, meeting point, pricing, services sidebar, trust badges
- **i18n `booking` additions** — 10 new keys (EN/RU) for booking form: totalPrice, sending, rateLimitTitle, errorSend, onRequest, exactPriceOnRequest, additionalServices, guestCategoriesDefault, free, perPerson

### Changed
- **Tour detail i18n cleanup** — replaced all hardcoded `locale === 'ru' ? ... : ...` ternaries with `getTranslations()` calls using `tour`, `booking`, and `common` namespaces
- **Booking form i18n cleanup** — replaced 9 hardcoded locale ternaries with `useTranslations('booking')` calls
- **404 page locale-aware** — rewritten as client component using `useTranslations('notFound')` for proper bilingual 404 messages
- **robots.txt dynamic domain** — uses `NEXT_PUBLIC_SERVER_URL` env var instead of hardcoded `bestpragueguide.com`
- **OrganizationSchema enhanced** — added `geo` coordinates (Prague), `priceRange`, `image`, and `areaServed` for richer structured data

### Fixed
- **Accessibility: skip-to-content** — added skip navigation link in layout, `id="main-content"` on `<main>` element
- **Accessibility: lightbox keyboard navigation** — added `role="dialog"`, `aria-modal`, `aria-label`, and `onKeyDown` handler for Escape/Arrow keys on ImageGallery

## [1.16.1] - 2026-03-15

### Changed
- **Booking form "Total Price" label** — added "Total Price" / "Итого" title above the calculated price in the booking form
- **Removed reviews from tour detail** — TourReviews section hidden on tour detail pages (all locales)

## [1.16.0] - 2026-03-14

### Added
- **Custom preferred times per tour** — optional `preferredTimes` select (hasMany) field on Tours collection allows setting specific available booking times (e.g., 16:00 and 20:00 only); when empty, default 9:00–18:00 range with 30-min steps is shown; time options range from 00:00 to 23:30
- **`POST /api/fix-preferred-times`** — schema migration endpoint for `preferredTimes` tables (creates `tours_preferred_times` + `_tours_v_version_preferred_times`)
- **`GET /api/fix-preferred-times`** — debug endpoint listing all tours-related table names and column structures

## [1.15.5] - 2026-03-14

### Fixed
- **Internal links in tour descriptions** — richText internal links (e.g., "замка Карлштейн" on Konopiste tour) now resolve to actual tour URLs instead of `href="#"`
  - Added `src/lib/richtext.ts` — server-side `resolveRichTextLinks()` walks Lexical JSON tree, batch-fetches doc slugs from Payload, populates link nodes
  - Tour detail page uses Payload's `RichText` component with custom `LinkJSXConverter` and `internalDocToHref` callback for locale-aware URLs
  - `SafeRichText` component updated to handle internal links for tours, blog-posts, and pages collections
- **Pricing tier display** — restored `maxGuests` values for non-last tiers across all 14 tours (were incorrectly cleared by the "Remove Max Group" migration, showing "1+, 4+, 8+, 13+" instead of "1-3, 4-7, 8-12, 13+")
  - Added `POST /api/fix-tier-maxguests` endpoint using SQL LEAD() window function to derive maxGuests from next tier's minGuests
  - Fixed 28 rows in main table, 148 in version table
- **Homepage guideBio Lexical error** — converted plain text string in RU locale to proper Lexical JSON format (was causing "value passed to the Lexical editor is not an object" error in admin)

### Added
- **`POST /api/restore-media`** — temporary endpoint to restore media files to container filesystem from multipart upload (writes directly to MEDIA_DIR, skips existing files, auth via x-init-secret)
- **`GET /api/restore-media`** — returns current media directory file count

## [1.15.4] - 2026-03-14

(restore-media endpoint moved to 1.15.5)

## [1.15.3] - 2026-03-10

### Changed
- **Unlimited group size by default** — removed default maxGroupSize=8 from Tours, removed hardcoded maxGuests from legacy pricing fallbacks and seed data; when no limit is set, booking form shows up to 50 guests
- **Migration endpoint** — `POST /api/migrate/clear-max-guests` clears existing maxGroupSize and groupTiers.maxGuests from all tours

## [1.15.2] - 2026-03-09

### Infrastructure
- **Mautic API enabled** — OAuth2 credentials created (bestpragueguide-web), MAUTIC_CLIENT_ID + MAUTIC_CLIENT_SECRET env vars set
- **n8n webhooks configured** — 4 webhook workflows created and activated (W-01 booking-new, W-02 booking-confirmed, W-03 tour-completed, W-04 payment-received), webhook URLs set as env vars
- **Formbricks surveys created** — EN and RU tour feedback surveys with hidden fields (bookingRef, customerName, tourTitle), FORMBRICKS_SURVEY_EN + FORMBRICKS_SURVEY_RU env vars set
- **Chatwoot inbox created** — website channel for bestpragueguide.com with widget token, admin agent assigned
- **n8n admin account** — owner account created with API key (no expiration)

## [1.15.1] - 2026-03-08

### Infrastructure
- **OSS services deployed** — all 6 services running on prod01 via Coolify:
  - n8n (n8n.bestpragueguide.com) — webhook automation hub
  - Chatwoot (chat.bestpragueguide.com) — customer messaging
  - Mautic (mail.bestpragueguide.com) — email automation
  - Formbricks (survey.bestpragueguide.com) — NPS/feedback surveys
  - Twenty CRM (crm.bestpragueguide.com) — customer relationship management
  - Uptime Kuma (status.bestpragueguide.com) — uptime monitoring with 6 monitors
- **Environment variables configured** — CHATWOOT_*, TWENTY_*, FORMBRICKS_*, MAUTIC_*, N8N_WEBHOOK_* env vars set on production app
- **Admin accounts created** — Chatwoot, Twenty CRM, Formbricks, Uptime Kuma initialized with admin credentials

## [1.15.0] - 2026-03-08

### Added
- **n8n webhook client** (`src/lib/n8n.ts`) — fire-and-forget webhook hub with 4 payload types: bookingNew, bookingConfirmed, tourCompleted, paymentReceived
- **n8n booking hook** — added n8n.bookingNew() to booking request API notification array
- **PaymentConfig global** (`src/globals/PaymentConfig.ts`) — admin-configurable deposit %, payment deadline, cash currencies, exchange rates
- **Stripe library** (`src/lib/stripe.ts`) — Checkout session creation for deposits and refund helper
- **Send payment link API** (`/api/booking/send-payment-link`) — auth-gated admin endpoint to create Stripe Checkout sessions
- **Stripe webhook handler** (`/api/stripe/webhook`) — handles checkout.session.completed, updates booking payment status
- **PaymentLinkButton admin component** — "Send Payment Link" button on confirmed bookings in admin panel
- **Payment result pages** — payment-success and payment-cancelled pages with EN/RU i18n
- **BookingRequests payment fields** — paymentStatus, depositAmountEur, cashBalanceEur, npsScore, stripe fields, paidAt, chatwootConversationId, mauticContactId, twentyContactId
- **BookingRequests capacity hook** — auto-updates TourDate.confirmedGuests when booking status changes
- **Chatwoot client** (`src/lib/chatwoot.ts`) — API helper for private notes and booking note formatter
- **Mautic client** (`src/lib/mautic.ts`) — OAuth2 client with token caching and contact upsert
- **Formbricks URL builder** (`src/lib/formbricks.ts`) — pre-filled survey link generator for EN/RU
- **Twenty CRM client** (`src/lib/twenty-crm.ts`) — GraphQL client with person find-or-create
- **TourDates collection** (`src/collections/TourDates.ts`) — availability calendar with capacity tracking, auto-status
- **Availability API** (`/api/availability/[tourSlug]`) — public GET endpoint for calendar date slots
- **AvailabilityCalendar component** — interactive month calendar with color-coded availability
- **TourBookingSection component** — wraps calendar + booking modal with date pre-fill
- **Health check API** (`/api/health`) — lightweight DB check for Uptime Kuma monitoring
- **Migration SQL scripts** — phase2-payment-config.sql and phase7-tour-dates.sql fallbacks
- **Booking.payment i18n keys** — EN/RU translations for payment success/cancelled pages

### Fixed
- **tour_dates migration SQL** — fixed column types: collection id must be `serial` (not `varchar`), tour_id must be `integer`, locale column must be `_locale` (Payload convention)

### Changed
- **BookingModal** — added defaultDate/defaultTime props for calendar integration
- **BookingRequestForm** — added defaultDate/defaultTime props
- **payload.config.ts** — registered PaymentConfig global and TourDates collection
- **importMap.js** — registered PaymentLinkButton admin component
- **i18n/routing.ts** — added /booking/payment-success and /booking/payment-cancelled routes

## [1.14.1] - 2026-03-08

### Added
- **Tour order page** — standalone drag-and-drop page at `/tour-order` for reordering tours; linked from admin sidebar
- **Admin tour list filtering** — tour list view filters by current admin locale (EN shows EN-published tours, RU shows RU-published tours)

### Changed
- **Blog cards** — removed publish date from blog list cards
- **Blog detail** — removed publish date and author name from blog post header

### Documentation
- **System specification** — comprehensive `docs/SYSTEM-SPECIFICATION.md` covering data model, pricing engine, booking flow, notifications, i18n, SEO, analytics, deployment, and extension points
- **CLAUDE.md** — updated with frontend pages, API routes, SEO, admin tools, middleware, and deployment sections

### Fixed
- **Tour Order admin link** — fixed import map registration for TourOrderLink component so it appears in admin sidebar
- **Admin tour list locale filter** — switched from deprecated `baseListFilter` to `baseFilter` for reliable locale-based filtering
- **Tour order locale support** — added EN/RU language toggle to tour order page; each locale shows and reorders only its published tours

## [1.13.0] - 2026-03-08

### Added
- **Cookie consent banner** — shows on first visit, hides after acceptance (persisted in localStorage), links to privacy policy, bilingual (EN/RU)
- **Instagram icon in footer** — gold-colored Instagram icon link from SiteSettings
- **Language switcher in mobile header** — always visible next to hamburger menu

### Changed
- **Contact page** — removed Instagram link and embedded Google Map
- **Locale detection** — visitors from RU-speaking regions see Russian version by default (next-intl `localeDetection`)

### Removed
- **Language switcher from mobile menu** — moved to header for constant visibility

## [1.12.0] - 2026-03-08

### Added
- **Tour order drag-and-drop** — custom admin view at `/admin/tour-order` for reordering tours via drag-and-drop; order syncs to website via `sortOrder` field
- **Tour Order nav link** — added link in admin sidebar navigation

## [1.11.0] - 2026-03-08

### Added
- **Logo mark** — SVG icon (italic gold "BPG" on navy rounded square) used as favicon (`LogoMark` component available for standalone use)

### Changed
- **Favicon** — updated favicon.svg and favicon.ico with new logo mark design (16, 32, 48, 256px)

## [1.10.4] - 2026-03-07

### Changed
- **Tour cards** — removed rating stars and duration from tour cards (listing, homepage, related tours)

## [1.10.3] - 2026-03-07

### Added
- **Duration info** on tour detail page — shown above description with clock icon

## [1.10.2] - 2026-03-07

### Fixed
- **Related tours** — only show "You May Also Like" section when admin has explicitly selected related tours (removed auto-fallback to same-category tours)
- **Lexical editor errors** — migrate-richtext endpoint now processes both EN and RU locales, converting plain text strings to Lexical format in all richText fields

## [1.10.1] - 2026-03-07

### Changed
- **Blog cards** — removed category tag badge overlay from blog post cards

## [1.10.0] - 2026-03-07

### Added
- **Related tours** (`relatedTours` field) — admin can select which tours appear in "You May Also Like" section; falls back to same-category tours if empty
- **Tabs in Tour admin** — Content, Images, Pricing, SEO tabs for better organization
- Sidebar fields: slug, publishedLocales, status, sortOrder, rating, reviewCount

### Changed
- **"You May Also Like" RU heading** — changed from "Похожие экскурсии" to "Смотрите также"

## [1.9.0] - 2026-03-07

### Added
- **Tour import endpoint** (`/api/import-tours`) — imports 32 tours from ulitravel.com with descriptions, durations, hero images and gallery photos from tildacdn.com
- All imported tours use ON_REQUEST pricing model, RU-only locale
- Automatic slug generation from Russian titles (transliteration)
- Auto-categorization: prague-tours vs day-trips-from-prague based on title keywords and duration

### Changed
- **Tour catalog**: replaced 18 seed RU-only tours with 32 real tours from ulitravel.com

## [1.8.7] - 2026-03-07

### Fixed
- **RU translation**: replaced "приватно/приватная" with "индивидуально/индивидуальная" across all files (i18n, booking modal, tour detail, seed data)

## [1.8.6] - 2026-03-07

### Fixed
- **Guide photo** on homepage — restored horizontal (4:3 landscape) aspect ratio while keeping 40:60 layout split

## [1.8.5] - 2026-03-07

### Fixed
- **Localize pricing labels** in `calculatePrice()` — basePriceLabel (e.g., "1–2 guests") now uses locale-aware text throughout all pricing models (GROUP_TIERS, PER_PERSON, FLAT_RATE, ON_REQUEST)

## [1.8.4] - 2026-03-07

### Fixed
- **Russian plural forms** for guest labels — now uses correct 3-form pluralization (1 гость, 2-4 гостя, 5+ гостей) in booking form dropdown and pricing table
- Added shared `src/lib/plurals.ts` helper with `guestsLabel()` and `ruPlural()` functions

## [1.8.3] - 2026-03-07

### Changed
- **Guide profile photo** on homepage enlarged — 40:60 photo-to-text ratio (was 33:66), portrait aspect ratio for bigger visual presence

## [1.8.2] - 2026-03-07

### Removed
- Temporary `fix-schema` API endpoint (no longer needed after DB columns were added)

## [1.8.1] - 2026-03-07

### Added
- **Configurable guest categories heading** — admin can set custom title per tour (e.g., "Zoo/Museum Ticket", "Entry Tickets") via `pricing.guestCategoriesHeading` (localized)
- Updated admin descriptions for guest categories to clarify they support any guest option (tickets, age categories, etc.)

## [1.8.0] - 2026-03-07

### Added
- **Selectable additional services** in booking form — checkboxes with dynamic price calculation
- **Guest category breakdown** in booking form — per-category counters with price modifiers (e.g., Junior +€10)
- Service and category selections included in booking request submission data

## [1.7.3] - 2026-03-07

### Fixed
- Guest selector now shows "X+ guests" as last option when last pricing tier has no upper cap, instead of listing individual numbers up to 20
- `getMaxGuests()` returns `minGuests` of open-ended last tier so dropdown ends with that value

## [1.7.2] - 2026-03-07

### Fixed
- `getMaxGuests()` default raised from 8 to 20 when last tier has no maxGuests and tour has no maxGroupSize — supports open-ended "5+ guests" tiers

## [1.7.1] - 2026-03-07

### Added
- Group tiers pricing table in tour detail sidebar — shows tier breakdown above booking form
- Additional services display in tour detail sidebar — shows service names with prices

### Fixed
- `getMaxGuests()` now includes on-request tiers when determining max selectable guests (was excluding them, limiting guest dropdown)

## [1.7.0] - 2026-03-07

### Added
- **Flexible tour pricing system** — 4 pricing models: GROUP_TIERS, PER_PERSON, FLAT_RATE, ON_REQUEST
- `src/lib/pricing.ts` — shared pricing engine (`calculatePrice`, `getDisplayPrice`, `getMaxGuests`, `validateGuestBreakdown`)
- `src/collections/Services.ts` — new Services collection for reusable add-on services (entry tickets, vehicles, restaurants, etc.)
- `src/components/tours/PriceDisplay.tsx` — shared pricing display component (card, detail, sticky variants)
- `pricing` group on Tours collection with model selector, group tiers, per-person, flat rate, and on-request fields
- Guest categories and additional services fields on Tours pricing group
- `requireGuestBreakdown` option on Services for per-person entry ticket validation

### Changed
- BookingRequestForm now uses `calculatePrice()` for dynamic pricing based on guest count
- BookingModal and StickyBookButton use `getDisplayPrice()` for price header
- TourCard uses `PriceDisplay` component instead of hardcoded `€{groupPrice}`
- TourSchema handles optional price (ON_REQUEST tours omit price from schema.org)
- Guest selector range is now dynamic based on `getMaxGuests()` instead of hardcoded 1-8
- Booking validation schema allows up to 50 guests (was hardcoded max 8)
- Notification formatters (Telegram, WhatsApp, Slack) show "On Request" for on-request bookings
- Seed script now populates new `pricing.model` and `pricing.groupTiers` fields alongside legacy `groupPrice`

### Fixed
- Production DB schema: manually created pricing tables via SQL migration (pushDevSchema hangs in prod)
- Array table `id` columns changed from `serial` (integer) to `varchar` — Payload 3.x generates string ObjectIds for array rows, causing "invalid input syntax for type integer" on save
- Missing `_uuid` column on all Payload 3.x array tables (required for row tracking)
- Missing `service_id` column on `tours_pricing_additional_services` and version table
- Missing `services_id` on `payload_locked_documents_rels` (required for new Services collection)
- Migrated all 21 existing tours from legacy `groupPrice` to `GROUP_TIERS` pricing model with group tier rows

### Deprecated
- `groupPrice` and `groupSurchargePercent` fields on Tours collection (kept as hidden fields for backward compatibility)

## [1.6.4] - 2026-03-07

### Added
- Comprehensive implementation plan for flexible tour pricing system (`docs/plans/2026-03-07-tour-pricing-configuration.md`)
  - 4 pricing models: GROUP_TIERS, PER_PERSON, FLAT_RATE, ON_REQUEST
  - Services collection for reusable add-ons (entry tickets, vehicles, etc.)
  - Guest category breakdown with sum-to-group-size validation
  - 14-task implementation plan with dependency graph

## [1.6.3] - 2026-03-07

### Fixed
- Mobile hero image not showing: `mobileHeroImage` field was missing from `getHomepageData()` return object
- Linked `heroBackgroundImage` (id=17) and `mobileHeroImage` (id=74) to Homepage global in production

## [1.6.2] - 2026-03-07

### Added
- `RefreshOnSave` component — wires Payload Live Preview to auto-refresh frontend on admin save
- Homepage hero `<picture>` element with `mobileHero` source for mobile devices
- `mobileHeroImage` field on Homepage global — upload separate mobile-optimized hero image with its own crop/focal point
- `patch-package` for patching Payload bugs until upstream fixes

### Changed
- Replaced unused `LivePreviewListener` with `RefreshRouteOnSave` from `@payloadcms/live-preview-react`
- Homepage hero switched from Next/Image to `<picture>` element for responsive image serving
- Guide photo: horizontal landscape (4:3), 1/3 image + 2/3 text layout
- Reduced vertical padding on all homepage sections (`py-10 lg:py-14`)
- Tour detail page: title moved above gallery, removed category/duration/difficulty/rating badges
- Upgraded Payload packages from 3.78.0 to 3.79.0

### Fixed
- Live preview 404: locale parameter is an object in Payload 3.x, now extracts `.code`
- Added `serverURL` to `payload.config.ts` for live preview communication
- Patched Payload `@payloadcms/ui` destructure bug on page navigation (`livePreviewURL` undefined guard)

### Removed
- `LivePreviewListener` component (was never imported; replaced by `RefreshOnSave`)

## [1.6.1] - 2026-03-06

### Changed
- Rename tour category "From Prague" → "Day Trips from Prague" (EN) / "Однодневные поездки из Праги" (RU)
- Category URL slug changed from `from-prague` to `day-trips-from-prague`
- Updated in: Tours collection, i18n messages, navigation fallbacks, filters, seed scripts, tour detail breadcrumb

## [1.6.0] - 2026-03-06

### Added
- Enhanced image system with focal point positioning (all sizes use `focalpoint` instead of `centre`)
- Mobile-optimized image sizes: `mobileHero` (800x600) and `mobileCard` (480x480)
- Optional mobile hero image and mobile gallery images per tour
- `objectFit` control (cover/contain/fill) per gallery image
- `<picture>` element with mobile `<source>` in TourCard, ImageGallery, and Hero
- Focal point CSS `object-position` applied to all image components
- Localized alt text from Media collection rendered in all image components
- Rich text (Lexical) editor on all content textarea fields across collections and globals
- Simplified editor config (bold, italic, underline, link, list) for short content
- Full editor config (+ headings, ordered list, blockquote, hr) for long content
- `SafeRichText` component for backward-compatible rendering (handles plain text and Lexical JSON)
- Payload Live Preview configuration with Mobile/Tablet/Desktop breakpoints
- `LivePreviewListener` client component for real-time admin preview
- `/api/migrate-richtext` endpoint for converting existing plain text to Lexical format

### Changed
- Media collection image sizes now use `position: 'focalpoint'` for admin-set focal point crops
- Tours: `excerpt`, `included[].text`, `excluded[].text`, `faq[].answer`, `meetingPoint.instructions` converted to richText
- Reviews: `body`, `guideResponse` converted to richText
- BookingRequests: `specialRequests`, `internalNotes` converted to richText
- ContactMessages: `message`, `internalNotes` converted to richText
- BlogPosts: `excerpt` converted to richText
- Homepage: `guideBio` converted to richText
- AboutPage: `founderBio`, `teamDescription` converted to richText
- All frontend components updated to render richText via SafeRichText helper
- `extractPlainText()` helper for richText → plain text conversion (used in listings, meta tags, schema.org)

### Fixed
- SafeRichText uses custom Lexical renderer instead of `@payloadcms/richtext-lexical/react` (avoids SSR issues)
- Blog listing, tour cards, testimonials, schema.org data now correctly extract plain text from richText fields
- Meta description tags correctly extract plain text from richText excerpts

## [1.5.3] - 2026-03-06

### Removed
- `highlights` and `itinerary` fields from Tours collection (removed from admin and database schema)
- `TourItinerary` component and its usage on tour detail pages
- `/api/migrate-itinerary` endpoint
- Highlights and itinerary data from seed script

## [1.5.2] - 2026-03-06

### Removed
- Category and subcategory props from TourCard component (cleanup after badge removal)

## [1.5.1] - 2026-03-06

### Changed
- Show full tour excerpt in tour cards instead of truncating to 2 lines

### Removed
- Category badge overlay from tour card images

## [1.5.0] - 2026-03-06

### Added
- Google Analytics 4 (GA4) component with `NEXT_PUBLIC_GA_ID` env var (G-DFLT0NBRFK)
- Self-hosted Umami analytics integration with `NEXT_PUBLIC_UMAMI_WEBSITE_ID` and `NEXT_PUBLIC_UMAMI_SRC` env vars
- Umami deployed as Docker Compose service on Coolify (prod01) at analytics.bestpragueguide.com
- Both analytics components use `afterInteractive` strategy and no-op when env vars are unset

## [1.4.8] - 2026-03-06

### Fixed
- Enable crop and focal point on Media collection — adds `crop: true` and `focalPoint: true` to upload config

## [1.4.7] - 2026-03-06

### Removed
- Team section from About page (heading, description, team photos, badges)

## [1.4.6] - 2026-03-06

### Removed
- Telegram link from contact page

## [1.4.5] - 2026-03-05

### Changed
- Footer "Tours" column now shows tour categories (All Tours, Prague Tours, From Prague) instead of a single "Tours" link

## [1.4.4] - 2026-03-05

### Added
- Seed legal pages (Privacy Policy, Terms of Service, Cancellation Policy) into Pages collection via `/api/seed-cms` endpoint
- Full bilingual (EN/RU) richText content with headings, paragraphs, SEO metadata, and `lastUpdated` field
- Legal pages now render from CMS content with i18n fallback

## [1.4.3] - 2026-03-05

### Fixed
- Fix Cormorant Garamond and DM Sans fonts not rendering — `@theme` CSS variables contained `var()` references to next/font variables that only exist on `<body>`, not at `:root` where `@theme` generates its values. Now `@theme` uses direct font names as fallback, and `body` overrides with next/font optimized versions.

## [1.4.2] - 2026-03-05

### Fixed
- Load Cormorant Garamond italic font variant (true italic instead of synthesized)
- Logo always center-aligned in header and footer (matching BPG_Logo_Final reference)
- Footer redesigned to match reference: centered logo block with association text, contact links row (email · WhatsApp · phone), then navigation columns below

## [1.4.1] - 2026-03-05

### Changed
- Logo now shows locale-aware tagline in header and footer (EN: "Private Tours in Prague & Czech Republic", RU: "Индивидуальные экскурсии по Праге и Чехии")
- Header logo tagline visible on all screen sizes (8px compact)
- Footer logo includes association membership text (EN/RU)

## [1.4.0] - 2026-03-05

### Added
- Full CMS editability — all site content now manageable from Payload admin panel
- Navigation global (`src/globals/Navigation.ts`) — header links, CTA button, footer columns, license/copyright text
- Homepage global (`src/globals/Homepage.ts`) — hero, trust bar, guide profile, categories, process steps, testimonials, FAQ section, CTA, SEO
- AboutPage global (`src/globals/AboutPage.ts`) — founder, stats, team, values, gallery, CTA, SEO
- ReviewsPage global (`src/globals/ReviewsPage.ts`) — heading, photo gallery, SEO
- FAQs collection (`src/collections/FAQs.ts`) — question/answer (richText), category, sortOrder, showOnHomepage flag
- Data-fetching layer (`src/lib/cms-data.ts`) with hardcoded fallbacks for all globals
- TypeScript interfaces (`src/lib/cms-types.ts`) for all CMS data structures
- SVG icon registry (`src/lib/icon-map.tsx`) for trust bar and process step icons
- FAQSectionWrapper server component for homepage FAQ section
- RichTextRenderer component for legal page CMS content
- CMS seed endpoint (`/api/seed-cms`) — populates all globals and FAQ items in EN+RU
- Legal pages (privacy, terms, cancellation) check Pages collection first, fall back to i18n

### Changed
- SiteSettings global enhanced with tabs (General, Contact, Social, Location, Announcement) and new fields
- Pages collection supports `legal` template with `lastUpdated` field
- Layout fetches SiteSettings + Navigation globals, passes as props to Nav, Footer, WhatsAppButton
- Nav, MobileMenu, Footer migrated from i18n to CMS data props
- All homepage components (Hero, TrustBar, GuideProfile, FeaturedTours, ProcessSteps, TestimonialSlider, FAQSection, CTASection) migrated to CMS props
- About, FAQ, Reviews, Contact pages fetch data from CMS globals/collections
- WhatsAppButton accepts phone + message template props from CMS
- ContactForm accepts phoneDisplay prop from CMS
- SEO metadata on all pages uses CMS fields with i18n fallback
- Cleaned ~117 migrated keys from i18n JSON files (removed nav, hero, trustBar, guideProfile, process, testimonials, faqSection, cta, footer, about namespaces)

## [1.3.7] - 2026-03-05

### Added
- Branded typographic logo component (`src/components/shared/Logo.tsx`) — "Best *Prague* Guide" with italic gold Cormorant Garamond, 3 variants (sm/default/footer)
- Header nav uses compact logo (22px, no tagline)
- Footer uses white logo (28px) with tagline "Private Tours in Prague & Czech Republic"

### Changed
- Nav and Footer replaced plain-text "Best Prague Guide" with Logo component

## [1.3.6] - 2026-03-04

### Added
- Tour duration shown in itinerary heading — e.g. "Itinerary (4 hours)" / "Маршрут (4 часа)"

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
