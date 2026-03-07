import type {
  TourPricing, GroupTier, ServiceData, ServiceGroupTier,
  GuestBreakdown, PricingModel,
} from './cms-types'
import { guestsLabel } from './plurals'

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
  basePriceLabel: string
  baseAmount: number | null
  services: ServiceBreakdownItem[]
}

export interface ServiceBreakdownItem {
  name: string
  amount: number | null
  isOnRequest: boolean
}

export function calculatePrice(
  pricing: TourPricing,
  guestCount: number,
  selectedServices?: ServiceData[],
  guestBreakdowns?: Record<number, GuestBreakdown>,
  locale: string = 'en',
): PriceResult {
  let basePrice: number | null = null
  let isOnRequest = false
  let basePriceLabel = ''
  const gl = (n: number) => guestsLabel(n, locale)
  const isRu = locale === 'ru'

  switch (pricing.model) {
    case 'GROUP_TIERS': {
      const tier = findTier(pricing.groupTiers || [], guestCount)
      if (!tier || tier.onRequest || tier.price == null) {
        isOnRequest = true
        basePriceLabel = `${guestCount}+ ${gl(guestCount)}`
      } else {
        basePrice = tier.price
        basePriceLabel = tier.maxGuests
          ? `${tier.minGuests}–${tier.maxGuests} ${gl(tier.maxGuests)}`
          : `${tier.minGuests}+ ${gl(tier.minGuests)}`
      }
      break
    }

    case 'PER_PERSON': {
      if (pricing.perPersonMaxGuests && guestCount > pricing.perPersonMaxGuests) {
        isOnRequest = true
        basePriceLabel = isRu
          ? `${guestCount} ${gl(guestCount)} (макс. ${pricing.perPersonMaxGuests})`
          : `${guestCount} guests (over ${pricing.perPersonMaxGuests} max)`
      } else {
        basePrice = (pricing.perPersonPrice || 0) * guestCount
        basePriceLabel = `${guestCount} × ${pricing.perPersonPrice} ${isRu ? 'за чел.' : 'per person'}`
      }
      break
    }

    case 'FLAT_RATE': {
      if (pricing.flatRateMaxGuests && guestCount > pricing.flatRateMaxGuests) {
        isOnRequest = true
        basePriceLabel = isRu
          ? `${guestCount} ${gl(guestCount)} (макс. ${pricing.flatRateMaxGuests})`
          : `${guestCount} guests (over ${pricing.flatRateMaxGuests} max)`
      } else {
        basePrice = pricing.flatRatePrice || 0
        basePriceLabel = pricing.flatRateMaxGuests
          ? (isRu ? `фикс. цена (до ${pricing.flatRateMaxGuests})` : `flat rate (up to ${pricing.flatRateMaxGuests})`)
          : (isRu ? 'фикс. цена' : 'flat rate')
      }
      break
    }

    case 'ON_REQUEST': {
      isOnRequest = true
      basePriceLabel = pricing.onRequestNote || (isRu ? 'Свяжитесь с нами' : 'Contact us for pricing')
      break
    }
  }

  let servicesTotal = 0
  const serviceItems: ServiceBreakdownItem[] = []

  for (const service of selectedServices ?? []) {
    const bd = guestBreakdowns?.[service.id]
    const result = calculateServicePrice(service, guestCount, bd)
    serviceItems.push({
      name: service.name,
      amount: result.amount,
      isOnRequest: result.isOnRequest,
    })
    if (!result.breakdownValid) continue
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

      if (service.requireGuestBreakdown && guestBreakdown) {
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

      if (service.requireGuestBreakdown && !guestBreakdown) {
        return { amount: null, isOnRequest: false, breakdownValid: false }
      }

      const adultCategory = service.guestCategoryPricing.find(
        c => !c.isFree && !c.onRequest && c.price != null,
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

    case 'FLAT':
      return { amount: service.flatPrice ?? 0, isOnRequest: false, breakdownValid: true }

    case 'ON_REQUEST':
      return { amount: null, isOnRequest: true, breakdownValid: true }
  }
}

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
    t => guestCount >= t.minGuests && (t.maxGuests == null || guestCount <= t.maxGuests),
  )
}

function findServiceTier(tiers: ServiceGroupTier[], guestCount: number): ServiceGroupTier | undefined {
  return tiers.find(
    t => guestCount >= t.minGuests && (t.maxGuests == null || guestCount <= t.maxGuests),
  )
}

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
      return { fromPrice: lowest, isPerPerson: false, isOnRequest: false, maxGroupSize: maxTier?.maxGuests ?? null }
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

export function getMaxGuests(pricing: TourPricing, tourMaxGroupSize?: number): number {
  const DEFAULT_MAX = 20

  switch (pricing.model) {
    case 'GROUP_TIERS': {
      const allTiers = pricing.groupTiers || []
      if (allTiers.length === 0) return tourMaxGroupSize || DEFAULT_MAX
      const lastTier = allTiers[allTiers.length - 1]
      // Open-ended last tier: return its minGuests (dropdown will show "X+")
      if (lastTier.maxGuests == null) return lastTier.minGuests
      return lastTier.maxGuests
    }

    case 'PER_PERSON':
      return pricing.perPersonMaxGuests ?? tourMaxGroupSize ?? DEFAULT_MAX

    case 'FLAT_RATE':
      return pricing.flatRateMaxGuests ?? tourMaxGroupSize ?? DEFAULT_MAX

    case 'ON_REQUEST':
      return tourMaxGroupSize || DEFAULT_MAX
  }
}

export function hasOpenEndedTier(pricing: TourPricing): boolean {
  if (pricing.model !== 'GROUP_TIERS') return false
  const tiers = pricing.groupTiers || []
  if (tiers.length === 0) return false
  return tiers[tiers.length - 1].maxGuests == null
}
