# Best Prague Guide — System Specification v1.14.0

Comprehensive specification of the bestpragueguide-web application as of 2026-03-08. Use this document as input for extending the system with new features.

---

## 1. Business Context

**Best Prague Guide** is a bilingual (EN/RU) private tour portal for Prague, founded by Uliana Formina — a highest-category licensed guide with 17 years of experience. The site replaces the legacy ulitravel.com brand.

**Business model**: Private/small-group tours booked through the website. No online payment yet — booking requests are manually confirmed by the guide. Revenue from guided tours only.

**Target audience**: English and Russian-speaking tourists visiting Prague.

**Key differentiators**: Personal service, licensed guide, curated experiences, bilingual content.

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 15.3.x |
| CMS | Payload CMS | 3.79.x |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| CSS | Tailwind CSS | 4.x |
| i18n | next-intl | 4.8.x |
| Rich Text | Lexical (via @payloadcms/richtext-lexical) | 3.79.x |
| Email | Resend + React Email | 6.9.x / 5.2.x |
| Validation | Zod | 4.3.x |
| Images | Sharp | 0.34.x |
| Runtime | Node.js | 22 (Alpine) |
| Deploy | Coolify on Hetzner | — |
| CDN | Cloudflare | — |
| Analytics | GA4, Umami (self-hosted), GTM, Yandex Metrika | — |

**Architecture**: Modular monolith — Payload CMS and Next.js run in a single process. Payload provides the admin panel, REST/GraphQL API, and Local API. Next.js handles SSR/SSG for the public frontend.

---

## 3. Project Structure

```
src/
├── app/
│   ├── (frontend)/[locale]/          # Public pages (SSR, locale-prefixed)
│   │   ├── page.tsx                  # Homepage
│   │   ├── tours/page.tsx            # Tour catalog
│   │   ├── tours/[slug]/page.tsx     # Tour detail
│   │   ├── about/page.tsx            # About page
│   │   ├── reviews/page.tsx          # Reviews
│   │   ├── contact/page.tsx          # Contact form
│   │   ├── faq/page.tsx              # FAQ
│   │   ├── blog/page.tsx             # Blog list
│   │   ├── blog/[slug]/page.tsx      # Blog detail
│   │   ├── privacy/page.tsx          # Privacy policy
│   │   ├── terms/page.tsx            # Terms
│   │   ├── cancellation-policy/page.tsx
│   │   └── layout.tsx                # Frontend layout (Nav, Footer, analytics)
│   ├── (payload)/                    # Payload admin panel
│   │   ├── admin/[[...segments]]/page.tsx
│   │   ├── admin/importMap.js        # Component registry (auto + manual)
│   │   └── layout.tsx
│   ├── api/                          # API routes
│   │   ├── booking/request/route.ts  # Booking submissions
│   │   ├── contact/route.ts          # Contact form
│   │   ├── tour-order/route.ts       # Admin tour reordering
│   │   ├── init-db/route.ts          # Schema migration
│   │   ├── seed/route.ts             # Data seeding
│   │   ├── seed-cms/route.ts         # CMS globals seeding
│   │   ├── seed-blog/route.ts        # Blog seeding
│   │   ├── fix-schema/route.ts       # Schema fixes
│   │   ├── fix-richtext/route.ts     # RichText data fixes
│   │   ├── migrate-richtext/route.ts # Plain→Lexical migration
│   │   ├── import-tours/route.ts     # Tour import
│   │   ├── assign-photos/route.ts    # Photo assignment
│   │   └── upload-photos/route.ts    # Photo upload
│   ├── tour-order/                   # Standalone admin page
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── layout.tsx                    # Root layout
├── collections/                      # 9 Payload collections
│   ├── Tours.ts
│   ├── Services.ts
│   ├── Reviews.ts
│   ├── BlogPosts.ts
│   ├── Pages.ts
│   ├── FAQs.ts
│   ├── BookingRequests.ts
│   ├── ContactMessages.ts
│   └── Media.ts
├── globals/                          # 5 Payload globals
│   ├── SiteSettings.ts
│   ├── Navigation.ts
│   ├── Homepage.ts
│   ├── AboutPage.ts
│   └── ReviewsPage.ts
├── components/
│   ├── shared/       # 12 files: Button, Logo, LanguageSwitcher, ContactForm, FAQAccordion, Badge, Breadcrumbs, RichTextRenderer, SafeRichText, WhatsAppButton, CookieConsent, RefreshOnSave
│   ├── layout/       # 3 files: Nav, Footer, MobileMenu
│   ├── home/         # 10 files: Hero, TrustBar, GuideProfile, FeaturedTours, ProcessSteps, TestimonialSlider(+Wrapper), FAQSection(+Wrapper), CTASection
│   ├── tours/        # 9 files: TourCard, TourGrid, TourFilters, TourRelated, PriceDisplay, ImageGallery, TourIncluded, TourFAQ, TourReviews
│   ├── booking/      # 3 files: BookingModal, BookingRequestForm, StickyBookButton
│   ├── blog/         # 1 file: BlogCategoryFilter
│   ├── reviews/      # 3 files: ReviewCard, ReviewFilter, PhotoGallery
│   ├── seo/          # 5 files: JsonLd, OrganizationSchema, TourSchema, BlogPostSchema, WebSiteSchema
│   ├── analytics/    # 5 files: GoogleAnalytics, GoogleTagManager, UmamiAnalytics, YandexMetrika, TourViewTracker
│   └── admin/        # 2 files: TourOrderLink, TourOrderView
├── emails/           # 6 templates: request-received, new-request-admin, request-confirmed, request-declined, pre-tour-reminder, payment-received
├── lib/              # 15 utility files
│   ├── cms-data.ts         # CMS data fetching with fallbacks
│   ├── cms-types.ts        # TypeScript types for CMS data
│   ├── pricing.ts          # Pricing engine (4 models)
│   ├── booking.ts          # Zod schema, request ref generation
│   ├── editors.ts          # Lexical editor configs
│   ├── email.ts            # Resend email sending
│   ├── telegram.ts         # Telegram notifications
│   ├── whatsapp.ts         # WhatsApp notifications
│   ├── slack.ts            # Slack notifications
│   ├── analytics.ts        # Event tracking
│   ├── metadata.ts         # SEO metadata builders
│   ├── ip.ts               # IP geolocation
│   ├── currency.ts         # Currency formatting
│   ├── blog.ts             # Blog category labels
│   ├── plurals.ts          # EN/RU pluralization
│   └── icon-map.tsx        # Icon components
├── i18n/
│   ├── routing.ts          # Locale config + pathname mappings
│   ├── request.ts          # Message loading
│   └── messages/           # en.json, ru.json
├── middleware.ts            # www redirect + locale detection
└── payload.config.ts        # Payload CMS configuration
```

