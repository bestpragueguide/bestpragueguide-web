# Tour Pricing Configuration — Implementation Plan

> **Status:** COMPLETED (v1.7.0, deployed 2026-03-07)

> **For Claude:** This plan has been fully implemented. See CHANGELOG.md [1.7.0] for summary.

**Goal:** Replace the flat `groupPrice` + `groupSurchargePercent` pricing with a flexible, multi-model pricing system configurable entirely from Payload CMS admin.

**Architecture:** Add a `pricing` group to the Tours collection supporting 4 models (GROUP_TIERS, PER_PERSON, FLAT_RATE, ON_REQUEST). Create a new Services collection for reusable additional services (entry tickets, vehicles, etc.) with independent pricing. Build a shared `calculatePrice()` engine used by both frontend display and booking submission. Migrate existing 21 tours from flat pricing to GROUP_TIERS format.

**Tech Stack:** Payload CMS 3.x (collection config), TypeScript (pricing engine), React (display components), Zod (validation), PostgreSQL (storage)

**Source Spec:** `~/workspace/bestpragueguide-docs/tour-pricing-configuration.md`

---

## Current State

| Item | Current | Target |
|------|---------|--------|
| Pricing fields on Tours | `groupPrice` (number), `groupSurchargePercent` (number, default 30) | `pricing` group with model selector + model-specific fields |
| Pricing models | 1 (flat per-group + surcharge) | 4 (GROUP_TIERS, PER_PERSON, FLAT_RATE, ON_REQUEST) |
| Services | None | Standalone collection with own pricing |
| Guest selector max | Hardcoded 8 | Dynamic from `maxGroupSize` or tier max |
| Price calculation | Client-only (BookingRequestForm.tsx:43-46) | Shared lib (`src/lib/pricing.ts`) used by client + server |
| "Contact us" fallback | None | Per-tier, per-threshold, or full ON_REQUEST |
| Schema.org | Always shows `groupPrice` as EUR | Shows lowest price or price range |
| Booking validation | `guests: z.number().min(1).max(8)` | Dynamic max from tour config |
| Guest breakdown | None | Per-category counts (Junior/Adult/Senior) that must sum to group size (configurable per service) |

## Files Affected

### New files
- `src/collections/Services.ts` — Services collection config
- `src/lib/pricing.ts` — `calculatePrice()`, `calculateServicePrice()`, `validateGuestBreakdown()`, `getDisplayPrice()`, types
- `src/components/tours/PriceDisplay.tsx` — Renders pricing summary on tour cards and detail pages
- `src/components/booking/ServiceSelector.tsx` — Optional service add-ons in booking form
- `src/components/booking/GuestBreakdownSelector.tsx` — Per-category guest count allocation (e.g. 2 juniors + 4 adults = 6 total)

### Modified files
- `src/collections/Tours.ts` — Replace `groupPrice`/`groupSurchargePercent` with `pricing` group
- `src/lib/cms-types.ts` — Add `TourPricing`, `ServiceData`, update tour types
- `src/payload.config.ts` — Register Services collection
- `src/components/tours/TourCard.tsx` — Use `PriceDisplay` instead of hardcoded `€{groupPrice}`
- `src/components/booking/BookingRequestForm.tsx` — Use `calculatePrice()`, support ON_REQUEST, dynamic guest max
- `src/components/booking/StickyBookButton.tsx` — Use `PriceDisplay`, handle ON_REQUEST
- `src/components/booking/BookingModal.tsx` — Pass new pricing props
- `src/components/seo/TourSchema.tsx` — Dynamic price from pricing engine
- `src/app/(frontend)/[locale]/tours/[slug]/page.tsx` — Pass `pricing` object to components
- `src/app/(frontend)/[locale]/tours/page.tsx` — Pass pricing to TourCard
- `src/app/api/booking/request/route.ts` — Server-side price verification
- `src/lib/booking.ts` — Dynamic `guests.max`, add `pricingBreakdown` to schema
- `src/lib/currency.ts` — Add `formatPriceRange()` function
- `src/collections/BookingRequests.ts` — Add `pricingBreakdown` field
- `src/lib/whatsapp.ts` — Format pricing breakdown in notifications
- `src/lib/telegram.ts` — Format pricing breakdown in notifications
- `src/lib/slack.ts` — Format pricing breakdown in notifications
- `CHANGELOG.md`, `VERSION`, `CLAUDE.md` — Documentation updates

---

## Task 1: Create pricing engine library (`src/lib/pricing.ts`)

This is the core logic — build it first so everything else can depend on it.

**Files:**
- Create: `src/lib/pricing.ts`
- Modify: `src/lib/cms-types.ts`
- Modify: `src/lib/currency.ts`

**Step 1: Add pricing types to cms-types.ts**

