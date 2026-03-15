'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { formatPrice, secondaryPrices } from '@/lib/currency'
import { getDisplayPrice } from '@/lib/pricing'
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
}: BookingModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.body.style.overflow = ''
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
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-2xl overflow-y-auto animate-slide-up">
        {/* Handle bar */}
        <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-gray-light/50 z-10">
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
              className="p-2 text-gray hover:text-navy"
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
