'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatPrice, type Currency } from '@/lib/currency'

interface BookingPaymentButtonProps {
  offerToken: string
  amount: number
  currency: string
  label: string
  locale: string
}

export function BookingPaymentButton({
  offerToken,
  amount,
  currency,
  label,
  locale,
}: BookingPaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('bookingOffer')

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/booking/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError('No checkout URL returned')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3.5 bg-gold text-white rounded-lg font-medium text-lg hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('processing')}
          </span>
        ) : (
          `${label} ${formatPrice(amount, currency as Currency)}`
        )}
      </button>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