```typescript
// Add to src/lib/cms-types.ts

export type PricingModel = 'GROUP_TIERS' | 'PER_PERSON' | 'FLAT_RATE' | 'ON_REQUEST'

export interface GroupTier {
  minGuests: number
  maxGuests?: number | null  // null = no upper limit
  price?: number | null      // null = on request
  onRequest?: boolean
}

export interface GuestCategory {
  label: string
  ageMin?: number
  ageMax?: number | null     // null = no upper limit
  priceModifier?: number     // e.g. +5 EUR per person
  isFree?: boolean
  onRequest?: boolean
}

export interface TourServiceAttachment {
  service: ServiceData | number
  overridePricing?: boolean
  customPricingNote?: string
}

export interface TourPricing {
  model: PricingModel
  currency?: string          // default EUR
  groupTiers?: GroupTier[]
  perPersonPrice?: number
  perPersonMaxGuests?: number
  flatRatePrice?: number
  flatRateMaxGuests?: number
  onRequestNote?: string
  guestCategories?: GuestCategory[]
  additionalServices?: TourServiceAttachment[]
}

export type ServiceType =
  | 'ENTRY_TICKET' | 'VEHICLE' | 'RESTAURANT' | 'DRIVER'
  | 'BOAT_TICKET' | 'AUDIO_HEADSET' | 'VR' | 'OTHER'

export type ServicePricingModel = 'PER_PERSON' | 'GROUP_TIERS' | 'FLAT' | 'ON_REQUEST'

export interface ServiceGuestCategoryPrice {
  label: string
  ageMin?: number
  ageMax?: number | null
  price?: number | null
  isFree?: boolean
  onRequest?: boolean
}

export interface ServiceGroupTier {
  minGuests: number
  maxGuests?: number | null
  price?: number | null
  onRequest?: boolean
}

export interface ServiceData {
  id: number
  name: string
  type: ServiceType
  description?: string
  pricingModel: ServicePricingModel
  requireGuestBreakdown?: boolean  // When true + PER_PERSON + guestCategoryPricing, customer must allocate all guests to categories (sum = group size)
  guestCategoryPricing?: ServiceGuestCategoryPrice[]
  groupTierPricing?: ServiceGroupTier[]
  flatPrice?: number
  onRequestThreshold?: number
}

/**
 * Guest breakdown submitted with booking — maps category label to count.
 * Example: { "Adult (18-59)": 4, "Junior (6-17)": 2 }
 * Sum of all values must equal total guest count when requireGuestBreakdown is true.
 */
export type GuestBreakdown = Record<string, number>
```

Also update the existing tour-related interface — remove `groupPrice` and `groupSurchargePercent`, add `pricing`:

```typescript
// In whatever interface currently holds groupPrice (check actual tour data type used in TourCard etc.)
// Note: keep groupPrice as optional for backward compatibility during migration
```

**Step 2: Add `formatPriceRange()` to currency.ts**

```typescript
// Add to src/lib/currency.ts

export function formatPriceRange(
  minPrice: number,
  maxPrice: number | null,
  currency: Currency = 'EUR',
): string {
  if (maxPrice === null || maxPrice === minPrice) {
    return formatPrice(minPrice, currency)
  }
  return `${formatPrice(minPrice, currency)}–${formatPrice(maxPrice, currency)}`
}
```

**Step 3: Create src/lib/pricing.ts**

