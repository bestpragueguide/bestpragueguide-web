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
- `src/collections/` — Payload CMS collection configs (Tours, Reviews, Pages, FAQs, BlogPosts, BookingRequests, ContactMessages, Media)
- `src/globals/` — Payload CMS global configs (SiteSettings, Navigation, Homepage, AboutPage, ReviewsPage)
- `src/components/` — React components (shared, layout, home, tours, blog, booking, reviews, seo, analytics)
- `src/emails/` — React Email templates
- `src/lib/` — Utilities (cms-data, cms-types, icon-map, email, telegram, whatsapp, slack, booking, blog, ip, currency, metadata, analytics)
- `src/i18n/` — next-intl routing, request config, message files

## CMS Architecture
All site content is editable from Payload admin panel:
- **SiteSettings** global — contact info, social links, map coordinates, WhatsApp templates, license/copyright
- **Navigation** global — header links, CTA button, footer columns with links
- **Homepage** global — hero, trust bar, guide profile, categories, process steps, testimonials heading, FAQ heading, CTA
- **AboutPage** global — founder profile, stats, team, values, gallery, CTAs
- **ReviewsPage** global — page heading, photo gallery
- **FAQs** collection — question/answer (richText), category, sortOrder, showOnHomepage flag
- **Pages** collection — legal pages (privacy, terms, cancellation) with richText content

### Data Flow
- `src/lib/cms-data.ts` — async functions with hardcoded fallbacks for all globals
- Layout fetches SiteSettings + Navigation → passes as props to Nav, Footer, WhatsAppButton
- Homepage fetches Homepage global + FAQs → distributes to child components
- Standalone pages (about, reviews, faq, contact) fetch their respective globals/collections
- Legal pages try Pages collection first, fall back to i18n
- Client Components receive CMS data as serialized props from parent Server Components
- Never use `select` option in payload.find() — fails silently on localized fields in PostgreSQL

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
- `SafeRichText` component handles both plain strings (legacy) and Lexical JSON (custom renderer, not Payload's)
- `extractPlainText(data)` helper extracts plain text from richText fields (for meta tags, listings, schema.org)
- SEO metaDescription fields remain textarea (must be plain text for meta tags)
- When rendering richText in listings/cards, always use `extractPlainText()` — never render richText objects directly as JSX children
- `/api/migrate-richtext` endpoint converts existing plain text to Lexical format

## Live Preview
- Payload Live Preview configured in `payload.config.ts` with Mobile/Tablet/Desktop breakpoints
- `LivePreviewListener` client component for real-time admin editing preview
- Collections: tours, pages, blog-posts; Globals: homepage, about-page, reviews-page, site-settings, navigation

## Conventions
- Server Components by default; Client Components only for interactivity
- Payload Local API for data fetching in Server Components
- ISR for tour pages (revalidate on change)
- All commits must update CHANGELOG.md, VERSION, and affected docs
- EN/RU localization: next-intl for UI strings (booking, contact, common), Payload for all CMS content
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

## Dev Commands
```bash
docker compose up -d          # Start PostgreSQL + Redis
npm run dev                   # Start dev server (localhost:3000)
npm run build                 # Production build
npm run lint                  # ESLint
```
