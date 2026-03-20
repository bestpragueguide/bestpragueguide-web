'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
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
  trustBadges?: Array<{ text: string }>
  contactPhoneDisplay?: string
  bookingPricingDescription?: string
  formTitle?: string
  submitLabel?: string
  successTitle?: string
  successMessage?: string
  disclaimerText?: string
  consentText?: string
}

export function StickyBookButton({
  tourId,
  tourName,
  pricing,
  maxGroupSize,
  locale,
  preferredTimes,
  trustBadges,
  contactPhoneDisplay,
  bookingPricingDescription,
  formTitle,
  submitLabel,
  successTitle,
  successMessage,
  disclaimerText,
  consentText,
}: StickyBookButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const displayInfo = useMemo(() => getDisplayPrice(pricing), [pricing])
  const tTour = useTranslations('tour')
  const tCommon = useTranslations('common')
  const tBooking = useTranslations('booking')

  const priceLabel = displayInfo.isPerPerson ? tTour('perPerson') : tTour('perGroup')

  return (
    <>
      {/* Sticky bottom bar — mobile only */}
      <div className="fixed bottom-0 inset-x-0 z-[80] lg:hidden bg-white border-t border-gray-light/50 px-4 py-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            {displayInfo.isOnRequest ? (
              <span className="text-lg font-bold text-gold">
                {tBooking('onRequest')}
              </span>
            ) : displayInfo.fromPrice !== null ? (
              <>
                <span className="text-xl font-bold text-gold">
                  {pricing.model === 'GROUP_TIERS' && (tCommon('from') + ' ')}
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
            {tCommon('bookNow')}
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tourName={tourName}
        pricing={pricing}
        locale={locale}
        trustBadges={trustBadges}
        bookingPricingDescription={bookingPricingDescription}
        formTitle={formTitle}
      >
        <BookingRequestForm
          tourId={tourId}
          tourName={tourName}
          pricing={pricing}
          maxGroupSize={maxGroupSize}
          locale={locale}
          preferredTimes={preferredTimes}
          contactPhoneDisplay={contactPhoneDisplay}
          formTitle={formTitle}
          submitLabel={submitLabel}
          successTitle={successTitle}
          successMessage={successMessage}
          disclaimerText={disclaimerText}
          consentText={consentText}
        />
      </BookingModal>
    </>
  )
}