```typescript
import type {
  TourPricing, GroupTier, ServiceData, ServiceGroupTier,
  ServiceGuestCategoryPrice, PricingModel,
} from './cms-types'

export interface PriceResult {
  basePrice: number | null
  servicesTotal: number
  total: number | null
  isOnRequest: boolean
  breakdown: PriceBreakdown
}

export interface PriceBreakdown {
  model: PricingModel
  guestCount: number
  basePriceLabel: string       // e.g. "1–4 guests", "per person", "flat rate"
  baseAmount: number | null
  services: ServiceBreakdownItem[]
}

export interface ServiceBreakdownItem {
  name: string
  amount: number | null
  isOnRequest: boolean
}

/**
 * @param guestBreakdowns — keyed by service ID, maps category label → count.
 *   Only needed for services with requireGuestBreakdown=true.
 *   Example: { 42: { "Adult (18-59)": 4, "Junior (6-17)": 2 } }
 */
export function calculatePrice(
  pricing: TourPricing,
  guestCount: number,
  selectedServices?: ServiceData[],
  guestBreakdowns?: Record<number, GuestBreakdown>,
): PriceResult {
  let basePrice: number | null = null
  let isOnRequest = false
  let basePriceLabel = ''

  switch (pricing.model) {
    case 'GROUP_TIERS': {
      const tier = findTier(pricing.groupTiers || [], guestCount)
      if (!tier || tier.onRequest || tier.price == null) {
        isOnRequest = true
        basePriceLabel = `${guestCount}+ guests`
      } else {
        basePrice = tier.price
        basePriceLabel = tier.maxGuests
          ? `${tier.minGuests}–${tier.maxGuests} guests`
          : `${tier.minGuests}+ guests`
      }
      break
    }

    case 'PER_PERSON': {
      if (pricing.perPersonMaxGuests && guestCount > pricing.perPersonMaxGuests) {
        isOnRequest = true
        basePriceLabel = `${guestCount} guests (over ${pricing.perPersonMaxGuests} max)`
      } else {
        basePrice = (pricing.perPersonPrice || 0) * guestCount
        basePriceLabel = `${guestCount} × ${pricing.perPersonPrice} per person`
      }
      break
    }

    case 'FLAT_RATE': {
      if (pricing.flatRateMaxGuests && guestCount > pricing.flatRateMaxGuests) {
        isOnRequest = true
        basePriceLabel = `${guestCount} guests (over ${pricing.flatRateMaxGuests} max)`
      } else {
        basePrice = pricing.flatRatePrice || 0
        basePriceLabel = pricing.flatRateMaxGuests
          ? `flat rate (up to ${pricing.flatRateMaxGuests})`
          : 'flat rate'
      }
      break
    }

    case 'ON_REQUEST': {
      isOnRequest = true
      basePriceLabel = pricing.onRequestNote || 'Contact us for pricing'
      break
    }
  }

  // Calculate services
  let servicesTotal = 0
  const serviceItems: ServiceBreakdownItem[] = []

  for (const service of selectedServices ?? []) {
    const breakdown = guestBreakdowns?.[service.id]
    const result = calculateServicePrice(service, guestCount, breakdown)
    serviceItems.push({
      name: service.name,
      amount: result.amount,
      isOnRequest: result.isOnRequest,
    })
    if (!result.breakdownValid) {
      // Breakdown incomplete — can't calculate yet, but don't mark as onRequest
      continue
    }
    if (result.isOnRequest) isOnRequest = true
    else servicesTotal += result.amount ?? 0
  }

  return {
    basePrice,
    servicesTotal,
    total: isOnRequest && basePrice === null ? null : (basePrice ?? 0) + servicesTotal,
    isOnRequest,
    breakdown: {
      model: pricing.model,
      guestCount,
      basePriceLabel,
      baseAmount: basePrice,
      services: serviceItems,
    },
  }
}

export function calculateServicePrice(
  service: ServiceData,
  guestCount: number,
  guestBreakdown?: GuestBreakdown,
): { amount: number | null; isOnRequest: boolean; breakdownValid: boolean } {
  if (service.onRequestThreshold && guestCount > service.onRequestThreshold) {
    return { amount: null, isOnRequest: true, breakdownValid: true }
  }

  switch (service.pricingModel) {
    case 'PER_PERSON': {
      if (!service.guestCategoryPricing?.length) {
        return { amount: null, isOnRequest: true, breakdownValid: true }
      }

      // If requireGuestBreakdown and we have a breakdown, calculate per-category
      if (service.requireGuestBreakdown && guestBreakdown) {
        // Validate: breakdown sum must equal guestCount
        const breakdownSum = Object.values(guestBreakdown).reduce((a, b) => a + b, 0)
        if (breakdownSum !== guestCount) {
          return { amount: null, isOnRequest: false, breakdownValid: false }
        }

        let total = 0
        let hasOnRequest = false
        for (const category of service.guestCategoryPricing) {
          const count = guestBreakdown[category.label] || 0
          if (count === 0) continue
          if (category.onRequest) { hasOnRequest = true; continue }
          if (category.isFree) continue
          total += (category.price ?? 0) * count
        }
        if (hasOnRequest) return { amount: null, isOnRequest: true, breakdownValid: true }
        return { amount: total, isOnRequest: false, breakdownValid: true }
      }

      // If requireGuestBreakdown but no breakdown provided yet, return null
      // (form must collect breakdown before we can calculate)
      if (service.requireGuestBreakdown && !guestBreakdown) {
        return { amount: null, isOnRequest: false, breakdownValid: false }
      }

      // No breakdown required — use most expensive non-free category × guestCount
      const adultCategory = service.guestCategoryPricing.find(
        c => !c.isFree && !c.onRequest && c.price != null
      )
      if (!adultCategory) return { amount: null, isOnRequest: true, breakdownValid: true }
      return { amount: (adultCategory.price ?? 0) * guestCount, isOnRequest: false, breakdownValid: true }
    }

    case 'GROUP_TIERS': {
      const tier = findServiceTier(service.groupTierPricing || [], guestCount)
      if (!tier || tier.onRequest || tier.price == null) {
        return { amount: null, isOnRequest: true, breakdownValid: true }
      }
      return { amount: tier.price, isOnRequest: false, breakdownValid: true }
    }

    case 'FLAT': {
      return { amount: service.flatPrice ?? 0, isOnRequest: false, breakdownValid: true }
    }

    case 'ON_REQUEST':
      return { amount: null, isOnRequest: true, breakdownValid: true }
  }
}

/**
 * Validate that a guest breakdown is complete for a service.
 * Returns true if no breakdown is required, or if breakdown sums to guestCount.
 */
export function validateGuestBreakdown(
  service: ServiceData,
  guestCount: number,
  guestBreakdown?: GuestBreakdown,
): { valid: boolean; error?: string } {
  if (!service.requireGuestBreakdown) return { valid: true }
  if (!service.guestCategoryPricing?.length) return { valid: true }
  if (!guestBreakdown) {
    return { valid: false, error: 'Please specify guest categories' }
  }
  const sum = Object.values(guestBreakdown).reduce((a, b) => a + b, 0)
  if (sum !== guestCount) {
    return {
      valid: false,
      error: `Guest categories must total ${guestCount} (currently ${sum})`,
    }
  }
  return { valid: true }
}

function findTier(tiers: GroupTier[], guestCount: number): GroupTier | undefined {
  return tiers.find(
    t => guestCount >= t.minGuests && (t.maxGuests == null || guestCount <= t.maxGuests)
  )
}

function findServiceTier(tiers: ServiceGroupTier[], guestCount: number): ServiceGroupTier | undefined {
  return tiers.find(
    t => guestCount >= t.minGuests && (t.maxGuests == null || guestCount <= t.maxGuests)
  )
}

/**
 * Get the "from" price for display on listings/cards.
 * Returns the lowest available price, or null if ON_REQUEST.
 */
export function getDisplayPrice(pricing: TourPricing): {
  fromPrice: number | null
  isPerPerson: boolean
  isOnRequest: boolean
  maxGroupSize: number | null
} {
  switch (pricing.model) {
    case 'GROUP_TIERS': {
      const tiers = (pricing.groupTiers || []).filter(t => !t.onRequest && t.price != null)
      if (tiers.length === 0) return { fromPrice: null, isPerPerson: false, isOnRequest: true, maxGroupSize: null }
      const lowest = Math.min(...tiers.map(t => t.price!))
      const allTiers = pricing.groupTiers || []
      const maxTier = allTiers[allTiers.length - 1]
      const maxGroupSize = maxTier?.maxGuests ?? null
      return { fromPrice: lowest, isPerPerson: false, isOnRequest: false, maxGroupSize }
    }

    case 'PER_PERSON':
      return {
        fromPrice: pricing.perPersonPrice ?? null,
        isPerPerson: true,
        isOnRequest: pricing.perPersonPrice == null,
        maxGroupSize: pricing.perPersonMaxGuests ?? null,
      }

    case 'FLAT_RATE':
      return {
        fromPrice: pricing.flatRatePrice ?? null,
        isPerPerson: false,
        isOnRequest: pricing.flatRatePrice == null,
        maxGroupSize: pricing.flatRateMaxGuests ?? null,
      }

    case 'ON_REQUEST':
      return { fromPrice: null, isPerPerson: false, isOnRequest: true, maxGroupSize: null }
  }
}

/**
 * Get the effective maximum guest count for the booking form.
 * Returns the highest tier's maxGuests, or maxGroupSize from tour, or 8 as fallback.
 */
export function getMaxGuests(pricing: TourPricing, tourMaxGroupSize?: number): number {
  switch (pricing.model) {
    case 'GROUP_TIERS': {
      const tiers = pricing.groupTiers || []
      // If last tier has no max (on request for larger), use the previous tier's max
      // or the last priced tier's maxGuests
      const pricedTiers = tiers.filter(t => !t.onRequest && t.price != null)
      if (pricedTiers.length === 0) return tourMaxGroupSize || 8
      const lastPriced = pricedTiers[pricedTiers.length - 1]
      return lastPriced.maxGuests ?? tourMaxGroupSize ?? 8
    }

    case 'PER_PERSON':
      return pricing.perPersonMaxGuests ?? tourMaxGroupSize ?? 8

    case 'FLAT_RATE':
      return pricing.flatRateMaxGuests ?? tourMaxGroupSize ?? 8

    case 'ON_REQUEST':
      return tourMaxGroupSize || 8
  }
}
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/pricing.ts src/lib/cms-types.ts src/lib/currency.ts
git commit -m "feat: add pricing engine library with multi-model support"
```

