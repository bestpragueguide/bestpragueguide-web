'use client'

import { useState } from 'react'
import { BookingModal } from './BookingModal'
import { BookingRequestForm } from './BookingRequestForm'
import { trackCtaClick } from '@/lib/analytics'

interface StickyBookButtonProps {
  tourId: number
  tourName: string
  price: number
  surchargePercent?: number
  locale: string
}

export function StickyBookButton({
  tourId,
  tourName,
  price,
  surchargePercent,
  locale,
}: StickyBookButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Sticky bottom bar — mobile only */}
      <div className="fixed bottom-0 inset-x-0 z-[80] lg:hidden bg-white border-t border-gray-light/50 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xl font-bold text-gold">
              €{price}
            </span>
            <p className="text-xs text-gray">
              {locale === 'ru'
                ? 'за группу до 4'
                : 'per group up to 4'}
            </p>
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
        price={price}
        surchargePercent={surchargePercent}
        locale={locale}
      >
        <BookingRequestForm
          tourId={tourId}
          tourName={tourName}
          price={price}
          surchargePercent={surchargePercent}
          locale={locale}
        />
      </BookingModal>
    </>
  )
}
