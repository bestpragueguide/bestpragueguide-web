import { describe, it, expect } from 'vitest'
import {
  calculatePrice,
  getDisplayPrice,
  getMaxGuests,
  hasOpenEndedTier,
  validateGuestBreakdown,
  calculateServicePrice,
} from '../pricing'
import type { TourPricing, ServiceData } from '../cms-types'

describe('calculatePrice', () => {
  describe('GROUP_TIERS model', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [
        { minGuests: 1, maxGuests: 3, price: 139 },
        { minGuests: 4, maxGuests: 7, price: 179 },
        { minGuests: 8, maxGuests: null, onRequest: true },
      ],
    }

    it('returns correct price for first tier', () => {
      const result = calculatePrice(pricing, 2)
      expect(result.basePrice).toBe(139)
      expect(result.total).toBe(139)
      expect(result.isOnRequest).toBe(false)
    })

    it('returns correct price for second tier', () => {
      const result = calculatePrice(pricing, 5)
      expect(result.basePrice).toBe(179)
      expect(result.total).toBe(179)
      expect(result.isOnRequest).toBe(false)
    })

    it('returns on-request for last open-ended tier', () => {
      const result = calculatePrice(pricing, 10)
      expect(result.isOnRequest).toBe(true)
      expect(result.basePrice).toBeNull()
      expect(result.total).toBeNull()
    })

    it('handles single guest', () => {
      const result = calculatePrice(pricing, 1)
      expect(result.basePrice).toBe(139)
      expect(result.total).toBe(139)
    })

    it('handles boundary guest count at tier edge', () => {
      const result3 = calculatePrice(pricing, 3)
      expect(result3.basePrice).toBe(139)

      const result4 = calculatePrice(pricing, 4)
      expect(result4.basePrice).toBe(179)
    })

    it('populates breakdown with model and guestCount', () => {
      const result = calculatePrice(pricing, 2)
      expect(result.breakdown.model).toBe('GROUP_TIERS')
      expect(result.breakdown.guestCount).toBe(2)
      expect(result.breakdown.baseAmount).toBe(139)
    })
  })

  describe('PER_PERSON model', () => {
    const pricing: TourPricing = {
      model: 'PER_PERSON',
      perPersonPrice: 50,
      perPersonMaxGuests: 10,
    }

    it('multiplies price by guest count', () => {
      const result = calculatePrice(pricing, 3)
      expect(result.basePrice).toBe(150)
      expect(result.total).toBe(150)
      expect(result.isOnRequest).toBe(false)
    })

    it('returns on-request when over max guests', () => {
      const result = calculatePrice(pricing, 12)
      expect(result.isOnRequest).toBe(true)
      expect(result.basePrice).toBeNull()
    })

    it('handles exact max guests count', () => {
      const result = calculatePrice(pricing, 10)
      expect(result.basePrice).toBe(500)
      expect(result.isOnRequest).toBe(false)
    })
  })

  describe('FLAT_RATE model', () => {
    const pricing: TourPricing = {
      model: 'FLAT_RATE',
      flatRatePrice: 200,
      flatRateMaxGuests: 8,
    }

    it('returns flat price regardless of guest count', () => {
      const result = calculatePrice(pricing, 1)
      expect(result.basePrice).toBe(200)
      expect(result.total).toBe(200)

      const result5 = calculatePrice(pricing, 5)
      expect(result5.basePrice).toBe(200)
      expect(result5.total).toBe(200)
    })

    it('returns on-request when over max guests', () => {
      const result = calculatePrice(pricing, 10)
      expect(result.isOnRequest).toBe(true)
      expect(result.basePrice).toBeNull()
    })

    it('handles exact max guests count', () => {
      const result = calculatePrice(pricing, 8)
      expect(result.basePrice).toBe(200)
      expect(result.isOnRequest).toBe(false)
    })
  })

  describe('ON_REQUEST model', () => {
    const pricing: TourPricing = { model: 'ON_REQUEST' }

    it('always returns on-request', () => {
      const result = calculatePrice(pricing, 3)
      expect(result.isOnRequest).toBe(true)
      expect(result.total).toBeNull()
      expect(result.basePrice).toBeNull()
    })

    it('uses onRequestNote as label when provided', () => {
      const pricingWithNote: TourPricing = {
        model: 'ON_REQUEST',
        onRequestNote: 'Call for pricing',
      }
      const result = calculatePrice(pricingWithNote, 1)
      expect(result.breakdown.basePriceLabel).toBe('Call for pricing')
    })
  })

  describe('with additional services', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [{ minGuests: 1, maxGuests: 4, price: 100 }],
    }

    const flatService: ServiceData = {
      id: 1,
      name: 'Museum Entry',
      type: 'ENTRY_TICKET',
      pricingModel: 'FLAT',
      flatPrice: 30,
    }

    it('adds flat service price to total', () => {
      const result = calculatePrice(pricing, 2, [flatService])
      expect(result.basePrice).toBe(100)
      expect(result.servicesTotal).toBe(30)
      expect(result.total).toBe(130)
    })

    it('includes service in breakdown', () => {
      const result = calculatePrice(pricing, 2, [flatService])
      expect(result.breakdown.services).toHaveLength(1)
      expect(result.breakdown.services[0].name).toBe('Museum Entry')
      expect(result.breakdown.services[0].amount).toBe(30)
      expect(result.breakdown.services[0].isOnRequest).toBe(false)
    })

    it('handles on-request service', () => {
      const onRequestService: ServiceData = {
        id: 2,
        name: 'Custom Experience',
        type: 'OTHER',
        pricingModel: 'ON_REQUEST',
      }
      const result = calculatePrice(pricing, 2, [onRequestService])
      expect(result.isOnRequest).toBe(true)
      // total still computed from basePrice when basePrice is not null
      expect(result.total).toBe(100)
    })

    it('handles multiple services', () => {
      const service2: ServiceData = {
        id: 2,
        name: 'Transfer',
        type: 'VEHICLE',
        pricingModel: 'FLAT',
        flatPrice: 50,
      }
      const result = calculatePrice(pricing, 2, [flatService, service2])
      expect(result.servicesTotal).toBe(80)
      expect(result.total).toBe(180)
    })
  })

  describe('locale support', () => {
    it('uses English labels by default', () => {
      const pricing: TourPricing = {
        model: 'PER_PERSON',
        perPersonPrice: 50,
        perPersonMaxGuests: 5,
      }
      const result = calculatePrice(pricing, 8, undefined, undefined, 'en')
      expect(result.breakdown.basePriceLabel).toContain('over')
    })

    it('uses Russian labels when locale is ru', () => {
      const pricing: TourPricing = {
        model: 'PER_PERSON',
        perPersonPrice: 50,
        perPersonMaxGuests: 5,
      }
      const result = calculatePrice(pricing, 8, undefined, undefined, 'ru')
      expect(result.breakdown.basePriceLabel).toContain('макс.')
    })
  })
})