---

## Task 2: Create Services collection

**Files:**
- Create: `src/collections/Services.ts`
- Modify: `src/payload.config.ts`

**Step 1: Create src/collections/Services.ts**

```typescript
import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'pricingModel'],
    group: 'Content',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Entry Ticket', value: 'ENTRY_TICKET' },
        { label: 'Vehicle', value: 'VEHICLE' },
        { label: 'Restaurant', value: 'RESTAURANT' },
        { label: 'Driver', value: 'DRIVER' },
        { label: 'Boat Ticket', value: 'BOAT_TICKET' },
        { label: 'Audio Headset', value: 'AUDIO_HEADSET' },
        { label: 'VR Experience', value: 'VR' },
        { label: 'Other', value: 'OTHER' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'pricingModel',
      type: 'select',
      required: true,
      options: [
        { label: 'Per Person', value: 'PER_PERSON' },
        { label: 'Group Tiers', value: 'GROUP_TIERS' },
        { label: 'Flat Rate', value: 'FLAT' },
        { label: 'On Request', value: 'ON_REQUEST' },
      ],
    },
    {
      name: 'requireGuestBreakdown',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (data) => data?.pricingModel === 'PER_PERSON',
        description: 'When enabled, customer must specify how many guests in each category (total must equal group size). Typical for entry tickets.',
      },
    },
    {
      name: 'guestCategoryPricing',
      type: 'array',
      admin: {
        condition: (data) => data?.pricingModel === 'PER_PERSON',
        description: 'Price per person broken down by guest age category',
      },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'ageMin', type: 'number' },
        { name: 'ageMax', type: 'number', admin: { description: 'Leave empty for no upper limit' } },
        { name: 'price', type: 'number', admin: { description: 'Price in EUR. Leave empty if free or on request.' } },
        { name: 'isFree', type: 'checkbox', defaultValue: false },
        { name: 'onRequest', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'groupTierPricing',
      type: 'array',
      admin: {
        condition: (data) => data?.pricingModel === 'GROUP_TIERS',
        description: 'Price per group size range',
      },
      fields: [
        { name: 'minGuests', type: 'number', required: true },
        { name: 'maxGuests', type: 'number', admin: { description: 'Leave empty for no upper limit' } },
        { name: 'price', type: 'number', admin: { description: 'Price in EUR. Leave empty if on request.' } },
        { name: 'onRequest', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'flatPrice',
      type: 'number',
      admin: {
        condition: (data) => data?.pricingModel === 'FLAT',
        description: 'Flat price in EUR',
      },
    },
    {
      name: 'onRequestThreshold',
      type: 'number',
      admin: {
        description: 'Groups larger than this trigger "contact us" pricing',
      },
    },
  ],
}
```

**Step 2: Register in payload.config.ts**

Add to imports:
```typescript
import { Services } from './collections/Services'
```

Add to `collections` array after `FAQs`:
```typescript
collections: [
  // ... existing ...
  Services,
],
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add src/collections/Services.ts src/payload.config.ts
git commit -m "feat: add Services collection for reusable tour add-ons"
```

---

## Task 3: Add pricing group to Tours collection

Replace `groupPrice` + `groupSurchargePercent` with the new `pricing` group.

**Files:**
- Modify: `src/collections/Tours.ts`

**Step 1: Replace pricing fields in Tours.ts**

Remove the `groupPrice` and `groupSurchargePercent` fields. Add a `pricing` group after `maxGroupSize`:

```typescript
{
  name: 'pricing',
  type: 'group',
  fields: [
    {
      name: 'model',
      type: 'select',
      required: true,
      defaultValue: 'GROUP_TIERS',
      options: [
        { label: 'Group Tiers', value: 'GROUP_TIERS' },
        { label: 'Per Person', value: 'PER_PERSON' },
        { label: 'Flat Rate', value: 'FLAT_RATE' },
        { label: 'On Request', value: 'ON_REQUEST' },
      ],
      admin: {
        description: 'How pricing is calculated for this tour',
      },
    },
    {
      name: 'groupTiers',
      type: 'array',
      admin: {
        condition: (data) => data?.pricing?.model === 'GROUP_TIERS',
        description: 'Price tiers by group size. Add rows from smallest to largest group.',
      },
      fields: [
        { name: 'minGuests', type: 'number', required: true, admin: { width: '25%' } },
        { name: 'maxGuests', type: 'number', admin: { width: '25%', description: 'Empty = no upper limit' } },
        { name: 'price', type: 'number', admin: { width: '25%', description: 'EUR. Empty = on request' } },
        { name: 'onRequest', type: 'checkbox', defaultValue: false, admin: { width: '25%' } },
      ],
    },
    {
      name: 'perPersonPrice',
      type: 'number',
      admin: {
        condition: (data) => data?.pricing?.model === 'PER_PERSON',
        description: 'Price per guest in EUR',
      },
    },
    {
      name: 'perPersonMaxGuests',
      type: 'number',
      admin: {
        condition: (data) => data?.pricing?.model === 'PER_PERSON',
        description: 'Groups above this size → Contact us',
      },
    },
    {
      name: 'flatRatePrice',
      type: 'number',
      admin: {
        condition: (data) => data?.pricing?.model === 'FLAT_RATE',
        description: 'Flat price in EUR regardless of group size',
      },
    },
    {
      name: 'flatRateMaxGuests',
      type: 'number',
      admin: {
        condition: (data) => data?.pricing?.model === 'FLAT_RATE',
        description: 'Max group size for flat rate. Larger → Contact us',
      },
    },
    {
      name: 'onRequestNote',
      type: 'text',
      localized: true,
      admin: {
        description: 'Custom note shown when price is on request (e.g. "Contact us to discuss your tour")',
      },
    },
    {
      name: 'guestCategories',
      type: 'array',
      admin: {
        description: 'Optional guest age categories (children, seniors, etc.)',
      },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'ageMin', type: 'number' },
        { name: 'ageMax', type: 'number', admin: { description: 'Empty = no upper limit' } },
        { name: 'priceModifier', type: 'number', admin: { description: 'Price adjustment in EUR (e.g. -5 for discount, +5 for surcharge)' } },
        { name: 'isFree', type: 'checkbox', defaultValue: false },
        { name: 'onRequest', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'additionalServices',
      type: 'array',
      admin: {
        description: 'Optional add-on services available for this tour',
      },
      fields: [
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          required: true,
        },
        {
          name: 'overridePricing',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Override global service pricing for this tour' },
        },
        {
          name: 'customPricingNote',
          type: 'text',
          localized: true,
          admin: {
            condition: (_, siblingData) => siblingData?.overridePricing,
            description: 'Custom pricing note for this tour',
          },
        },
      ],
    },
  ],
},
```

Also keep `groupPrice` temporarily as a **deprecated hidden field** to avoid breaking the DB during migration:

```typescript
{
  name: 'groupPrice',
  type: 'number',
  admin: {
    hidden: true,
    description: 'DEPRECATED — migrated to pricing.groupTiers. Remove after migration.',
  },
},
{
  name: 'groupSurchargePercent',
  type: 'number',
  admin: {
    hidden: true,
    description: 'DEPRECATED — migrated to pricing.groupTiers. Remove after migration.',
  },
},
```

Update `defaultColumns` to replace `groupPrice` with `pricing`:
```typescript
defaultColumns: ['title', 'category', 'subcategory', 'status'],
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add src/collections/Tours.ts
git commit -m "feat: add flexible pricing group to Tours collection"
```

---

## Task 4: Build PriceDisplay component

A shared component used on tour cards, detail pages, and booking forms.

**Files:**
- Create: `src/components/tours/PriceDisplay.tsx`

**Step 1: Create PriceDisplay.tsx**

```typescript
import { formatPrice, type Currency } from '@/lib/currency'
import { getDisplayPrice } from '@/lib/pricing'
import type { TourPricing } from '@/lib/cms-types'

interface PriceDisplayProps {
  pricing: TourPricing
  locale: string
  currency?: Currency
  variant?: 'card' | 'detail' | 'sticky'  // card=compact, detail=full, sticky=mobile bar
}

export function PriceDisplay({ pricing, locale, currency = 'EUR', variant = 'card' }: PriceDisplayProps) {
  const { fromPrice, isPerPerson, isOnRequest } = getDisplayPrice(pricing)

  if (isOnRequest) {
    return (
      <div>
        <span className={variant === 'card' ? 'text-lg font-bold text-gold' : 'text-2xl font-bold text-gold'}>
          {locale === 'ru' ? 'По запросу' : 'On Request'}
        </span>
        {pricing.onRequestNote && (
          <p className="text-xs text-gray mt-1">{pricing.onRequestNote}</p>
        )}
      </div>
    )
  }

  if (fromPrice === null) return null

  const priceLabel = isPerPerson
    ? (locale === 'ru' ? 'за человека' : 'per person')
    : (locale === 'ru' ? 'за группу' : 'per group')

  if (variant === 'card') {
    return (
      <div>
        <span className="text-lg font-bold text-gold">
          {pricing.model === 'GROUP_TIERS' && (locale === 'ru' ? 'от ' : 'from ')}
          {formatPrice(fromPrice, currency)}
        </span>
        <span className="text-xs text-gray ml-1">{priceLabel}</span>
      </div>
    )
  }

  // detail + sticky variants show all tiers
  if (pricing.model === 'GROUP_TIERS' && pricing.groupTiers?.length) {
    return (
      <div className="space-y-1">
        {pricing.groupTiers.map((tier, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-navy/70">
              {tier.maxGuests
                ? `${tier.minGuests}–${tier.maxGuests} ${locale === 'ru' ? 'гостей' : 'guests'}`
                : `${tier.minGuests}+ ${locale === 'ru' ? 'гостей' : 'guests'}`}
            </span>
            <span className="font-medium text-navy">
              {tier.onRequest || tier.price == null
                ? (locale === 'ru' ? 'По запросу' : 'Contact us')
                : formatPrice(tier.price, currency)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <span className={variant === 'sticky' ? 'text-xl font-bold text-gold' : 'text-2xl font-bold text-gold'}>
        {formatPrice(fromPrice, currency)}
      </span>
      <p className="text-xs text-gray mt-1">{priceLabel}</p>
    </div>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/tours/PriceDisplay.tsx
git commit -m "feat: add PriceDisplay component for multi-model pricing"
```

