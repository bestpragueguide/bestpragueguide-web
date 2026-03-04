'use client'

import { useEffect, useCallback } from 'react'
import { secondaryPrices } from '@/lib/currency'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  tourName: string
  price: number
  surchargePercent?: number
  locale: string
  children?: React.ReactNode
}

export function BookingModal({
  isOpen,
  onClose,
  tourName,
  price,
  surchargePercent,
  locale,
  children,
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
              <p className="text-lg font-bold text-gold">
                €{price}
                <span className="text-xs text-gray font-normal ml-1">
                  {locale === 'ru'
                    ? 'за группу до 4'
                    : 'per group up to 4'}
                </span>
              </p>
              <p className="text-[10px] text-gray/70">
                {secondaryPrices(price)}
              </p>
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
          {surchargePercent && surchargePercent > 0 && (
            <p className="text-xs text-gray mb-4">
              {locale === 'ru'
                ? `Группы 5–8: +${surchargePercent}%`
                : `Groups 5–8: +${surchargePercent}%`}
            </p>
          )}

          {children || (
            <div className="text-center py-12 text-sm text-gray border-2 border-dashed border-gray-light rounded-lg">
              {locale === 'ru'
                ? 'Форма бронирования'
                : 'Booking form placeholder'}
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-6 space-y-2">
            {[
              locale === 'ru'
                ? 'Оплата только после подтверждения'
                : 'No payment until we confirm',
              locale === 'ru'
                ? 'Бесплатная отмена за 24 часа'
                : 'Free cancellation 24h before',
              locale === 'ru'
                ? '100% приватно — только ваша группа'
                : '100% private — just your group',
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-trust font-bold">✓</span>
                <span className="text-navy/70">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
