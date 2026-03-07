# Image Control, Live Preview & Rich Text Implementation Plan

> **Status:** COMPLETED (v1.6.0–v1.6.2, deployed 2026-03-06)

> **For Claude:** This plan has been fully implemented. See CHANGELOG.md [1.6.0]–[1.6.2] for summary.

**Goal:** Add focal-point-aware responsive images with mobile variants, Payload Live Preview for real-time editing, and rich text (Lexical) editors on all content textarea fields.

**Architecture:** Three independent feature tracks: (1) Media collection + frontend image rendering updates, (2) Payload Live Preview config + frontend wrapper, (3) Collection/global schema changes to richText + frontend rendering. All tracks converge in a final schema migration and deploy.

**Tech Stack:** Payload CMS 3.78+, @payloadcms/richtext-lexical, @payloadcms/live-preview-react, Next.js 15 App Router, sharp for image processing.

---

## Task 1: Update Media collection — focal point positioning + mobile sizes

**Files:**
- Modify: `src/collections/Media.ts`

**Step 1: Update image sizes to use focalpoint and add mobile sizes**

Change all `position: 'centre'` to `position: 'focalpoint'` and add `mobileHero` + `mobileCard` sizes:

```typescript
// In src/collections/Media.ts — replace the imageSizes array
imageSizes: [
  {
    name: 'thumbnail',
    width: 400,
    height: 300,
    position: 'focalpoint',
  },
  {
    name: 'card',
    width: 640,
    height: 430,
    position: 'focalpoint',
  },
  {
    name: 'mobileCard',
    width: 480,
    height: 480,
    position: 'focalpoint',
  },
  {
    name: 'hero',
    width: 1920,
    height: 1080,
    position: 'focalpoint',
  },
  {
    name: 'mobileHero',
    width: 800,
    height: 600,
    position: 'focalpoint',
  },
  {
    name: 'og',
    width: 1200,
    height: 630,
    position: 'focalpoint',
  },
],
```

**Step 2: Commit**

```bash
git add src/collections/Media.ts
git commit -m "feat: use focalpoint positioning + add mobile image sizes"
```

---

## Task 2: Add mobile image fields to Tours collection

**Files:**
- Modify: `src/collections/Tours.ts`

**Step 1: Add mobileHeroImage field after heroImage**

After the `heroImage` field (around line 183), add:

```typescript
{
  name: 'mobileHeroImage',
  type: 'upload',
  relationTo: 'media',
  admin: {
    description: 'Optional mobile-specific hero image. Falls back to heroImage if empty.',
  },
},
```

**Step 2: Add mobileImage + objectFit to gallery array items**

In the `gallery` array fields (around line 188), after the existing `alt` field add:

```typescript
{
  name: 'mobileImage',
  type: 'upload',
  relationTo: 'media',
  admin: {
    description: 'Optional mobile-specific image. Falls back to main image.',
  },
},
{
  name: 'objectFit',
  type: 'select',
  defaultValue: 'cover',
  options: [
    { label: 'Cover (fill & crop)', value: 'cover' },
    { label: 'Contain (show all)', value: 'contain' },
    { label: 'Fill (stretch)', value: 'fill' },
  ],
},
```

**Step 3: Commit**

```bash
git add src/collections/Tours.ts
git commit -m "feat: add mobile image overrides and objectFit to tours"
```

---

## Task 3: Update cms-types and cms-data for new image sizes

**Files:**
- Modify: `src/lib/cms-types.ts`
- Modify: `src/lib/cms-data.ts`

**Step 1: Add mobileHero/mobileCard to MediaImage interface**

In `src/lib/cms-types.ts`, update MediaImage:

```typescript
export interface MediaImage {
  id: number
  url?: string
  alt?: string
  focalX?: number
  focalY?: number
  sizes?: {
    thumbnail?: { url?: string }
    card?: { url?: string }
    mobileCard?: { url?: string }
    hero?: { url?: string }
    mobileHero?: { url?: string }
    og?: { url?: string }
  }
}
```

**Step 2: Update resolveMediaUrl to accept new sizes**

In `src/lib/cms-data.ts`, update the type:

```typescript
export function resolveMediaUrl(
  media: any,
  size?: 'thumbnail' | 'card' | 'mobileCard' | 'hero' | 'mobileHero' | 'og',
): string | null {
  if (!media || typeof media === 'number') return null
  if (size && media.sizes?.[size]?.url) return media.sizes[size].url
  if (media.url) return media.url
  return null
}
```

**Step 3: Add helper to extract focal point as CSS object-position**

Add to `src/lib/cms-data.ts`:

```typescript
export function getFocalPointStyle(media: any): string {
  if (!media || typeof media === 'number') return '50% 50%'
  const x = media.focalX ?? 50
  const y = media.focalY ?? 50
  return `${x}% ${y}%`
}
```

**Step 4: Commit**

```bash
git add src/lib/cms-types.ts src/lib/cms-data.ts
git commit -m "feat: add mobile sizes and focal point helpers to CMS data layer"
```

---

## Task 4: Update frontend image rendering — TourCard with focal point + mobile

**Files:**
- Modify: `src/components/tours/TourCard.tsx`

**Step 1: Update TourCard to accept focal point and mobile URL**

Replace the full file:

```tsx
import Link from 'next/link'

interface TourCardProps {
  title: string
  slug: string
  excerpt: string
  duration: number
  groupPrice: number
  rating?: number | null
  heroImageUrl?: string | null
  mobileImageUrl?: string | null
  focalPoint?: string
  locale: string
}

export function TourCard({
  title,
  slug,
  excerpt,
  duration,
  groupPrice,
  rating,
  heroImageUrl,
  mobileImageUrl,
  focalPoint,
  locale,
}: TourCardProps) {
  const objectPosition = focalPoint || '50% 50%'

  return (
    <Link
      href={`/${locale}/tours/${slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-light relative overflow-hidden">
        {heroImageUrl ? (
          <picture>
            {mobileImageUrl && (
              <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
            )}
            <img
              src={heroImageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              style={{ objectPosition }}
              loading="lazy"
            />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray text-sm">
            Tour Photo
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-heading font-semibold text-navy group-hover:text-gold transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="mt-2 text-sm text-gray">{excerpt}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gold">€{groupPrice}</span>
            <span className="text-xs text-gray ml-1">
              {locale === 'ru' ? 'за группу' : 'per group'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray">
            {rating && (
              <span className="flex items-center gap-1">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gold"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {rating.toFixed(1)}
              </span>
            )}
            <span>{duration}h</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

**Step 2: Update callers to pass new props**

In `src/components/tours/TourGrid.tsx`, `src/components/tours/TourRelated.tsx`, and `src/components/home/FeaturedTours.tsx`, add the new props when constructing TourCard data. In each file where TourCard is used, add:

```tsx
mobileImageUrl={
  typeof t.heroImage === 'object'
    ? t.heroImage?.sizes?.mobileCard?.url || null
    : null
}
focalPoint={
  typeof t.heroImage === 'object'
    ? `${t.heroImage?.focalX ?? 50}% ${t.heroImage?.focalY ?? 50}%`
    : undefined
}
```

**Step 3: Commit**

```bash
git add src/components/tours/TourCard.tsx src/components/tours/TourGrid.tsx src/components/tours/TourRelated.tsx src/components/home/FeaturedTours.tsx
git commit -m "feat: TourCard with focal point and mobile image support"
```

---

## Task 5: Update ImageGallery with focal point, mobile images, objectFit

**Files:**
- Modify: `src/components/tours/ImageGallery.tsx`
- Modify: `src/app/(frontend)/[locale]/tours/[slug]/page.tsx`

**Step 1: Update ImageGallery interface and rendering**

Update the GalleryImage interface and add `<picture>` rendering:

```tsx
'use client'

import { useState } from 'react'

interface GalleryImage {
  url: string
  mobileUrl?: string
  alt: string
  caption?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  focalPoint?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 rounded-xl overflow-hidden">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setLightboxIndex(index)}
            className={`relative aspect-[4/3] overflow-hidden group ${
              index === 0 ? 'col-span-2 row-span-2' : ''
            }`}
          >
            <picture>
              {image.mobileUrl && (
                <source media="(max-width: 768px)" srcSet={image.mobileUrl} />
              )}
              <img
                src={image.url}
                alt={image.alt}
                className={`w-full h-full group-hover:scale-105 transition-transform duration-300`}
                style={{
                  objectFit: image.objectFit || 'cover',
                  objectPosition: image.focalPoint || '50% 50%',
                }}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            </picture>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Prev/Next */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex(
                    (lightboxIndex - 1 + images.length) % images.length,
                  )
                }}
                aria-label="Previous"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((lightboxIndex + 1) % images.length)
                }}
                aria-label="Next"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          <img
            src={images[lightboxIndex].url}
            alt={images[lightboxIndex].alt}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
```

**Step 2: Update tour detail page gallery mapping**

In `src/app/(frontend)/[locale]/tours/[slug]/page.tsx`, update the `galleryImages` mapping (around line 181):

```typescript
const galleryImages = ((tour as any).gallery || []).map(
  (item: any) => ({
    url:
      typeof item.image === 'object'
        ? item.image?.sizes?.card?.url || item.image?.url || ''
        : '',
    mobileUrl:
      typeof item.mobileImage === 'object'
        ? item.mobileImage?.sizes?.mobileCard?.url || item.mobileImage?.url || null
        : typeof item.image === 'object'
          ? item.image?.sizes?.mobileCard?.url || null
          : null,
    alt: item.alt || tour.title,
    caption: item.caption,
    objectFit: item.objectFit || 'cover',
    focalPoint:
      typeof item.image === 'object'
        ? `${item.image?.focalX ?? 50}% ${item.image?.focalY ?? 50}%`
        : '50% 50%',
  }),
)
```

**Step 3: Commit**

```bash
git add src/components/tours/ImageGallery.tsx src/app/\(frontend\)/\[locale\]/tours/\[slug\]/page.tsx
git commit -m "feat: ImageGallery with focal point, mobile images, objectFit"
```

---

## Task 6: Update Hero component with focal point

**Files:**
- Modify: `src/components/home/Hero.tsx`

**Step 1: Apply focal point to hero background image**

The Hero component uses Next.js `Image` with `fill`. Add `style={{ objectPosition }}` using the focal point from the media object. The Hero receives `data.heroBackgroundImage` — extract focalX/focalY:

In the Image component, add:

```tsx
style={{
  objectPosition: `${
    typeof data.heroBackgroundImage === 'object'
      ? `${(data.heroBackgroundImage as any)?.focalX ?? 50}% ${(data.heroBackgroundImage as any)?.focalY ?? 50}%`
      : '50% 50%'
  }`,
}}
```

**Step 2: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "feat: Hero background uses focal point positioning"
```

---

## Task 7: Define simplified and full Lexical editor configs

**Files:**
- Create: `src/lib/editors.ts`

**Step 1: Create editor configuration module**

```typescript
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  LinkFeature,
  UnorderedListFeature,
  OrderedListFeature,
  HeadingFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
} from '@payloadcms/richtext-lexical'

export const simplifiedEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    LinkFeature(),
    UnorderedListFeature(),
  ],
})

export const fullEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    LinkFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
  ],
})
```

**Step 2: Verify imports are available**

Run: `cd /home/bestpragueguide/workspace/bestpragueguide-web && npx tsc --noEmit src/lib/editors.ts 2>&1 | head -20`

If imports fail, check `@payloadcms/richtext-lexical` exports and adjust. The feature names may be different — check with:

```bash
grep -r "export.*Feature" node_modules/@payloadcms/richtext-lexical/dist/ | head -30
```

**Step 3: Commit**

```bash
git add src/lib/editors.ts
git commit -m "feat: define simplified and full Lexical editor configs"
```

---

## Task 8: Convert Tours collection textarea fields to richText

**Files:**
- Modify: `src/collections/Tours.ts`

**Step 1: Add editor imports**

At the top of the file:

```typescript
import { simplifiedEditor, fullEditor } from '../lib/editors'
```

**Step 2: Convert fields**

- `excerpt` (textarea, 200 max) → `richText` with `editor: simplifiedEditor`
  - Remove `maxLength: 200`
  - Keep `required: true` and `localized: true`

- `included[].text` (text) → `richText` with `editor: simplifiedEditor`
  - Keep `required: true`

- `excluded[].text` (text) → `richText` with `editor: simplifiedEditor`
  - Keep `required: true`

- `faq[].answer` (textarea) → `richText` with `editor: fullEditor`
  - Keep `required: true`

- `meetingPoint.instructions` (textarea) → `richText` with `editor: simplifiedEditor`
  - Keep `localized: true`

For each field, the change looks like:

```typescript
// Before:
{ name: 'excerpt', type: 'textarea', required: true, localized: true, maxLength: 200 }

