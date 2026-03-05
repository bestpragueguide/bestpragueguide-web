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

## Conventions
- Server Components by default; Client Components only for interactivity
- Payload Local API for data fetching in Server Components
- ISR for tour pages (revalidate on change)
- All commits must update CHANGELOG.md, VERSION, and affected docs
- EN/RU localization: next-intl for UI strings (booking, contact, common), Payload for all CMS content
- Design palette: navy (#1A1A1A), gold (#C4975C), cream (#FAF7F2)
- Fonts: Cormorant Garamond (headings), DM Sans (body)

## Dev Commands
```bash
docker compose up -d          # Start PostgreSQL + Redis
npm run dev                   # Start dev server (localhost:3000)
npm run build                 # Production build
npm run lint                  # ESLint
```