describe('getDisplayPrice', () => {
  it('returns lowest price from group tiers', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [
        { minGuests: 1, maxGuests: 3, price: 139 },
        { minGuests: 4, maxGuests: 7, price: 179 },
      ],
    }
    const result = getDisplayPrice(pricing)
    expect(result.fromPrice).toBe(139)
    expect(result.isPerPerson).toBe(false)
    expect(result.isOnRequest).toBe(false)
  })

  it('returns per-person price', () => {
    const pricing: TourPricing = { model: 'PER_PERSON', perPersonPrice: 45 }
    const result = getDisplayPrice(pricing)
    expect(result.fromPrice).toBe(45)
    expect(result.isPerPerson).toBe(true)
  })

  it('returns flat rate price', () => {
    const pricing: TourPricing = { model: 'FLAT_RATE', flatRatePrice: 200, flatRateMaxGuests: 8 }
    const result = getDisplayPrice(pricing)
    expect(result.fromPrice).toBe(200)
    expect(result.isPerPerson).toBe(false)
    expect(result.maxGroupSize).toBe(8)
  })

  it('returns on-request when no tiers have prices', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [{ minGuests: 1, maxGuests: null, onRequest: true }],
    }
    const result = getDisplayPrice(pricing)
    expect(result.isOnRequest).toBe(true)
    expect(result.fromPrice).toBeNull()
  })

  it('returns on-request for ON_REQUEST model', () => {
    const pricing: TourPricing = { model: 'ON_REQUEST' }
    const result = getDisplayPrice(pricing)
    expect(result.isOnRequest).toBe(true)
    expect(result.fromPrice).toBeNull()
  })

  it('returns maxGroupSize from last tier', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [
        { minGuests: 1, maxGuests: 3, price: 100 },
        { minGuests: 4, maxGuests: 10, price: 150 },
      ],
    }
    const result = getDisplayPrice(pricing)
    expect(result.maxGroupSize).toBe(10)
  })

  it('returns null maxGroupSize for open-ended last tier', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [
        { minGuests: 1, maxGuests: 3, price: 100 },
        { minGuests: 4, maxGuests: null, onRequest: true },
      ],
    }
    const result = getDisplayPrice(pricing)
    expect(result.maxGroupSize).toBeNull()
  })
})

