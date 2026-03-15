# bestpragueguide-web

Bilingual (EN/RU) private tour portal for Prague.

## Stack
- Next.js 15 (App Router) + Payload CMS 3.x (modular monolith)
- PostgreSQL 16, Redis 7
- Tailwind CSS 4, next-intl
- Resend + React Email for transactional emails
- Deploy: Coolify on Hetzner, Cloudflare CDN/R2

## Project Structure
- `src/app/(payload)/` — Payload admin panel and API routes
- `src/app/(frontend)/[locale]/` — Public-facing pages with i18n
- `src/app/tour-order/` — Standalone admin page (tour drag-and-drop reordering)
- `src/collections/` — Payload CMS collection configs (Tours, Reviews, Pages, FAQs, BlogPosts, BookingRequests, ContactMessages, Media, Services, TourDates)
- `src/globals/` — Payload CMS global configs (SiteSettings, Navigation, Homepage, AboutPage, ReviewsPage, PaymentConfig)
- `src/components/` — React components (shared, layout, home, tours, blog, booking, reviews, seo, analytics, admin)
- `src/emails/` — React Email templates
- `src/lib/` — Utilities (cms-data, cms-types, constants, icon-map, email, email-validation, telegram, whatsapp, slack, booking, blog, ip, currency, pricing, metadata, analytics, editors, plurals, n8n, stripe, chatwoot, mautic, formbricks, twenty-crm, richtext, rate-limit)
- `migrations/` — Fallback SQL scripts for schema changes when /api/init-db hangs
- `src/i18n/` — next-intl routing, request config, message files (EN/RU)

## CMS Architecture
All site content is editable from Payload admin panel:

### Globals
- **SiteSettings** — contact info, social links (Instagram, YouTube, TripAdvisor, Google Business), map coordinates, WhatsApp templates, license/copyright, announcement banner
- **Navigation** — header links, CTA button, footer columns with links
- **Homepage** — hero (tagline, subtitle, CTA, background image, mobile image), trust bar items, guide profile, categories grid, process steps, testimonials heading, FAQ heading, CTA section, SEO
- **AboutPage** — founder profile (photo, bio, quote), stats, team section, values, gallery, dual CTAs, SEO
- **ReviewsPage** — page heading, photo gallery, SEO

### Collections
- **Tours** — tour listings organized in tabs (Content, Images, Pricing, SEO) with `relatedTours` relationship for admin-selectable "You May Also Like" section; pricing, gallery, included/excluded items, FAQ, meeting point, difficulty, tags; `publishedLocales` (select hasMany: en/ru) controls visibility per locale; `sortOrder` controls display order; `baseFilter` filters admin list by current locale; `preferredTimes` (select hasMany, 00:00–23:30) — optional custom booking time slots, falls back to default 9:00–18:00
- **Services** — reusable add-on services (entry tickets, vehicles, restaurants) with own pricing models (per_person, per_group, flat, on_request) and guest category pricing
- **Reviews** — customer reviews with rating (1-5), reviewer name/country, tour reference, guide response, language, featured flag
- **BlogPosts** — blog articles with richText content, categories (prague-guide, food-and-drink, day-trips, tips, history), heroImage, SEO fields, `publishedLocales`
- **FAQs** — question/answer (richText), category, sortOrder, showOnHomepage flag
- **Pages** — legal pages (privacy, terms, cancellation) with richText content, template selector
- **BookingRequests** — booking submissions (tour, date, time, guests, customer info, price, currency, status, IP geolocation, internal notes)
- **ContactMessages** — contact form submissions (name, email, phone, message, locale, IP info, status)
- **Media** — images with focal point, 6 sizes, localized alt text and caption

### Data Flow
- `src/lib/cms-data.ts` — async functions with hardcoded fallbacks for all globals
- Layout fetches SiteSettings + Navigation → passes as props to Nav, Footer, WhatsAppButton
- Homepage fetches Homepage global + FAQs → distributes to child components
- Standalone pages (about, reviews, faq, contact) fetch their respective globals/collections
- Legal pages try Pages collection first, fall back to i18n
- Client Components receive CMS data as serialized props from parent Server Components
- Never use `select` option in payload.find() — fails silently on localized fields in PostgreSQL

