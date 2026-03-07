import { formatPrice, type Currency } from '@/lib/currency'
import { getDisplayPrice } from '@/lib/pricing'
import type { TourPricing } from '@/lib/cms-types'

interface PriceDisplayProps {
  pricing: TourPricing
  locale: string
  currency?: Currency
  variant?: 'card' | 'detail' | 'sticky'
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