---

## 4. Data Model

### 4.1 Collections

#### Tours (slug: `tours`)
Primary content collection. Organized in admin tabs: Content, Images, Pricing, SEO.

| Field | Type | Localized | Notes |
|-------|------|-----------|-------|
| title | text | Yes | Required |
| excerpt | richText (simplified) | Yes | Short description for cards |
| description | richText (full) | Yes | Full tour description |
| included | array[text] | Yes | What's included |
| excluded | array[text] | Yes | What's not included |
| faq | array[question, answer] | Yes | Tour-specific FAQ |
| category | select | No | Options: walking, car, boat, outside-prague, themed |
| subcategory | select | No | Options: classic, hidden-gems, food, nightlife, etc. |
| duration | text | Yes | e.g., "3 hours" |
| maxGroupSize | number | No | Max guests allowed |
| difficulty | select | No | easy, moderate, challenging |
| tags | select (hasMany) | No | family-friendly, romantic, photo-tour, etc. |
| meetingPoint | group | Yes | name, address, coordinates (lat/lng), instructions |
| heroImage | relationship → Media | No | Main tour image |
| mobileHeroImage | relationship → Media | No | Optional mobile variant |
| gallery | array | No | image, mobileImage, objectFit, caption (localized) |
| pricing.model | select | No | GROUP_TIERS, PER_PERSON, FLAT_RATE, ON_REQUEST |
| pricing.groupTiers | array | No | minGuests, maxGuests, pricePerPerson |
| pricing.guestCategoriesHeading | text | Yes | Custom heading for guest categories |
| pricing.guestCategories | array | Yes | name, priceModifier, onRequest |
| pricing.additionalServices | array | No | service (→ Services), customName, customPrice |
| pricing.groupPrice | number | No | Legacy, hidden |
| pricing.groupSurchargePercent | number | No | Legacy, hidden |
| relatedTours | relationship → Tours (hasMany) | No | Admin-selected related tours |
| slug | text | Yes | URL-friendly identifier |
| publishedLocales | select (hasMany) | No | en, ru — controls catalog visibility |
| status | select | No | draft, published, archived |
| sortOrder | number | No | Display order (0 = first) |
| rating | number | No | Average rating |
| reviewCount | number | No | Number of reviews |
| seo | group | Yes | metaTitle, metaDescription, ogImage |

