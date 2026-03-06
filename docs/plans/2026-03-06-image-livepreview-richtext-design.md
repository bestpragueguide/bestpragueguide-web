# Design: Image Control, Live Preview & Rich Text Everywhere

**Date:** 2026-03-06
**Version target:** 1.6.0

## Overview

Three enhancements to the CMS editing experience:
1. Enhanced image system with focal point, mobile variants, and per-image display control
2. Payload Live Preview for real-time content editing
3. Rich text (Lexical) editor for all content-editable fields

---

## Part 1: Enhanced Image System

### Media Collection Changes

Change all image size `position` from `'centre'` to `'focalpoint'` so Payload uses the admin-set focal point when generating crops. Add two new mobile-optimized sizes:

| Size | Dimensions | Position | Purpose |
|------|-----------|----------|---------|
| thumbnail | 400x300 | focalpoint | Admin/small previews |
| card | 640x430 | focalpoint | Tour cards (desktop) |
| hero | 1920x1080 | focalpoint | Hero banners (desktop) |
| og | 1200x630 | focalpoint | Social sharing |
| **mobileHero** | 800x600 | focalpoint | Hero banners (mobile) |
| **mobileCard** | 480x480 | focalpoint | Tour cards (mobile, square) |

### Tours Collection Changes

- Add `mobileHeroImage` (optional upload) alongside `heroImage`
- Add `mobileImage` (optional upload) to gallery array items
- Add `objectFit` select field to gallery items: `cover` (default) | `contain` | `fill`

### Frontend Changes

- Use `<picture>` element with `<source media="(max-width: 768px)">` to serve mobile image when uploaded, falling back to regular image
- Apply `object-position` CSS from Payload focal point data (focalX, focalY percentages)
- Gallery images respect per-image `objectFit` setting
- Convert remaining plain `<img>` tags to Next.js `<Image>` where appropriate

---

## Part 2: Payload Live Preview

### Configuration

Add `livePreview` to `payload.config.ts` admin config:

```typescript
admin: {
  livePreview: {
    url: ({ data, collectionConfig, globalConfig, locale }) => {
      // Map collection/global to frontend URL
    },
    collections: ['tours', 'pages', 'blog-posts'],
    globals: ['homepage', 'about-page', 'reviews-page', 'site-settings', 'navigation'],
    breakpoints: [
      { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
      { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
      { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
    ],
  },
}
```

### Frontend Integration

- Install `@payloadcms/live-preview-react`
- Create a `LivePreviewWrapper` client component
- Wrap page content in LivePreviewWrapper when in preview mode
- Uses `useLivePreview` hook to receive real-time updates from admin panel

### Preview URL Mapping

| Source | Preview URL |
|--------|------------|
| Tours | `/{locale}/tours/{slug}` |
| Pages | `/{locale}/{slug}` |
| BlogPosts | `/{locale}/blog/{slug}` |
| Homepage | `/{locale}` |
| AboutPage | `/{locale}/about` |
| ReviewsPage | `/{locale}/reviews` |
| Navigation | `/{locale}` |
| SiteSettings | `/{locale}` |

---

## Part 3: Rich Text for All Textarea Fields

### Fields to Convert

**Collections:**

| Collection | Field | Current Type | New Type | Editor Config |
|-----------|-------|-------------|----------|---------------|
| Tours | excerpt | textarea (200) | richText | simplified (no headings) |
| Tours | faq[].answer | textarea | richText | full |
| Tours | included[].text | text | richText | simplified |
| Tours | excluded[].text | text | richText | simplified |
| Tours | meetingPoint.instructions | textarea | richText | simplified |
| Reviews | body | textarea | richText | full |
| Reviews | guideResponse | textarea | richText | full |
| BookingRequests | specialRequests | textarea | richText | simplified |
| BookingRequests | internalNotes | textarea | richText | full |
| ContactMessages | message | textarea | richText | simplified |
| ContactMessages | internalNotes | textarea | richText | full |
| BlogPosts | excerpt | textarea (300) | richText | simplified |

**Globals:**

| Global | Field | Current Type | New Type | Editor Config |
|--------|-------|-------------|----------|---------------|
| Homepage | guideBio | textarea | richText | full |
| AboutPage | founderBio | textarea | richText | full |
| AboutPage | teamDescription | textarea | richText | full |

### Editor Configurations

**Simplified toolbar** (for short content like excerpts, list items):
- Bold, italic, underline
- Link
- Unordered list

**Full toolbar** (for longer content):
- All of simplified, plus:
- Headings (H2, H3, H4)
- Ordered list
- Blockquote
- Horizontal rule

### Frontend Rendering

All display locations switch from `{field}` or `<p>{field}</p>` to `<RichText data={field} />` using `@payloadcms/richtext-lexical/react`.

Existing plain text data in the database will continue to render — Lexical handles string-to-rich-text conversion gracefully.

---

## Migration Notes

- Image sizes: Re-uploading is not required. New sizes generate on next access. Focal point data already exists if set in admin.
- Rich text fields: Existing plain text data needs migration. Create a one-time migration endpoint that reads existing text values and converts them to Lexical JSON format.
- Schema push required after deploy (`/api/init-db`)