---

## Task 5: Update BookingRequestForm for new pricing

**Files:**
- Modify: `src/components/booking/BookingRequestForm.tsx`
- Modify: `src/components/booking/StickyBookButton.tsx`
- Modify: `src/components/booking/BookingModal.tsx` (if needed)

**Step 1: Update BookingRequestForm props and logic**

Replace the `price` + `surchargePercent` props with `pricing: TourPricing`. Use `calculatePrice()` and `getMaxGuests()` from the pricing engine.

Key changes:
- Props: `pricing: TourPricing` replaces `price: number` + `surchargePercent?: number`
- Add optional `services?: ServiceData[]` prop for tours with additional services
- Guest selector: max from `getMaxGuests(pricing, tour.maxGroupSize)`
- Price display: use `calculatePrice(pricing, guests, selectedServices, guestBreakdowns)` instead of hardcoded surcharge math
- ON_REQUEST handling: when `isOnRequest`, show contact CTA instead of submit button
- Price breakdown: show tier match info below price

**Step 1b: Add GuestBreakdownSelector for per-person services**

When a service has `requireGuestBreakdown: true` and `guestCategoryPricing` defined, render a breakdown UI below the guest count selector:

```typescript
// New state in BookingRequestForm:
const [guestBreakdowns, setGuestBreakdowns] = useState<Record<number, GuestBreakdown>>({})

// For each attached service that requires breakdown:
// Show category rows with +/- stepper controls, e.g.:
//
//   Entry Ticket (6 guests total)
//   ┌──────────────────────────────┐
//   │ Junior (0–5 years)    Free  [0] [-][+] │
//   │ Junior (6–17 years)   €5    [2] [-][+] │
//   │ Adult (18–59 years)   €10   [4] [-][+] │
//   │ Senior (60–79 years)  €6    [0] [-][+] │
//   │ Senior (80+ years)    Free  [0] [-][+] │
//   ├──────────────────────────────┤
//   │ Total: 6 of 6 ✓            Subtotal: €50 │
//   └──────────────────────────────┘
//
// Validation: show error if sum ≠ guests, disable submit until valid.
// Use `validateGuestBreakdown()` from pricing.ts.
```

The breakdown selector should:
- Auto-initialize all counts to 0 (user fills them in)
- Show remaining count: `"4 of 6 assigned"` or `"✓ 6 of 6"` when complete
- Show per-category price × count subtotal
- Show "Free" label for `isFree` categories
- Show "On request" for `onRequest` categories
- Reset breakdown when guest count changes (since allocations become invalid)
- Be inline in the booking form (not a modal), appearing after the guest selector when relevant services are attached

Extract as a reusable component: `src/components/booking/GuestBreakdownSelector.tsx`

```typescript
interface GuestBreakdownSelectorProps {
  service: ServiceData
  guestCount: number
  breakdown: GuestBreakdown
  onChange: (breakdown: GuestBreakdown) => void
  locale: string
  currency: Currency
}
```

**Step 2: Update StickyBookButton**

Replace `price` + `surchargePercent` props with `pricing: TourPricing`. Use `PriceDisplay` for the price in the sticky bar.

**Step 3: Update BookingModal if it passes pricing props through**

Check `BookingModal.tsx` and update its interface to forward `pricing` instead of `price`/`surchargePercent`.

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/booking/BookingRequestForm.tsx src/components/booking/StickyBookButton.tsx src/components/booking/BookingModal.tsx
git commit -m "feat: update booking form for multi-model pricing"
```

---

## Task 6: Update TourCard for new pricing

**Files:**
- Modify: `src/components/tours/TourCard.tsx`

**Step 1: Update TourCard props**

Replace `groupPrice: number` with `pricing: TourPricing`. Use `PriceDisplay` component with `variant="card"`.

```typescript
// Old:
<span className="text-lg font-bold text-gold">€{groupPrice}</span>
<span className="text-xs text-gray ml-1">{locale === 'ru' ? 'за группу' : 'per group'}</span>

// New:
<PriceDisplay pricing={pricing} locale={locale} variant="card" />
```

**Step 2: Update all TourCard consumers**

Update `src/app/(frontend)/[locale]/tours/page.tsx` and `src/app/(frontend)/[locale]/tours/[slug]/page.tsx` (related tours section) to pass `pricing` instead of `groupPrice`.

**Step 3: Verify TypeScript compiles and test**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/tours/TourCard.tsx src/app/
git commit -m "feat: update TourCard to use PriceDisplay component"
```

---

## Task 7: Update tour detail page

**Files:**
- Modify: `src/app/(frontend)/[locale]/tours/[slug]/page.tsx`

**Step 1: Pass pricing object to BookingRequestForm and StickyBookButton**

Replace:
```typescript
<BookingRequestForm
  tourId={tour.id as number}
  tourName={tour.title}
  price={tour.groupPrice}
  surchargePercent={tour.groupSurchargePercent ?? undefined}
  locale={locale}
/>
```

With:
```typescript
const pricing = (tour as any).pricing || {
  model: 'GROUP_TIERS' as const,
  groupTiers: [
    { minGuests: 1, maxGuests: 4, price: (tour as any).groupPrice || 0 },
    ...(tour as any).groupSurchargePercent ? [{
      minGuests: 5,
      maxGuests: (tour as any).maxGroupSize || 8,
      price: Math.round(((tour as any).groupPrice || 0) * (1 + ((tour as any).groupSurchargePercent || 30) / 100)),
    }] : [],
  ],
}

<BookingRequestForm
  tourId={tour.id as number}
  tourName={tour.title}
  pricing={pricing}
  locale={locale}
/>
```

This backward-compat wrapper ensures old tours without `pricing` still work.

Same for `StickyBookButton` and `TourSchema`.

**Step 2: Update related tour cards mapping**

