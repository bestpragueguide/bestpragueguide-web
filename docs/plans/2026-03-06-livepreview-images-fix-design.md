# Live Preview & Image System Fix — Design

> **Status:** COMPLETED (v1.6.2, deployed 2026-03-07)

## Problem

1. **Live Preview**: `LivePreviewListener` component exists but is never imported anywhere. Payload admin preview iframe loads the page but never refreshes on save.
2. **Image System**: Backend fields exist (mobileHeroImage, mobileImage, mobileCard/mobileHero sizes) but frontend doesn't use them. Hero always loads 1920x1080 on all devices.

## Design

### Live Preview — Refresh-on-save

**Approach**: Replace unused `LivePreviewListener` (which uses `useLivePreview` hook + `initialData` prop — wrong pattern for layout-level integration) with Payload's `RefreshRouteOnSave` from `@payloadcms/live-preview-react`.

- Create `RefreshOnSave` client component wrapper that renders `RefreshRouteOnSave` with `serverURL` from env
- Import in `src/app/(frontend)/[locale]/layout.tsx`
- Delete `LivePreviewListener.tsx`
- Config in `payload.config.ts` already correct (collections, globals, breakpoints, URL resolver)

### Image System — Wire mobile images to frontend

**Tour detail hero** (`tours/[slug]/page.tsx`):
- Currently uses `heroImage?.sizes?.hero?.url` via Next/Image
- Change to `<picture>` element with:
  - `<source media="(max-width: 768px)">` using `mobileHeroImage.sizes.mobileHero` (fallback: `heroImage.sizes.mobileHero`)
  - `<img>` using `heroImage.sizes.hero`
- Apply focal point from respective image object

**Homepage Hero** (`Hero.tsx`):
- Currently uses Next/Image with `sizes="100vw"` — always loads hero size (1920x1080)
- Switch to `<picture>` element:
  - `<source media="(max-width: 768px)">` using `heroBackgroundImage.sizes.mobileHero`
  - `<img>` using `heroBackgroundImage.sizes.hero`
- Homepage doesn't have separate mobile hero field — use auto-generated `mobileHero` size from same image

**Gallery** — already uses `<picture>` with `mobileImage` → verify working.

**TourCard** — already uses `<picture>` with `mobileCard` size → verify working.

## Files to Change

- Delete: `src/components/shared/LivePreviewListener.tsx`
- Create: `src/components/shared/RefreshOnSave.tsx`
- Modify: `src/app/(frontend)/[locale]/layout.tsx` — add RefreshOnSave
- Modify: `src/app/(frontend)/[locale]/tours/[slug]/page.tsx` — tour hero `<picture>`
- Modify: `src/components/home/Hero.tsx` — homepage hero `<picture>`

## Out of Scope

- Per-device focal points (mobileFocalX/Y) — admin can upload separate mobile image if shared focal point doesn't work
- Real-time inline preview (would need `useLivePreview` on every page) — refresh-on-save is sufficient