// After:
{ name: 'excerpt', type: 'richText', required: true, localized: true, editor: simplifiedEditor }
```

**Step 3: Commit**

```bash
git add src/collections/Tours.ts
git commit -m "feat: convert Tours textarea fields to richText"
```

---

## Task 9: Convert Reviews collection textarea fields to richText

**Files:**
- Modify: `src/collections/Reviews.ts`

**Step 1: Add import and convert fields**

```typescript
import { fullEditor } from '../lib/editors'
```

- `body` (textarea, required, localized) → `richText` with `editor: fullEditor`
- `guideResponse` (textarea, localized) → `richText` with `editor: fullEditor`

**Step 2: Commit**

```bash
git add src/collections/Reviews.ts
git commit -m "feat: convert Reviews textarea fields to richText"
```

---

## Task 10: Convert BookingRequests + ContactMessages textarea fields to richText

**Files:**
- Modify: `src/collections/BookingRequests.ts`
- Modify: `src/collections/ContactMessages.ts`

**Step 1: BookingRequests**

```typescript
import { simplifiedEditor, fullEditor } from '../lib/editors'
```

- `specialRequests` (textarea) → `richText` with `editor: simplifiedEditor`
- `internalNotes` (textarea) → `richText` with `editor: fullEditor`

**Step 2: ContactMessages**

```typescript
import { simplifiedEditor, fullEditor } from '../lib/editors'
```

- `message` (textarea, required) → `richText` with `editor: simplifiedEditor`
- `internalNotes` (textarea) → `richText` with `editor: fullEditor`

**Step 3: Commit**

```bash
git add src/collections/BookingRequests.ts src/collections/ContactMessages.ts
git commit -m "feat: convert BookingRequests + ContactMessages textareas to richText"
```

---

## Task 11: Convert BlogPosts excerpt + SEO metaDescriptions to richText

**Files:**
- Modify: `src/collections/BlogPosts.ts`

**Step 1: Convert BlogPosts excerpt**

```typescript
import { simplifiedEditor } from '../lib/editors'
```

- `excerpt` (textarea, 300 max) → `richText` with `editor: simplifiedEditor`
  - Remove `maxLength: 300`

Note: Keep `seo.metaDescription` as textarea — SEO meta descriptions must be plain text for HTML meta tags.

**Step 2: Commit**

```bash
git add src/collections/BlogPosts.ts
git commit -m "feat: convert BlogPosts excerpt to richText"
```

---

## Task 12: Convert Homepage and AboutPage global textarea fields to richText

**Files:**
- Modify: `src/globals/Homepage.ts`
- Modify: `src/globals/AboutPage.ts`

**Step 1: Homepage — convert guideBio**

```typescript
import { fullEditor } from '../lib/editors'
```

Change `guideBio` from `type: 'textarea'` to `type: 'richText'` with `editor: fullEditor`.

Note: Keep `seo.metaDescription` as textarea — must be plain text for meta tags.

**Step 2: AboutPage — convert founderBio and teamDescription**

```typescript
import { fullEditor } from '../lib/editors'
```

- `founderBio` (textarea) → `richText` with `editor: fullEditor`
- `teamDescription` (textarea) → `richText` with `editor: fullEditor`

Note: Keep `seo.metaDescription` as textarea.

**Step 3: Commit**

```bash
git add src/globals/Homepage.ts src/globals/AboutPage.ts
git commit -m "feat: convert Homepage guideBio + AboutPage bios to richText"
```

---

## Task 13: Update frontend components — render richText instead of plain text

**Files:**
- Modify: `src/components/tours/TourIncluded.tsx`
- Modify: `src/components/tours/TourFAQ.tsx`
- Modify: `src/components/tours/TourReviews.tsx`
- Modify: `src/components/reviews/ReviewCard.tsx`
- Modify: `src/components/home/GuideProfile.tsx`
- Modify: `src/app/(frontend)/[locale]/about/page.tsx`
- Modify: `src/app/(frontend)/[locale]/tours/[slug]/page.tsx`

**Step 1: Create a SafeRichText helper for fields that may be plain text or richText**

Create `src/components/shared/SafeRichText.tsx`:

```tsx
import { RichText } from '@payloadcms/richtext-lexical/react'

