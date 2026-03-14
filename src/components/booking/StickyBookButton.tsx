'use client'

import { useState, useMemo } from 'react'
import { BookingModal } from './BookingModal'
import { BookingRequestForm } from './BookingRequestForm'
import { trackCtaClick } from '@/lib/analytics'
import { formatPrice, secondaryPrices } from '@/lib/currency'
import { getDisplayPrice } from '@/lib/pricing'
import type { TourPricing } from '@/lib/cms-types'

interface StickyBookButtonProps {
  tourId: number
  tourName: string
  pricing: TourPricing
  maxGroupSize?: number
  locale: string
  preferredTimes?: string[]
}

export function StickyBookButton({
  tourId,
  tourName,
  pricing,
  maxGroupSize,
  locale,
  preferredTimes,
}: StickyBookButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const displayInfo = useMemo(() => getDisplayPrice(pricing), [pricing])

  const priceLabel = displayInfo.isPerPerson
    ? (locale === 'ru' ? 'за человека' : 'per person')
    : (locale === 'ru' ? 'за группу' : 'per group')

  return (
    <>
      {/* Sticky bottom bar — mobile only */}
      <div className="fixed bottom-0 inset-x-0 z-[80] lg:hidden bg-white border-t border-gray-light/50 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            {displayInfo.isOnRequest ? (
              <span className="text-lg font-bold text-gold">
                {locale === 'ru' ? 'По запросу' : 'On Request'}
              </span>
            ) : displayInfo.fromPrice !== null ? (
              <>
                <span className="text-xl font-bold text-gold">
                  {pricing.model === 'GROUP_TIERS' && (locale === 'ru' ? 'от ' : 'from ')}
                  {formatPrice(displayInfo.fromPrice, 'EUR')}
                </span>
                <p className="text-[10px] text-gray/70 leading-tight">
                  {secondaryPrices(displayInfo.fromPrice)}
                </p>
                <p className="text-xs text-gray">
                  {priceLabel}
                </p>
              </>
            ) : null}
          </div>
          <button
            onClick={() => {
              trackCtaClick(tourName, 'sticky_button')
              setIsModalOpen(true)
            }}
            className="px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors text-sm min-h-[44px]"
          >
            {locale === 'ru' ? 'Забронировать' : 'Book Now'}
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tourName={tourName}
        pricing={pricing}
        locale={locale}
      >
        <BookingRequestForm
          tourId={tourId}
          tourName={tourName}
          pricing={pricing}
          maxGroupSize={maxGroupSize}
          locale={locale}
          preferredTimes={preferredTimes}
        />
      </BookingModal>
    </>
  )
}