Replace `groupPrice: t.groupPrice` with `pricing: t.pricing || { model: 'GROUP_TIERS', ... }` backward-compat fallback.

**Step 3: Verify and commit**

```bash
git add src/app/(frontend)/[locale]/tours/
git commit -m "feat: wire pricing object through tour detail page"
```

---

## Task 8: Update TourSchema for flexible pricing

**Files:**
- Modify: `src/components/seo/TourSchema.tsx`

**Step 1: Accept pricing object**

Update props to accept `pricing: TourPricing` instead of `price: number`. Use `getDisplayPrice()` to get the lowest price for Schema.org `offers.price`. If ON_REQUEST, omit price or use `priceRange`.

**Step 2: Commit**

```bash
git add src/components/seo/TourSchema.tsx
git commit -m "feat: update TourSchema for flexible pricing models"
```

---

## Task 9: Update booking API + validation

**Files:**
- Modify: `src/lib/booking.ts`
- Modify: `src/app/api/booking/request/route.ts`
- Modify: `src/collections/BookingRequests.ts`

**Step 1: Update booking schema**

In `src/lib/booking.ts`:
- Remove hardcoded `guests: z.number().min(1).max(8)` — keep `min(1)` but remove `max(8)` (max is validated against tour's pricing config on the server)
- Add optional `pricingModel` field
- Add optional `pricingBreakdown` object for audit trail
- Add optional `guestBreakdowns` field — `Record<number, Record<string, number>>` keyed by service ID → category label → count

```typescript
// New fields in bookingRequestSchema:
pricingModel: z.enum(['GROUP_TIERS', 'PER_PERSON', 'FLAT_RATE', 'ON_REQUEST']).optional(),
guestBreakdowns: z.record(
  z.string(),  // service ID as string
  z.record(z.string(), z.number().min(0))  // category label → count
).optional(),
```

**Step 2: Add server-side price verification with guest breakdown validation**

In the booking API route, after parsing the request, fetch the tour's pricing config and recalculate using `calculatePrice()`:

```typescript
// After: const data = bookingRequestSchema.parse(body)
const tour = await payload.findByID({ collection: 'tours', id: data.tourId })
const pricing = (tour as any).pricing
if (pricing) {
  // Resolve services from pricing.additionalServices
  const services: ServiceData[] = (pricing.additionalServices || [])
    .map((a: any) => typeof a.service === 'object' ? a.service : null)
    .filter(Boolean)

  // Convert string-keyed breakdowns to number-keyed
  const breakdowns = data.guestBreakdowns
    ? Object.fromEntries(
        Object.entries(data.guestBreakdowns).map(([k, v]) => [Number(k), v])
      )
    : undefined

  // Validate guest breakdowns for services that require them
  for (const service of services) {
    if (service.requireGuestBreakdown) {
      const bd = breakdowns?.[service.id]
      const validation = validateGuestBreakdown(service, data.guests, bd)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error, field: `guestBreakdown_${service.id}` },
          { status: 400 },
        )
      }
    }
  }

  const calculated = calculatePrice(pricing, data.guests, services, breakdowns)
  // Log discrepancy but don't block (client may have stale cache)
  if (data.totalPrice && calculated.total && Math.abs(data.totalPrice - calculated.total) > 1) {
    console.warn('[Booking] Price mismatch:', { client: data.totalPrice, server: calculated.total })
  }
}
```

**Step 3: Add pricingBreakdown and guestBreakdowns to BookingRequests**

Add fields to store the calculation details and guest allocation:

```typescript
{
  name: 'pricingBreakdown',
  type: 'json',
  admin: {
    readOnly: true,
    description: 'Auto-calculated pricing breakdown at time of booking',
  },
},
{
  name: 'guestBreakdowns',
  type: 'json',
  admin: {
    readOnly: true,
    description: 'Guest category allocation per service (e.g. 2 juniors + 4 adults for entry tickets)',
  },
},
```

**Step 4: Handle ON_REQUEST bookings**

When `isOnRequest` is true, the booking form should submit without a `totalPrice`. The API should accept this and set the booking status to `new` with a note that pricing is on request.

**Step 5: Commit**

```bash
git add src/lib/booking.ts src/app/api/booking/request/route.ts src/collections/BookingRequests.ts
git commit -m "feat: server-side price verification with guest breakdown validation"
```

---

## Task 10: Update notification formatting

**Files:**
- Modify: `src/lib/whatsapp.ts`
- Modify: `src/lib/telegram.ts`
- Modify: `src/lib/slack.ts`

**Step 1: Add pricing model info and guest breakdown to notifications**

When `pricingModel` is in the notification data, include it. When ON_REQUEST, show "Price: On Request" instead of amount.

Changes to formatter interfaces:
- Add `pricingModel?: string` — conditionally show "On Request" when `totalPrice` is 0/missing and model is ON_REQUEST
- Add `guestBreakdowns?: Record<string, Record<string, number>>` — when present, include in admin notifications

Example Telegram output with guest breakdown:
```
💰 Price: €400 (flat rate)
🎫 Entry Ticket: Adult ×4 (€10), Junior ×2 (€5) = €50
👥 Guest breakdown: 4 Adult, 2 Junior (6 total)
```

**Step 2: Commit**

```bash
git add src/lib/whatsapp.ts src/lib/telegram.ts src/lib/slack.ts
git commit -m "feat: update notifications for on-request pricing"
```

---

## Task 11: Data migration — convert existing tours

**Files:**
- Create: temporary endpoint or seed script

**Step 1: Create migration endpoint**

Create a temporary `GET /api/migrate-pricing` endpoint (protected by PAYLOAD_SECRET) that:

1. Fetches all tours
2. For each tour with `groupPrice` but no `pricing.model`:
   - Sets `pricing.model = 'GROUP_TIERS'`
   - Creates 2 tiers:
     - `{ minGuests: 1, maxGuests: 4, price: groupPrice }`
     - `{ minGuests: 5, maxGuests: maxGroupSize || 8, price: Math.round(groupPrice * (1 + (groupSurchargePercent || 30) / 100)) }`
   - Optionally adds a 3rd tier `{ minGuests: maxGroupSize + 1, onRequest: true }` if maxGroupSize < 20
3. Saves each tour via `payload.update()`

**Important gotcha:** This must handle localized fields correctly. The `pricing` group fields are NOT localized (prices are the same across locales), so a single update should work.

**Step 2: Deploy, run migration, verify in admin**

Run the endpoint on production. Verify a few tours in the admin panel show correct GROUP_TIERS pricing.

**Step 3: Remove migration endpoint**

Delete the endpoint code and deploy clean.

**Step 4: Commit**

```bash
git commit -m "chore: migrate existing tours from flat pricing to GROUP_TIERS"
```

---

## Task 12: Production database schema sync

Since we're adding new fields (pricing group, Services collection), the production database needs new columns.

**Step 1: Check if `pushDevSchema` works**

Payload 3.x with `push: true` in the postgres adapter should auto-push schema on startup. If it hangs (known issue with many columns), create a `fix-schema` endpoint with the necessary `ALTER TABLE` statements.

**Expected new tables/columns:**
- `services` table (new collection)
- `services_locales` table (localized name, description)
- `tours` columns: `pricing_model`, `pricing_per_person_price`, `pricing_per_person_max_guests`, `pricing_flat_rate_price`, `pricing_flat_rate_max_guests`, `pricing_on_request_note`
- `tours_pricing_group_tiers` junction table (array)
- `tours_pricing_guest_categories` junction table (array)
- `tours_pricing_additional_services` junction table (array)
- `booking_requests` column: `pricing_breakdown`

**Step 2: Verify admin panel loads all tours and Services collection**

**Step 3: Commit if schema fix endpoint was needed**

---

## Task 13: Update CLAUDE.md, CHANGELOG.md, VERSION

**Files:**
- Modify: `CLAUDE.md` — Update "Pricing" section
- Modify: `CHANGELOG.md` — Add v1.7.0 entry
- Modify: `VERSION` — Bump to `1.7.0`

**Step 1: Update CLAUDE.md**

Add/update sections about:
- Pricing system: 4 models (GROUP_TIERS, PER_PERSON, FLAT_RATE, ON_REQUEST)
- Services collection
- `src/lib/pricing.ts` — `calculatePrice()`, `getDisplayPrice()`, `getMaxGuests()`
- Price calculation is shared (client + server-side verification)
- Backward compatibility: tours without `pricing` group fall back to legacy `groupPrice`

**Step 2: Update CHANGELOG.md**

```markdown
## [1.7.0] - 2026-03-07

### Added
- Flexible tour pricing system with 4 models: GROUP_TIERS, PER_PERSON, FLAT_RATE, ON_REQUEST
- Services collection for reusable tour add-ons (entry tickets, vehicles, etc.)
- `PriceDisplay` component for consistent pricing display across cards, detail pages, and booking
- Pricing engine (`src/lib/pricing.ts`) with `calculatePrice()`, `getDisplayPrice()`, `getMaxGuests()`
- Server-side price verification in booking API
- `pricingBreakdown` audit trail field on BookingRequests
- "On Request" / "Contact us" pricing support throughout booking flow

### Changed
- Tours collection: `groupPrice` + `groupSurchargePercent` replaced by `pricing` group
- TourCard, BookingRequestForm, StickyBookButton use new pricing engine
- TourSchema.tsx uses lowest available price for Schema.org
- Guest selector max is now dynamic per tour's pricing configuration
- Notification formatters handle on-request pricing

### Migration
- Existing tours auto-migrated from flat pricing to GROUP_TIERS with 2 tiers
```

**Step 3: Commit**

```bash
git add CLAUDE.md CHANGELOG.md VERSION
git commit -m "docs: update documentation for v1.7.0 pricing system"
```

---

## Task 14: Remove deprecated fields (after migration verified)

**Files:**
- Modify: `src/collections/Tours.ts`

Once migration is verified on production and all tours have `pricing` data:

1. Remove the hidden `groupPrice` and `groupSurchargePercent` fields from Tours.ts
2. Remove backward-compatibility fallbacks in tour detail page and TourCard
3. Clean up any `(tour as any).groupPrice` references

**Note:** The database columns will remain but be unused. Don't drop them — Payload ignores unknown columns.

**Commit:**
```bash
git commit -m "chore: remove deprecated groupPrice/groupSurchargePercent fields"
```

---

## Dependency Graph

```
Task 1 (pricing engine)
  ├── Task 4 (PriceDisplay) ──── Task 6 (TourCard)
  ├── Task 5 (BookingForm) ───── Task 7 (tour detail page)
  ├── Task 8 (TourSchema)
  └── Task 9 (booking API)
Task 2 (Services collection)
  └── Task 3 (Tours collection) ── Task 7 (tour detail page)
Task 10 (notifications) ── depends on Task 9
Task 11 (migration) ── depends on Tasks 3, 12
Task 12 (DB schema) ── depends on Tasks 2, 3
Task 13 (docs) ── depends on all above
Task 14 (cleanup) ── depends on Task 11 verified
```

**Suggested execution order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 12 → 11 → 13 → 14

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| DB schema push hangs in prod | Use `fix-schema` endpoint with `ALTER TABLE` (proven pattern) |
| Breaking existing tours | Keep `groupPrice` as hidden field; backward-compat fallback in detail page |
| Price mismatch client/server | Log mismatch but don't block booking; admin reviews anyway |
| Services collection empty | All service features are optional; tours work without any services |
| ON_REQUEST breaks booking flow | Booking form shows contact CTA instead of submit; no silent failures |

---

*Plan version: 1.0 · 2026-03-07 · bestpragueguide.com*