interface SafeRichTextProps {
  data: any
  className?: string
}

export function SafeRichText({ data, className }: SafeRichTextProps) {
  if (!data) return null

  // If it's a plain string (legacy data), render as paragraph
  if (typeof data === 'string') {
    return <p className={className}>{data}</p>
  }

  // If it's Lexical richText format
  if (data?.root) {
    return (
      <div className={className}>
        <RichText data={data} />
      </div>
    )
  }

  return null
}
```

**Step 2: Update TourIncluded**

Change the interface and rendering:

```tsx
import { SafeRichText } from '@/components/shared/SafeRichText'

interface TourIncludedProps {
  included: Array<{ text: any }>
  excluded: Array<{ text: any }>
  locale: string
}
```

Replace `<span className="text-navy">{item.text}</span>` with:
```tsx
<SafeRichText data={item.text} className="text-navy [&_p]:inline" />
```

Replace `<span className="text-gray">{item.text}</span>` with:
```tsx
<SafeRichText data={item.text} className="text-gray [&_p]:inline" />
```

**Step 3: Update TourFAQ**

Change the `answer` type in FAQItem interface to `any` and replace the answer `<p>` with SafeRichText:

```tsx
import { SafeRichText } from '@/components/shared/SafeRichText'

interface FAQItem {
  question: string
  answer: any
}
```

Replace `<p className="text-sm text-gray leading-relaxed">{item.answer}</p>` with:
```tsx
<SafeRichText data={item.answer} className="text-sm text-gray leading-relaxed prose prose-sm max-w-none" />
```

**Step 4: Update TourReviews**

Change Review.body to `any`:

```tsx
interface Review {
  customerName: string
  customerCountry?: string | null
  rating: number
  body: any
}
```

Replace `<p className="text-sm text-navy/70 leading-relaxed">{review.body}</p>` with:
```tsx
<SafeRichText data={review.body} className="text-sm text-navy/70 leading-relaxed" />
```

**Step 5: Update ReviewCard**

Same pattern — change `body: string` to `body: any`, use SafeRichText:

```tsx
import { SafeRichText } from '@/components/shared/SafeRichText'
```

Replace `<p className="text-sm text-navy/70 leading-relaxed">{body}</p>` with:
```tsx
<SafeRichText data={body} className="text-sm text-navy/70 leading-relaxed" />
```

**Step 6: Update GuideProfile**

Change guideBio rendering from `<p>` to SafeRichText:

```tsx
import { SafeRichText } from '@/components/shared/SafeRichText'
```

Replace `<p className="mt-6 text-lg text-navy/70 leading-relaxed">{data.guideBio}</p>` with:
```tsx
<SafeRichText data={data.guideBio} className="mt-6 text-lg text-navy/70 leading-relaxed prose prose-lg max-w-none" />
```

**Step 7: Update About page**

Replace `<p className="mt-6 text-lg text-navy/70 leading-relaxed">{data.founderBio}</p>` with:
```tsx
<SafeRichText data={data.founderBio} className="mt-6 text-lg text-navy/70 leading-relaxed prose prose-lg max-w-none" />
```

Add SafeRichText import at top.

**Step 8: Update tour detail page — meeting point instructions**

Replace `<p className="text-sm text-gray mb-4">{(tour as any).meetingPoint.instructions}</p>` with:
```tsx
<SafeRichText data={(tour as any).meetingPoint.instructions} className="text-sm text-gray mb-4" />
```

Add SafeRichText import at top.

**Step 9: Commit**

```bash
git add src/components/shared/SafeRichText.tsx src/components/tours/TourIncluded.tsx src/components/tours/TourFAQ.tsx src/components/tours/TourReviews.tsx src/components/reviews/ReviewCard.tsx src/components/home/GuideProfile.tsx src/app/\(frontend\)/\[locale\]/about/page.tsx src/app/\(frontend\)/\[locale\]/tours/\[slug\]/page.tsx
git commit -m "feat: render richText in all frontend components with SafeRichText helper"
```

---

## Task 14: Update cms-types for richText fields

**Files:**
- Modify: `src/lib/cms-types.ts`

**Step 1: Change string types to any for richText fields**

- `HomepageData.guideBio: string` → `guideBio: any`
- `AboutPageData.founderBio: string` → `founderBio: any`
- `AboutPageData.teamDescription: string` → `teamDescription: any`

**Step 2: Commit**

```bash
git add src/lib/cms-types.ts
git commit -m "feat: update cms-types for richText fields"
```

---

## Task 15: Install and configure Payload Live Preview

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/payload.config.ts`
- Create: `src/components/shared/LivePreviewListener.tsx`