## Frontend Pages

### Public Routes (`/[locale]/...`)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Hero, trust bar, guide profile, featured tours, process steps, testimonials, FAQ, CTA |
| `/tours` | Tour Catalog | TourGrid with filters (category, subcategory, search), sorted by sortOrder |
| `/tours/[slug]` | Tour Detail | Hero image, description, included/excluded, pricing sidebar, gallery, FAQ, reviews, related tours |
| `/about` | About | Founder bio, stats, team, values, gallery, CTAs |
| `/reviews` | Reviews | Review cards with language filter, photo gallery |
| `/contact` | Contact | Contact form (name, email, phone, message) |
| `/faq` | FAQ | FAQ accordion with category tabs |
| `/blog` | Blog List | Blog cards with category filter |
| `/blog/[slug]` | Blog Detail | Article with hero, category badge, content, sidebar (categories, popular, CTA), related posts |
| `/privacy` | Privacy Policy | Legal page from CMS |
| `/terms` | Terms | Legal page from CMS |
| `/cancellation-policy` | Cancellation | Legal page from CMS |

### Standalone Routes
| Route | Page | Description |
|-------|------|-------------|
| `/tour-order` | Tour Order Admin | Drag-and-drop reordering with EN/RU locale toggle, auth-gated |

### Localized Pathnames (RU)
- `/tours` → `/ekskursii`
- `/about` → `/o-nas`
- `/reviews` → `/otzyvy`
- `/contact` → `/kontakty`
- `/faq` → `/voprosy`

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/booking/request` | POST | No | Validate + save booking, send notifications (email, Telegram, WhatsApp, Slack). Rate-limited 20/hr/IP |
| `/api/contact` | POST | No | Save contact message, send notifications. Rate-limited 20/hr/IP |
| `/api/tour-order` | GET/POST | JWT | GET: list tours (filterable by `?locale=`). POST: save sortOrder changes |
| `/api/init-db` | GET/POST | Secret | Push schema to DB (`x-init-secret` = PAYLOAD_SECRET) |
| `/api/seed` | POST | No | Seed tours, reviews, FAQs, pages |
| `/api/seed-cms` | POST | No | Seed globals (Navigation, SiteSettings, Homepage, AboutPage, ReviewsPage) |
| `/api/seed-blog` | POST | No | Seed blog posts |
| `/api/fix-schema` | GET/POST | No | Fix schema issues (add missing columns) |
| `/api/fix-tier-maxguests` | POST | Secret | Fix pricing tier maxGuests using SQL LEAD() window function |
| `/api/fix-preferred-times` | GET/POST | Secret | GET: list tours table names + columns. POST: create `tours_preferred_times` + version table |
| `/api/fix-richtext` | POST | No | Fix richText field data |
| `/api/migrate-richtext` | POST | No | Convert plain text to Lexical richText |
| `/api/import-tours` | POST | No | Import tours from JSON |
| `/api/assign-photos` | POST | No | Associate photos to tours |
| `/api/upload-photos` | POST | No | Upload photos to Media |
| `/api/booking/send-payment-link` | POST | JWT | Create Stripe Checkout session for confirmed booking deposit |
| `/api/stripe/webhook` | POST | Stripe sig | Handle checkout.session.completed, update booking payment status |
| `/api/availability/[tourSlug]` | GET | No | Return available tour dates for a month (YYYY-MM) |
| `/api/health` | GET | No | Lightweight DB check for Uptime Kuma monitoring |

## Booking System
- `src/components/booking/BookingModal.tsx` — modal wrapper with price header
- `src/components/booking/BookingRequestForm.tsx` — form with date, time, guests, guest categories, additional services, customer info; uses `calculatePrice()` for dynamic pricing; accepts optional `preferredTimes` prop (falls back to `TIME_SLOTS` from `booking.ts`)
- `src/components/booking/StickyBookButton.tsx` — sticky CTA on tour detail pages
- `src/app/api/booking/request/route.ts` — POST endpoint: validates, saves to BookingRequests, sends notifications
- Notifications: email (Resend), Telegram, WhatsApp, Slack, n8n — all fire in parallel on new booking
- `src/emails/` — React Email templates: request-received (customer), new-request-admin, request-confirmed, request-declined, pre-tour-reminder, payment-received
- `src/lib/booking.ts` — Zod validation schema, guest max dynamic from `getMaxGuests()`, request ref format: BPG-YYYY-NNNNN
- `src/lib/rate-limit.ts` — shared rate limiter (Redis sorted sets with in-memory fallback), used by booking and contact API routes and server actions
- `src/lib/email-validation.ts` — disposable email domain blocklist (~50 domains), used by booking/contact routes and server actions
- `src/components/shared/ShareButtons.tsx` — Web Share API on mobile (native OS share sheet), desktop fallback with WhatsApp, Telegram, Facebook, Twitter/X, LinkedIn, copy link
- `src/app/actions/booking.ts` — `submitBookingRequest()` server action (mirrors API route logic, used by BookingRequestForm)
- `src/app/actions/contact.ts` — `submitContactForm()` server action (mirrors API route logic, used by ContactForm)

## OSS Integration (v1.15.2)
- **n8n** (`src/lib/n8n.ts`) — fire-and-forget webhook hub; 4 methods: bookingNew, bookingConfirmed, tourCompleted, paymentReceived
- **Stripe** (`src/lib/stripe.ts`) — Checkout session for deposits, refund helper; PaymentConfig global controls deposit %
- **Chatwoot** (`src/lib/chatwoot.ts`) — conversation notes + booking note formatter
- **Mautic** (`src/lib/mautic.ts`) — OAuth2 contact upsert for email automation
- **Formbricks** (`src/lib/formbricks.ts`) — survey URL builder with hidden fields
- **Twenty CRM** (`src/lib/twenty-crm.ts`) — GraphQL person find-or-create
- **TourDates** (`src/collections/TourDates.ts`) — availability calendar with capacity auto-management
- **AvailabilityCalendar** (`src/components/tours/AvailabilityCalendar.tsx`) — interactive date picker
- **PaymentLinkButton** (`src/components/admin/PaymentLinkButton.tsx`) — admin button for Stripe payment links
- All OSS clients are fire-and-forget — booking flow works when services are unconfigured
- Spec: `OSS-INTEGRATION-SPEC-v2.md` (v2.2) in bestpragueguide-docs

### Deployed Services (prod01)
| Service | Domain | Purpose |
|---------|--------|---------|
| n8n | n8n.bestpragueguide.com | Webhook automation |
| Chatwoot | chat.bestpragueguide.com | Customer messaging |
| Mautic | mail.bestpragueguide.com | Email automation |
| Formbricks | survey.bestpragueguide.com | NPS/feedback surveys |
| Twenty CRM | crm.bestpragueguide.com | CRM |
| Uptime Kuma | status.bestpragueguide.com | Uptime monitoring |

## Tour Pricing
- 4 pricing models: GROUP_TIERS (default), PER_PERSON, FLAT_RATE, ON_REQUEST
- `src/lib/pricing.ts` — shared engine: `calculatePrice`, `getDisplayPrice`, `getMaxGuests`, `hasOpenEndedTier`, `validateGuestBreakdown`
- `src/components/tours/PriceDisplay.tsx` — renders price in card, detail, and sticky variants
- `src/collections/Services.ts` — reusable add-on services (entry tickets, vehicles, etc.)
- Tours have `pricing` group with `model` selector, `groupTiers[]`, `guestCategoriesHeading`, `guestCategories[]`, `additionalServices[]`
- Tour detail sidebar shows group tiers table + additional services list above the booking form
- Guest categories appear as per-category counters in the booking form with price modifiers (e.g., Junior +€10)
- `guestCategoriesHeading` (localized) — custom section title (e.g., "Zoo/Museum Ticket"); falls back to "Guest Categories"
- Additional services appear as checkboxes in the booking form; selecting adds price to total
- Open-ended last tier (no `maxGuests`): dropdown shows "X+ guests" as last option, `getMaxGuests()` returns `minGuests` of that tier
- Legacy `groupPrice`/`groupSurchargePercent` fields hidden but kept for backward compat
- TourCard falls back to legacy `groupPrice` if `pricing.model` is not set

## Image System
- Media collection uses `focalPoint: true` with all sizes set to `position: 'focalpoint'`
- 6 image sizes: thumbnail (400x300), card (640x430), mobileCard (480x480), hero (1920x1080), mobileHero (800x600), og (1200x630)
- Tours support optional `mobileHeroImage` and per-gallery `mobileImage` + `objectFit` fields
- Frontend uses `<picture>` with `<source media="(max-width: 768px)">` for mobile images
- `getFocalPointStyle(media)` helper returns CSS `object-position` from focalX/focalY
- All `<img>` tags use localized alt text from Media collection

## Rich Text
- Two editor configs in `src/lib/editors.ts`: `simplifiedEditor` and `fullEditor`
- Most content fields use richText (Lexical) — see design doc for full field list
- `SafeRichText` component handles both plain strings (legacy) and Lexical JSON (custom renderer, not Payload's); resolves internal links for tours, blog-posts, and pages collections
- `extractPlainText(data)` helper extracts plain text from richText fields (for meta tags, listings, schema.org)
- `resolveRichTextLinks(data, locale)` in `src/lib/richtext.ts` — server-only function that walks Lexical JSON tree, finds internal link nodes, batch-fetches doc slugs from Payload, and populates `doc.value` with `{ id, slug }`. Call before passing data to RichText or SafeRichText.
- Tour detail page uses Payload's `RichText` component with custom `LinkJSXConverter({ internalDocToHref })` for locale-aware internal link URLs
- SEO metaDescription fields remain textarea (must be plain text for meta tags)
- When rendering richText in listings/cards, always use `extractPlainText()` — never render richText objects directly as JSX children
- `/api/migrate-richtext` endpoint converts existing plain text to Lexical format

## Live Preview
- Payload Live Preview configured in `payload.config.ts` with Mobile/Tablet/Desktop breakpoints
- `RefreshOnSave` client component in layout — uses `RefreshRouteOnSave` from `@payloadcms/live-preview-react` to auto-refresh frontend on admin save
- Collections: tours, pages, blog-posts; Globals: homepage, about-page, reviews-page, site-settings, navigation

## SEO
- `src/components/seo/` — JSON-LD schema components: OrganizationSchema, TourSchema, BlogPostSchema, WebSiteSchema, JsonLd
- OrganizationSchema (`TravelAgency`) rendered on all pages — includes geo coordinates, priceRange, areaServed, contact, social links
- `src/lib/metadata.ts` — `buildPageMetadata()` and `buildImageMetadata()` helpers for Next.js Metadata API
- Open Graph + Twitter Card meta tags on all pages
- Canonical URLs with hreflang alternates (en/ru)
- `sitemap.xml` generated dynamically (`force-dynamic`)

## Accessibility
- Skip-to-content link in layout (`<a href="#main-content">`) with `sr-only` + focus-visible styling
- Image gallery lightbox: `role="dialog"`, `aria-modal`, keyboard navigation (Escape to close, Arrow keys to navigate)
- `error.tsx` client component for graceful runtime error recovery with bilingual UI
- Form fields: `aria-invalid` + `aria-describedby` on booking (date, name, email) and contact (message) error states
- Nav hamburger: `aria-expanded`, `aria-controls="mobile-menu"`, locale-aware `aria-label`
- Tour filter buttons: `aria-pressed` for active state
- Image `onError` fallback on TourCard and Hero (hides broken images, reveals background)

## Admin Tools
- **Tour Order** (`/tour-order`) — standalone drag-and-drop page with EN/RU locale toggle; reorders tours by `sortOrder` field
- **Tour Order Link** (`src/components/admin/TourOrderLink.tsx`) — Payload `afterNavLinks` component in admin sidebar; registered in `importMap.js`
- **Tour List Filtering** — `baseFilter` on Tours collection filters admin list view by selected locale (`publishedLocales`)

## Middleware
- `src/middleware.ts` — www→non-www redirect (301), next-intl locale detection/prefix
- Matcher excludes: `/api`, `/admin`, `/tour-order`, `/_next`, `/_vercel`, static files
- `localeDetection: true` — auto-detects visitor language from browser/region
- `localePrefix: 'always'` — URLs always have `/en/` or `/ru/`

## Conventions
- Server Components by default; Client Components only for interactivity
- Payload Local API for data fetching in Server Components
- ISR for tour and blog pages (`revalidate = 3600`)
- All commits must update CHANGELOG.md, VERSION, and affected docs
- EN/RU localization: next-intl for UI strings (booking, contact, common, tour, pages, notFound, meta, legal), Payload for all CMS content
- Design palette: navy (#1A1A1A), gold (#C4975C), cream (#FAF7F2)
- Fonts: Cormorant Garamond (headings), DM Sans (body)

## Analytics
- `src/components/analytics/GoogleAnalytics.tsx` — GA4 via gtag.js (`NEXT_PUBLIC_GA_ID`)
- `src/components/analytics/GoogleTagManager.tsx` — GTM head + noscript body (`NEXT_PUBLIC_GTM_ID`)
- `src/components/analytics/UmamiAnalytics.tsx` — self-hosted Umami (`NEXT_PUBLIC_UMAMI_WEBSITE_ID` + `NEXT_PUBLIC_UMAMI_SRC`)
- `src/components/analytics/YandexMetrika.tsx` — Yandex Metrika (`NEXT_PUBLIC_YANDEX_METRIKA_ID`)
- `src/lib/analytics.ts` — `trackEvent(name, params)` pushes to GTM dataLayer + Yandex reachGoal
- All components no-op when env vars are unset (safe for dev)
- Umami dashboard: https://analytics.bestpragueguide.com

## Security
- **HTTP headers** (next.config.ts `async headers()`) — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Disposable email blocking** — domain-based validation on booking and contact form submissions
- **Rate limiting** — 20 requests/hr per IP on booking and contact endpoints (Redis sorted sets, in-memory fallback)

## PWA
- `public/manifest.json` — standalone display, theme-color `#C4975C`, background `#FAF7F2`
- Layout metadata includes manifest link, apple-touch-icon, and theme-color meta tags

## Testing
- **Vitest** with `@` path alias support (`vitest.config.ts`)
- `src/lib/__tests__/pricing.test.ts` — 51 tests covering calculatePrice, getDisplayPrice, getMaxGuests, hasOpenEndedTier, validateGuestBreakdown, calculateServicePrice
- `src/lib/__tests__/email-validation.test.ts` — 11 tests for disposable email detection
- Run: `npm test` (single run) or `npm run test:watch` (watch mode)

## Deployment
- **Dockerfile**: multi-stage (deps → builder → runner) with node:22-alpine
- **Output**: `standalone` mode for minimal Docker image
- **docker-compose.yaml**: single service on `coolify` network with `bestpragueguide-media` volume
- **Schema migration**: `/api/init-db` endpoint with `x-init-secret` header calls `pushDevSchema`
- **Container runs as** `nextjs` user (uid 1001); filesystem read-only except `/app/media`
- **drizzle-kit/drizzle-orm** copied to runner stage for runtime schema push

## Dev Commands
```bash
docker compose up -d          # Start PostgreSQL + Redis
npm run dev                   # Start dev server (localhost:3000)
npm run build                 # Production build
npm run lint                  # ESLint
npm test                      # Run Vitest tests
npm run test:watch            # Vitest watch mode
```