describe('getMaxGuests', () => {
  it('returns maxGuests of last tier when set', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [
        { minGuests: 1, maxGuests: 3, price: 100 },
        { minGuests: 4, maxGuests: 8, price: 150 },
      ],
    }
    expect(getMaxGuests(pricing)).toBe(8)
  })

  it('returns minGuests of last tier when open-ended', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [
        { minGuests: 1, maxGuests: 3, price: 100 },
        { minGuests: 4, maxGuests: null },
      ],
    }
    expect(getMaxGuests(pricing)).toBe(4)
  })

  it('returns per-person max when set', () => {
    expect(getMaxGuests({ model: 'PER_PERSON', perPersonMaxGuests: 15 })).toBe(15)
  })

  it('returns 50 default for per-person without max', () => {
    expect(getMaxGuests({ model: 'PER_PERSON' })).toBe(50)
  })

  it('returns flat rate max when set', () => {
    expect(getMaxGuests({ model: 'FLAT_RATE', flatRateMaxGuests: 10 })).toBe(10)
  })

  it('returns 50 default for flat rate without max', () => {
    expect(getMaxGuests({ model: 'FLAT_RATE' })).toBe(50)
  })

  it('uses tourMaxGroupSize as fallback for ON_REQUEST', () => {
    expect(getMaxGuests({ model: 'ON_REQUEST' }, 20)).toBe(20)
  })

  it('uses tourMaxGroupSize as fallback for PER_PERSON without max', () => {
    expect(getMaxGuests({ model: 'PER_PERSON' }, 25)).toBe(25)
  })

  it('returns 50 for ON_REQUEST without tourMaxGroupSize', () => {
    expect(getMaxGuests({ model: 'ON_REQUEST' })).toBe(50)
  })

  it('returns tourMaxGroupSize for empty GROUP_TIERS', () => {
    expect(getMaxGuests({ model: 'GROUP_TIERS', groupTiers: [] }, 12)).toBe(12)
  })
})

describe('hasOpenEndedTier', () => {
  it('returns true when last tier has no maxGuests', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [{ minGuests: 1, maxGuests: null }],
    }
    expect(hasOpenEndedTier(pricing)).toBe(true)
  })

  it('returns false when last tier has maxGuests', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [{ minGuests: 1, maxGuests: 8, price: 100 }],
    }
    expect(hasOpenEndedTier(pricing)).toBe(false)
  })

  it('returns false for non-GROUP_TIERS models', () => {
    expect(hasOpenEndedTier({ model: 'PER_PERSON' })).toBe(false)
    expect(hasOpenEndedTier({ model: 'FLAT_RATE' })).toBe(false)
    expect(hasOpenEndedTier({ model: 'ON_REQUEST' })).toBe(false)
  })

  it('returns false when groupTiers is empty', () => {
    expect(hasOpenEndedTier({ model: 'GROUP_TIERS', groupTiers: [] })).toBe(false)
  })

  it('checks only the last tier', () => {
    const pricing: TourPricing = {
      model: 'GROUP_TIERS',
      groupTiers: [
        { minGuests: 1, maxGuests: 3, price: 100 },
        { minGuests: 4, maxGuests: 8, price: 150 },
      ],
    }
    expect(hasOpenEndedTier(pricing)).toBe(false)
  })
})