**Step 1: Install the live preview package**

```bash
npm install @payloadcms/live-preview-react
```

**Step 2: Configure livePreview in payload.config.ts**

Add to the `admin` object in `buildConfig`:

```typescript
admin: {
  user: 'users',
  meta: {
    titleSuffix: '— Best Prague Guide',
  },
  importMap: {
    baseDir: path.resolve(dirname),
  },
  livePreview: {
    url: ({ data, collectionConfig, globalConfig, locale }) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      const loc = (locale as string) || 'en'

      // Collections
      if (collectionConfig) {
        switch (collectionConfig.slug) {
          case 'tours':
            return `${baseUrl}/${loc}/tours/${data?.slug || ''}`
          case 'pages':
            return `${baseUrl}/${loc}/${data?.slug || ''}`
          case 'blog-posts':
            return `${baseUrl}/${loc}/blog/${data?.slug || ''}`
          default:
            return `${baseUrl}/${loc}`
        }
      }

      // Globals
      if (globalConfig) {
        switch (globalConfig.slug) {
          case 'homepage':
            return `${baseUrl}/${loc}`
          case 'about-page':
            return `${baseUrl}/${loc}/about`
          case 'reviews-page':
            return `${baseUrl}/${loc}/reviews`
          default:
            return `${baseUrl}/${loc}`
        }
      }

      return `${baseUrl}/${loc}`
    },
    collections: ['tours', 'pages', 'blog-posts'],
    globals: ['homepage', 'about-page', 'reviews-page', 'site-settings', 'navigation'],
    breakpoints: [
      { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
      { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
      { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
    ],
  },
},
```