**Admin config**: `baseFilter` filters list view by locale. `versions: { drafts: true }` enabled.

#### Services (slug: `services`)
Reusable add-on services referenced by Tours.

| Field | Type | Notes |
|-------|------|-------|
| name | text (localized) | Required |
| type | select | entry_ticket, vehicle, restaurant, other |
| description | richText (localized) | Optional |
| pricingModel | select | per_person, per_group, flat, on_request |
| flatPrice | number | Used for flat/per_group models |
| requireGuestBreakdown | checkbox | If service price varies by guest category |
| guestCategoryPricing | array | category name, price |
| groupTierPricing | array | minGuests, maxGuests, price |

#### Reviews (slug: `reviews`)

| Field | Type | Notes |
|-------|------|-------|
| tour | relationship → Tours | Optional tour reference |
| customerName | text | Required |
| customerCountry | text | Optional |
| rating | number (1-5) | Required |
| title | text (localized) | Optional |
| body | richText (localized) | Required |
| language | select | en, ru |
| tourDate | date | When they took the tour |
| guideResponse | richText (localized) | Guide's reply |
| status | select | pending, approved, rejected |
| featured | checkbox | Show on homepage |

#### BlogPosts (slug: `blog-posts`)

| Field | Type | Notes |
|-------|------|-------|
| title | text (localized) | Required |
| slug | text (localized) | Required, unique |
| excerpt | richText (localized, simplified) | Short description |
| content | richText (localized, full) | Article body |
| category | select | prague-guide, food-and-drink, day-trips, tips, history |
| heroImage | relationship → Media | Required |
| author | text | Optional (not displayed on frontend) |
| publishedAt | date | Publication date |
| status | select | draft, published |
| publishedLocales | select (hasMany) | en, ru |
| seo | group | metaTitle, metaDescription, ogImage |

#### FAQs (slug: `faqs`)

| Field | Type | Notes |
|-------|------|-------|
| question | text (localized) | Required |
| answer | richText (localized) | Required |
| category | select | general, booking, tours, payment, practical |
| sortOrder | number | Display order |
| status | select | draft, published |
| showOnHomepage | checkbox | Show in homepage FAQ section |

#### Pages (slug: `pages`)

| Field | Type | Notes |
|-------|------|-------|
| title | text (localized) | Required |
| slug | text | Required, unique |
| content | richText (localized, full) | Page body |
| template | select | default |
| lastUpdated | date | Last content update |
| seo | group | metaTitle, metaDescription, ogImage |

#### BookingRequests (slug: `booking-requests`)

| Field | Type | Notes |
|-------|------|-------|
| requestRef | text | Auto-generated: BPG-YYYY-NNNNN |
| tour | relationship → Tours | Required |
| preferredDate | date | Required |
| preferredTime | text | HH:MM format |
| guests | number | 1-50 |
| customerName | text | Required |
| customerEmail | email | Required |
| customerPhone | text | Optional |
| customerLanguage | select | en, ru |
| specialRequests | textarea | Optional |
| totalPrice | number | Calculated price |
| currency | text | EUR |
| status | select | new, confirmed, declined, cancelled, completed |
| stripePaymentLink | text | Manual payment link |
| ipInfo | group | ip, country, city, region |
| internalNotes | textarea | Admin-only notes |

#### ContactMessages (slug: `contact-messages`)

| Field | Type | Notes |
|-------|------|-------|
| name | text | Required |
| email | email | Required |
| phone | text | Optional |
| message | richText | Required |
| locale | text | en or ru |
| ipInfo | group | ip, country, city, region |
| status | select | new, read, replied |
| internalNotes | textarea | Admin-only |

#### Media (slug: `media`)

| Field | Type | Notes |
|-------|------|-------|
| alt | text (localized) | Alt text |
| caption | text (localized) | Optional caption |
| upload | file | Images only |
| focalPoint | enabled | Custom crop positioning |

**Image sizes**: thumbnail (400x300), card (640x430), mobileCard (480x480), hero (1920x1080), mobileHero (800x600), og (1200x630). All use `position: 'focalpoint'`.

### 4.2 Globals

#### SiteSettings
Contact info (email, phone, WhatsApp), social links (Instagram, YouTube, TripAdvisor, Google Business), WhatsApp message templates, map coordinates, business hours, license/copyright text, announcement banner (toggle, text, link).

