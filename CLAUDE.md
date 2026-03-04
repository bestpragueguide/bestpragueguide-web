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
- `src/collections/` — Payload CMS collection configs
- `src/globals/` — Payload CMS global configs
- `src/components/` — React components (shared, layout, home, tours, blog, booking, reviews, seo, analytics)
- `src/emails/` — React Email templates
- `src/lib/` — Utilities (email, telegram, whatsapp, slack, booking, blog, ip)
- `src/i18n/` — next-intl routing, request config, message files

## Conventions
- Server Components by default; Client Components only for interactivity
- Payload Local API for data fetching in Server Components
- ISR for tour pages (revalidate on change)
- All commits must update CHANGELOG.md, VERSION, and affected docs
- EN/RU localization via next-intl for UI strings, Payload localization for CMS content
- Design palette: navy (#1A1A1A), gold (#C4975C), cream (#FAF7F2)
- Fonts: Cormorant Garamond (headings), DM Sans (body)

## Dev Commands
```bash
docker compose up -d          # Start PostgreSQL + Redis
npm run dev                   # Start dev server (localhost:3000)
npm run build                 # Production build
npm run lint                  # ESLint
```