**Step 3: Create LivePreviewListener client component**

Create `src/components/shared/LivePreviewListener.tsx`:

```tsx
'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface LivePreviewListenerProps {
  initialData: any
  serverURL: string
  depth?: number
}

export function LivePreviewListener({
  initialData,
  serverURL,
  depth = 2,
}: LivePreviewListenerProps) {
  const router = useRouter()
  const { data } = useLivePreview({
    initialData,
    serverURL,
    depth,
  })

  useEffect(() => {
    if (data !== initialData) {
      router.refresh()
    }
  }, [data, initialData, router])

  return null
}
```

**Step 4: Commit**

```bash
git add package.json package-lock.json src/payload.config.ts src/components/shared/LivePreviewListener.tsx
git commit -m "feat: configure Payload Live Preview with breakpoints"
```

---

## Task 16: Build, lint, and fix any issues

**Step 1: Run lint**

```bash
cd /home/bestpragueguide/workspace/bestpragueguide-web && npm run lint 2>&1 | head -50
```

**Step 2: Run build**

```bash
npm run build 2>&1 | tail -50
```

**Step 3: Fix any TypeScript or lint errors**

Address each error. Common issues:
- Lexical feature import names may differ — check actual exports from `@payloadcms/richtext-lexical`
- Type mismatches between `string` and `any` (richText) in props
- Missing SafeRichText import in any component