#### Navigation
Header links array (label, href, openInNewTab), header CTA (label, href), footer columns array with nested links, footer license/copyright text. All localized.

#### Homepage
Hero section (tagline, subtitle, CTA, background image, mobile image), trust bar items array, guide profile (heading, bio, learn more link, photo), categories grid, process steps, testimonials heading, FAQ heading, CTA section (heading, subtitle, button, WhatsApp label), SEO group. All localized.

#### AboutPage
Founder profile (photo, heading, bio, quote), stats array, team section (heading, description, photos, badges), values array, gallery photos, dual CTAs, SEO. All localized.

#### ReviewsPage
Page heading, photo gallery heading, gallery photos array, SEO. All localized.

---

## 5. Pricing Engine

Four pricing models, shared between frontend and backend via `src/lib/pricing.ts`:

### GROUP_TIERS (default)
Price per person varies by group size. Defined as tiers with `minGuests`, `maxGuests`, `pricePerPerson`.
```
1-2 guests: €150/person
3-4 guests: €120/person
5+ guests: €100/person (open-ended, no maxGuests)
```

### PER_PERSON
Fixed price per person regardless of group size. Uses first tier's `pricePerPerson`.

### FLAT_RATE
Fixed total price regardless of group size. Uses first tier's `pricePerPerson` as total.

### ON_REQUEST
No price displayed. Booking form shows "Price on request".

### Guest Categories
Optional per-tour. Each category has a name and `priceModifier` (added to per-person price). Example: "Adult" (+€0), "Child 6-15" (-€20), "Student" (+€10). Categories can also be `onRequest`.

### Additional Services
Reusable services from the Services collection. Each has its own pricing model (per_person, per_group, flat, on_request). Tours can reference services and optionally override name/price.

### Price Calculation Flow
1. Determine base price from tier matching guest count
2. Apply guest category modifiers (if any)
3. Add selected additional services
4. Return total

---

## 6. Booking Flow

1. **User clicks "Book Now"** on tour detail page → StickyBookButton opens BookingModal
2. **BookingRequestForm** renders with:
   - Date picker (tomorrow or later)
   - Time selector (30-min slots)
   - Guest count dropdown (1 to maxGuests)
   - Guest category counters (if tour has categories, must sum to total guests)
   - Additional service checkboxes
   - Customer info (name, email, phone, language, special requests)
   - Dynamic price display updated on every change
3. **Submit** → POST to `/api/booking/request`
4. **Server validates** (Zod schema), generates request ref (BPG-YYYY-NNNNN), saves to BookingRequests
5. **Notifications fire in parallel** (Promise.allSettled):
   - Email to customer (request-received template)
   - Email to admin (new-request-admin template)
   - Telegram message to admin chat
   - WhatsApp message to admin number
   - Slack webhook to admin channel
6. **Admin reviews** in Payload admin, updates status (confirmed/declined)
7. **Confirmation/decline emails** sent manually (templates available)

---

## 7. Notification System

Four channels, all in `src/lib/`:

| Channel | Library | Config Env Var | Trigger |
|---------|---------|----------------|---------|
| Email | Resend | `RESEND_API_KEY` | Booking + Contact |
| Telegram | Bot API | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` | Booking + Contact |
| WhatsApp | WhatsApp API | `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_ID` | Booking only |
| Slack | Webhook | `SLACK_WEBHOOK_URL` | Booking + Contact |

All notification sends are fire-and-forget (no retries, no queues). Each channel has a message formatter that builds a human-readable summary with all booking/contact details.

---

## 8. Localization

### Strategy
- **UI strings**: next-intl with JSON message files (`src/i18n/messages/en.json`, `ru.json`)
- **CMS content**: Payload localization (all text/richText fields marked `localized: true`)
- **URL routing**: Always prefixed (`/en/...`, `/ru/...`) with localized pathnames

### Locale Detection
- `localeDetection: true` in next-intl config
- Browser Accept-Language header determines initial locale
- RU-region visitors see Russian by default
- User can switch via LanguageSwitcher component (always visible, including mobile)

### Localized Pathnames
```
/en/tours       → /ru/ekskursii
/en/about       → /ru/o-nas
/en/reviews     → /ru/otzyvy
/en/contact     → /ru/kontakty
/en/faq         → /ru/voprosy
/en/blog        → /ru/blog (same)
```

### Content Visibility
- Tours and BlogPosts have `publishedLocales` field (select hasMany: en, ru)
- Only tours/posts with the current locale in `publishedLocales` appear in the catalog
- Admin list view filters by current admin locale via `baseFilter`

---

## 9. SEO

### Meta Tags
- Every page generates Next.js `Metadata` with title, description, canonical URL, Open Graph, Twitter Card
- hreflang alternates for en/ru on every page
- `buildPageMetadata()` helper standardizes meta tag generation

### Structured Data (JSON-LD)
- `OrganizationSchema` — on all pages (via layout)
- `WebSiteSchema` — on homepage (with SearchAction)
- `TourSchema` — on tour detail pages (Event + Product schema)
- `BlogPostSchema` — on blog detail pages (BlogPosting schema)

### Sitemap
- Dynamic `sitemap.xml` route with `force-dynamic`
- Includes all published tours, blog posts, and static pages
- Per-locale URLs with lastmod dates

---

## 10. Analytics

| Platform | Env Var | Status |
|----------|---------|--------|
| GA4 | `NEXT_PUBLIC_GA_ID` (G-DFLT0NBRFK) | Active |
| Umami | `NEXT_PUBLIC_UMAMI_WEBSITE_ID` + `NEXT_PUBLIC_UMAMI_SRC` | Active (self-hosted) |
| GTM | `NEXT_PUBLIC_GTM_ID` | Not configured |
| Yandex Metrika | `NEXT_PUBLIC_YANDEX_METRIKA_ID` | Not configured |

All analytics components no-op when env vars are unset.

Custom `trackEvent(name, params)` pushes to GTM dataLayer + Yandex reachGoal for conversion tracking.

`TourViewTracker` component fires a custom event when a tour detail page is viewed.

---

## 11. Image System

### Media Collection Sizes
| Name | Dimensions | Use Case |
|------|-----------|----------|
| thumbnail | 400x300 | Admin previews, small thumbnails |
| card | 640x430 | Tour cards, blog cards |
| mobileCard | 480x480 | Mobile tour/blog cards |
| hero | 1920x1080 | Tour/page hero banners |
| mobileHero | 800x600 | Mobile hero banners |
| og | 1200x630 | Open Graph social sharing |

### Focal Point
All sizes use `position: 'focalpoint'` — editors set a focal point in the admin panel, and images are cropped around it at all sizes.

### Mobile Variants
Tours support optional `mobileHeroImage` and per-gallery-item `mobileImage`. Frontend uses `<picture>` with `<source media="(max-width: 768px)">` to serve appropriate images.

---

## 12. Admin Extensions

### Tour Order Page
- Standalone page at `/tour-order` (outside Payload admin, has its own `<html>` layout)
- Drag-and-drop interface using `@dnd-kit` (core, sortable, utilities)
- EN/RU locale toggle — filters tours by `publishedLocales` and shows titles in selected locale
- Auth-gated via Payload JWT cookie (`payload-token`)
- Saves `sortOrder` field on each tour
- Link in Payload admin sidebar via `TourOrderLink` component (`afterNavLinks` in import map)

### Import Map
Custom admin components must be registered in `src/app/(payload)/admin/importMap.js`. This file is auto-generated by Payload during build but may need manual entries for custom components. Currently includes `TourOrderLink`.

### Admin List Filtering
Tours collection uses `baseFilter` to show only tours matching the selected admin locale. This filters by the `publishedLocales` field using the `in` operator.

---

## 13. Deployment

### Docker Build (multi-stage)
1. **deps**: Install npm packages
2. **builder**: Copy source + node_modules, run `next build`
3. **runner**: Minimal image with standalone output, `nextjs` user (uid 1001), drizzle-kit/orm for schema push

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Payload encryption key |
| `NEXT_PUBLIC_SERVER_URL` | Public URL (https://bestpragueguide.com) |
| `RESEND_API_KEY` | Email sending |
| `RESEND_FROM_EMAIL` | Sender address |
| `ADMIN_EMAIL` | Admin notification email |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_ADMIN_CHAT_ID` | Telegram chat for notifications |
| `WHATSAPP_API_TOKEN` | WhatsApp Business API |
| `WHATSAPP_PHONE_ID` | WhatsApp phone number ID |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami analytics |
| `NEXT_PUBLIC_UMAMI_SRC` | Umami script URL |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager (optional) |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | Yandex Metrika (optional) |

