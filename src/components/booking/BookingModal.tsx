'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { formatPrice, secondaryPrices } from '@/lib/currency'
import { getDisplayPrice } from '@/lib/pricing'
import { guestsLabel } from '@/lib/plurals'
import type { TourPricing } from '@/lib/cms-types'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  tourName: string
  pricing: TourPricing
  locale: string
  children?: React.ReactNode
  defaultDate?: string
  defaultTime?: string
  trustBadges?: Array<{ text: string }>
  bookingPricingDescription?: string
  formTitle?: string
}

export function BookingModal({
  isOpen,
  onClose,
  tourName,
  pricing,
  locale,
  children,
  defaultDate,
  defaultTime,
  trustBadges,
  bookingPricingDescription,
  formTitle,
}: BookingModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const delta = e.touches[0].clientY - touchStart
    if (delta > 0) setTouchDelta(delta) // only track downward swipes
  }
  const handleTouchEnd = () => {
    if (touchDelta > 100) onClose()
    setTouchStart(null)
    setTouchDelta(0)
  }

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleEscape])

  const displayInfo = useMemo(() => getDisplayPrice(pricing), [pricing])

  const priceLabel = displayInfo.isPerPerson
    ? (locale === 'ru' ? 'за человека' : 'per person')
    : (locale === 'ru' ? 'за группу' : 'per group')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal panel — slides up from bottom */}
      <div
        className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-2xl overflow-y-auto animate-slide-up"
        style={{ transform: touchDelta > 0 ? `translateY(${touchDelta}px)` : undefined }}
      >
        {/* Handle bar */}
        <div
          className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-gray-light/50 z-10"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-gray-light rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy truncate max-w-[250px]">
                {tourName}
              </p>
              {displayInfo.isOnRequest ? (
                <p className="text-lg font-bold text-gold">
                  {locale === 'ru' ? 'По запросу' : 'On Request'}
                </p>
              ) : displayInfo.fromPrice !== null ? (
                <>
                  <p className="text-lg font-bold text-gold">
                    {pricing.model === 'GROUP_TIERS' && (locale === 'ru' ? 'от ' : 'from ')}
                    {formatPrice(displayInfo.fromPrice, 'EUR')}
                    <span className="text-xs text-gray font-normal ml-1">
                      {priceLabel}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray/70">
                    {secondaryPrices(displayInfo.fromPrice)}
                  </p>
                </>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray hover:text-navy"
              aria-label={locale === 'ru' ? 'Закрыть' : 'Close'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-8">
          {/* Form title */}
          {formTitle && (
            <h3 className="text-base font-semibold text-navy text-center mb-4">{formTitle}</h3>
          )}

          {/* Pricing info */}
          {pricing.model === 'GROUP_TIERS' && pricing.groupTiers && pricing.groupTiers.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-light/50">
              <span className="block text-sm font-medium text-navy mb-1">
                {locale === 'ru' ? 'Стоимость' : 'Pricing'}
              </span>
              <div className="space-y-1">
                {pricing.groupTiers.map((tier, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-navy/70">
                      {tier.maxGuests
                        ? `${tier.minGuests}–${tier.maxGuests} ${guestsLabel(tier.maxGuests, locale)}`
                        : `${tier.minGuests}+ ${guestsLabel(tier.minGuests, locale)}`}
                    </span>
                    <span className="font-medium text-navy">
                      {tier.onRequest || tier.price == null
                        ? (locale === 'ru' ? 'По запросу' : 'Contact us')
                        : formatPrice(tier.price, 'EUR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pricing.model === 'PER_PERSON' && pricing.perPersonPrice != null && (
            <div className="mb-4 pb-4 border-b border-gray-light/50">
              <span className="block text-sm font-medium text-navy mb-1">
                {locale === 'ru' ? 'Стоимость' : 'Pricing'}
              </span>
              <div className="text-sm">
                <span className="text-2xl font-bold text-gold">{formatPrice(pricing.perPersonPrice, 'EUR')}</span>
                <span className="text-xs text-gray ml-1">{locale === 'ru' ? 'за человека' : 'per person'}</span>
              </div>
            </div>
          )}
          {pricing.model === 'FLAT_RATE' && pricing.flatRatePrice != null && (
            <div className="mb-4 pb-4 border-b border-gray-light/50">
              <span className="block text-sm font-medium text-navy mb-1">
                {locale === 'ru' ? 'Стоимость' : 'Pricing'}
              </span>
              <div className="text-sm">
                <span className="text-2xl font-bold text-gold">{formatPrice(pricing.flatRatePrice, 'EUR')}</span>
                <span className="text-xs text-gray ml-1">{locale === 'ru' ? 'за группу' : 'per group'}</span>
              </div>
            </div>
          )}
          {pricing.model === 'ON_REQUEST' && (
            <div className="mb-4 pb-4 border-b border-gray-light/50">
              <span className="block text-sm font-medium text-navy mb-1">
                {locale === 'ru' ? 'Стоимость' : 'Pricing'}
              </span>
              <span className="text-2xl font-bold text-gold">
                {locale === 'ru' ? 'По запросу' : 'On Request'}
              </span>
              {pricing.onRequestNote && (
                <p className="text-xs text-gray mt-1">{pricing.onRequestNote}</p>
              )}
            </div>
          )}

          {/* Pricing description (only for group tiers) */}
          {pricing.model === 'GROUP_TIERS' && bookingPricingDescription && (
            <div className="mb-4 pb-4 border-b border-gray-light/50">
              <p className="text-sm text-navy/70 leading-relaxed">
                {bookingPricingDescription}
              </p>
            </div>
          )}

          {/* Additional services */}
          {pricing.additionalServices && pricing.additionalServices.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-light/50">
              <span className="block text-sm font-medium text-navy mb-1">
                {locale === 'ru' ? 'Дополнительные услуги' : 'Additional Services'}
              </span>
              <div className="space-y-2">
                {pricing.additionalServices.map((attachment, i) => {
                  const service = typeof attachment.service === 'object' ? attachment.service : null
                  if (!service) return null
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-navy/70">{service.name}</span>
                      <span className="font-medium text-navy">
                        {attachment.customPricingNote
                          ? attachment.customPricingNote
                          : service.pricingModel === 'ON_REQUEST'
                            ? (locale === 'ru' ? 'По запросу' : 'On request')
                            : service.pricingModel === 'FLAT' && service.flatPrice != null
                              ? `€${service.flatPrice}`
                              : (locale === 'ru' ? 'По запросу' : 'On request')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {children || (
            <div className="text-center py-12 text-sm text-gray border-2 border-dashed border-gray-light rounded-lg">
              {locale === 'ru'
                ? 'Форма бронирования'
                : 'Booking form placeholder'}
            </div>
          )}

          {/* Trust badges */}
          {trustBadges && trustBadges.length > 0 && (
            <div className="mt-6 space-y-2">
              {trustBadges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-trust font-bold">✓</span>
                  <span className="text-navy/70">{badge.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