describe('validateGuestBreakdown', () => {
  const service: ServiceData = {
    id: 1,
    name: 'Zoo',
    type: 'ENTRY_TICKET',
    pricingModel: 'PER_PERSON',
    requireGuestBreakdown: true,
    guestCategoryPricing: [
      { label: 'Adult', price: 20 },
      { label: 'Child', price: 10, isFree: false },
    ],
  }

  it('validates correct breakdown', () => {
    const result = validateGuestBreakdown(service, 3, { Adult: 2, Child: 1 })
    expect(result.valid).toBe(true)
  })

  it('rejects mismatched breakdown', () => {
    const result = validateGuestBreakdown(service, 3, { Adult: 1, Child: 1 })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('3')
  })

  it('rejects missing breakdown when required', () => {
    const result = validateGuestBreakdown(service, 3)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('allows no breakdown when not required', () => {
    const noBreakdownService: ServiceData = { ...service, requireGuestBreakdown: false }
    const result = validateGuestBreakdown(noBreakdownService, 3)
    expect(result.valid).toBe(true)
  })

  it('allows no breakdown when no categories defined', () => {
    const noCategoriesService: ServiceData = {
      ...service,
      guestCategoryPricing: [],
    }
    const result = validateGuestBreakdown(noCategoriesService, 3)
    expect(result.valid).toBe(true)
  })
})

describe('calculateServicePrice', () => {
  it('calculates flat price', () => {
    const service: ServiceData = {
      id: 1, name: 'Transfer', type: 'VEHICLE',
      pricingModel: 'FLAT', flatPrice: 80,
    }
    const result = calculateServicePrice(service, 4)
    expect(result.amount).toBe(80)
    expect(result.isOnRequest).toBe(false)
    expect(result.breakdownValid).toBe(true)
  })

  it('returns on-request for ON_REQUEST model', () => {
    const service: ServiceData = {
      id: 2, name: 'Custom', type: 'OTHER',
      pricingModel: 'ON_REQUEST',
    }
    const result = calculateServicePrice(service, 2)
    expect(result.isOnRequest).toBe(true)
    expect(result.amount).toBeNull()
  })

  it('returns on-request when over threshold', () => {
    const service: ServiceData = {
      id: 3, name: 'Boat', type: 'BOAT_TICKET',
      pricingModel: 'FLAT', flatPrice: 50,
      onRequestThreshold: 5,
    }
    const result = calculateServicePrice(service, 6)
    expect(result.isOnRequest).toBe(true)
    expect(result.amount).toBeNull()
  })

  it('returns normal price when under threshold', () => {
    const service: ServiceData = {
      id: 3, name: 'Boat', type: 'BOAT_TICKET',
      pricingModel: 'FLAT', flatPrice: 50,
      onRequestThreshold: 5,
    }
    const result = calculateServicePrice(service, 4)
    expect(result.amount).toBe(50)
    expect(result.isOnRequest).toBe(false)
  })

  it('calculates per-person price with guest breakdown', () => {
    const service: ServiceData = {
      id: 4, name: 'Castle Entry', type: 'ENTRY_TICKET',
      pricingModel: 'PER_PERSON',
      requireGuestBreakdown: true,
      guestCategoryPricing: [
        { label: 'Adult', price: 20 },
        { label: 'Child', price: 10, isFree: false },
      ],
    }
    const result = calculateServicePrice(service, 3, { Adult: 2, Child: 1 })
    expect(result.amount).toBe(50) // 2*20 + 1*10
    expect(result.isOnRequest).toBe(false)
    expect(result.breakdownValid).toBe(true)
  })

  it('returns breakdownValid false when breakdown sum mismatches', () => {
    const service: ServiceData = {
      id: 4, name: 'Castle Entry', type: 'ENTRY_TICKET',
      pricingModel: 'PER_PERSON',
      requireGuestBreakdown: true,
      guestCategoryPricing: [
        { label: 'Adult', price: 20 },
        { label: 'Child', price: 10 },
      ],
    }
    const result = calculateServicePrice(service, 5, { Adult: 2, Child: 1 })
    expect(result.breakdownValid).toBe(false)
  })

  it('handles free guest categories', () => {
    const service: ServiceData = {
      id: 5, name: 'Museum', type: 'ENTRY_TICKET',
      pricingModel: 'PER_PERSON',
      requireGuestBreakdown: true,
      guestCategoryPricing: [
        { label: 'Adult', price: 15 },
        { label: 'Child (0-5)', price: 0, isFree: true },
      ],
    }
    const result = calculateServicePrice(service, 3, { Adult: 2, 'Child (0-5)': 1 })
    expect(result.amount).toBe(30) // 2*15, child is free
    expect(result.isOnRequest).toBe(false)
  })

  it('calculates group tier service price', () => {
    const service: ServiceData = {
      id: 6, name: 'Bus', type: 'VEHICLE',
      pricingModel: 'GROUP_TIERS',
      groupTierPricing: [
        { minGuests: 1, maxGuests: 4, price: 60 },
        { minGuests: 5, maxGuests: 8, price: 90 },
      ],
    }
    const result = calculateServicePrice(service, 3)
    expect(result.amount).toBe(60)
    expect(result.isOnRequest).toBe(false)

    const result2 = calculateServicePrice(service, 6)
    expect(result2.amount).toBe(90)
  })

  it('returns on-request for group tier when no matching tier', () => {
    const service: ServiceData = {
      id: 6, name: 'Bus', type: 'VEHICLE',
      pricingModel: 'GROUP_TIERS',
      groupTierPricing: [
        { minGuests: 1, maxGuests: 4, price: 60 },
      ],
    }
    const result = calculateServicePrice(service, 6)
    expect(result.isOnRequest).toBe(true)
  })

  it('uses default adult price when no breakdown provided and not required', () => {
    const service: ServiceData = {
      id: 7, name: 'Gallery', type: 'ENTRY_TICKET',
      pricingModel: 'PER_PERSON',
      requireGuestBreakdown: false,
      guestCategoryPricing: [
        { label: 'Adult', price: 25 },
        { label: 'Child', price: 10, isFree: true },
      ],
    }
    const result = calculateServicePrice(service, 4)
    // Should use adult price * guestCount as fallback
    expect(result.amount).toBe(100) // 4 * 25
    expect(result.isOnRequest).toBe(false)
  })
})