### Schema Migration
Production schema updates via `/api/init-db` endpoint with `x-init-secret` header = PAYLOAD_SECRET. Calls Drizzle `pushDevSchema`. For large schema changes, manual `ALTER TABLE` via Coolify DB terminal.

---

## 14. Design System

### Colors
| Token | Value | Use |
|-------|-------|-----|
| navy | #1A1A1A | Primary text, buttons, backgrounds |
| gold | #C4975C | Accents, CTAs, links, highlights |
| cream | #FAF7F2 | Page backgrounds, section fills |
| gray | — | Tailwind defaults for muted text |

### Typography
| Role | Font | Weight |
|------|------|--------|
| Headings | Cormorant Garamond | 600-700 |
| Body | DM Sans | 400-500 |

### Component Patterns
- Server Components by default; Client Components only for interactivity (forms, sliders, drag-and-drop)
- Inline styles for standalone admin pages (TourOrderView); Tailwind for all public-facing pages
- `<Link>` from next/link for all internal navigation (ESLint enforced)
- `force-dynamic` on data-fetching pages that need fresh DB data at request time

---

## 15. Known Constraints & Gotchas

### Payload CMS + PostgreSQL
- `contains` operator FAILS on `select hasMany` fields — use `in: [value]` instead
- `select` option in `payload.find()` FAILS silently on localized fields — omit `select`, fetch full docs
- Array table `id` must be `varchar` (not serial) — Payload generates string ObjectIds
- New collections need `{collection}_id` column on `payload_locked_documents_rels`
- Table naming is ALL snake_case — field `groupTiers` on `tours` under group `pricing` → table `tours_pricing_group_tiers`
- Relationship fields in arrays stored as `{field}_id` column directly on array table
- Collections with `versions: { drafts: true }` — admin list queries version tables (`_tours_v`)
- `pushDevSchema` hangs on large schema additions — use manual ALTER statements
- Localized arrays in globals: seed EN first, fetch IDs, then pass matching IDs in RU update

### Import Map
- Payload regenerates `importMap.js` during `next build` via `withPayload` plugin
- Custom components referenced in `afterNavLinks` may not be auto-generated — verify and manually add if needed
- Import paths in importMap.js must NOT include `.js` extension (webpack resolves `.tsx` automatically)

### Next.js
- `@next/next/no-html-link-for-pages` ESLint rule — use `<Link>` from next/link, never `<a>` for internal routes
- Standalone pages outside route groups need their own `layout.tsx` with `<html>` and `<body>`
- Middleware matcher must exclude standalone routes to prevent next-intl locale redirects

---

## 16. Extension Points

When adding new features, consider these integration points:

### Adding a New Collection
1. Create config in `src/collections/NewCollection.ts`
2. Add to `collections` array in `src/payload.config.ts`
3. Add types to `src/lib/cms-types.ts`
4. If it needs CMS data fetching, add function to `src/lib/cms-data.ts`
5. After deploying, call `/api/init-db` to push schema
6. If the collection needs locked documents support, ALTER `payload_locked_documents_rels` table

### Adding a New Page
1. Create `src/app/(frontend)/[locale]/new-page/page.tsx`
2. Add localized pathname mapping in `src/i18n/routing.ts`
3. Add breadcrumb support if needed
4. Add SEO metadata via `generateMetadata` export
5. Add JSON-LD schema component if appropriate

### Adding a New Admin Tool
1. Create component in `src/components/admin/`
2. Add to `afterNavLinks` in `payload.config.ts`
3. Manually verify/add to `importMap.js`
4. If standalone page, create under `src/app/new-route/` with own layout
5. Add to middleware matcher exclusion if needed

### Adding a New Notification Channel
1. Create `src/lib/new-channel.ts` with send + format functions
2. Add to parallel notification dispatch in booking/contact API routes
3. Add env var to Coolify deployment

### Adding a New Pricing Model
1. Add option to `pricing.model` select in Tours collection
2. Implement calculation logic in `src/lib/pricing.ts`
3. Update `PriceDisplay` component for display
4. Update `BookingRequestForm` for the new model's UX

---

## 17. Current Data

As of 2026-03-08:
- **21 tours** seeded (3 EN+RU bilingual, 18 RU-only)
- **8 reviews** seeded
- **5 blog categories** defined (prague-guide, food-and-drink, day-trips, tips, history)
- **5 FAQ categories** (general, booking, tours, payment, practical)
- **3 legal pages** (privacy, terms, cancellation)
- **6 email templates** ready
- **4 analytics platforms** integrated (2 active)