**Step 4: Commit fixes**

```bash
git add -A
git commit -m "fix: resolve lint and build errors from richText + image changes"
```

---

## Task 17: Create data migration endpoint for existing text → richText

**Files:**
- Create: `src/app/api/migrate-richtext/route.ts`

**Step 1: Create migration endpoint**

This endpoint converts existing plain text data in the database to Lexical richText JSON format:

```typescript
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

function textToLexical(text: string) {
  if (!text) return null
  return {
    root: {
      type: 'root',
      children: text.split('\n').filter(Boolean).map((paragraph) => ({
        type: 'paragraph',
        children: [{ type: 'text', text: paragraph, version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const results: string[] = []

    // Migrate Reviews body + guideResponse
    const reviews = await payload.find({ collection: 'reviews', limit: 1000 })
    for (const review of reviews.docs) {
      const updates: any = {}
      if (typeof review.body === 'string') {
        updates.body = textToLexical(review.body)
      }
      if (typeof (review as any).guideResponse === 'string') {
        updates.guideResponse = textToLexical((review as any).guideResponse)
      }
      if (Object.keys(updates).length > 0) {
        await payload.update({ collection: 'reviews', id: review.id, data: updates })
        results.push(`review:${review.id}`)
      }
    }

    // Note: Tours fields (excerpt, faq answers, included/excluded, instructions)
    // will need similar migration if they contain existing data.
    // Add more collection migrations as needed.

    return NextResponse.json({ success: true, migrated: results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/migrate-richtext/route.ts
git commit -m "feat: add migrate-richtext endpoint for text-to-lexical conversion"
```

---

## Task 18: Update CHANGELOG, VERSION, docs, and deploy

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `VERSION`
- Modify: `CLAUDE.md` (if needed)

**Step 1: Bump version to 1.6.0**

Update `VERSION` to `1.6.0`.

**Step 2: Add CHANGELOG entry**

Add a `## 1.6.0` section covering:
- Enhanced image system with focal point positioning and mobile image variants
- Payload Live Preview for real-time editing with responsive breakpoints
- Rich text (Lexical) editor on all content textarea fields
- SafeRichText component for backward-compatible rendering
- Data migration endpoint for existing text content

**Step 3: Commit and push**

```bash
git add CHANGELOG.md VERSION CLAUDE.md
git commit -m "release: v1.6.0 — image control, live preview, rich text everywhere"
git push origin main
```

**Step 4: Deploy and push schema**

After Coolify auto-deploys:

```bash
# Wait for deploy then push schema
curl -s -X POST --max-time 300 "https://bestpragueguide.com/api/init-db" \
  -H "x-init-secret: $PAYLOAD_SECRET" \
  -H "Content-Type: application/json"
```

**Step 5: Run data migration**

```bash
curl -s -X POST --max-time 300 "https://bestpragueguide.com/api/migrate-richtext" \
  -H "x-init-secret: $PAYLOAD_SECRET" \
  -H "Content-Type: application/json"
```

---

## Summary of Changes

| Area | Files Modified | Files Created |
|------|---------------|---------------|
| Media/Images | Media.ts, Tours.ts, cms-types.ts, cms-data.ts, TourCard.tsx, TourGrid.tsx, TourRelated.tsx, FeaturedTours.tsx, ImageGallery.tsx, Hero.tsx, tour detail page | — |
| Rich Text | Tours.ts, Reviews.ts, BookingRequests.ts, ContactMessages.ts, BlogPosts.ts, Homepage.ts, AboutPage.ts, TourIncluded.tsx, TourFAQ.tsx, TourReviews.tsx, ReviewCard.tsx, GuideProfile.tsx, About page, tour detail page, cms-types.ts | editors.ts, SafeRichText.tsx, migrate-richtext/route.ts |
| Live Preview | payload.config.ts, package.json | LivePreviewListener.tsx |
