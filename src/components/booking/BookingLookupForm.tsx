'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface BookingLookupFormProps {
  locale: string
}

export function BookingLookupForm({ locale }: BookingLookupFormProps) {
  const t = useTranslations('bookingOffer')
  const router = useRouter()
  const [ref, setRef] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/booking/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: ref.trim(), email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.redirectUrl) {
        setError(t('lookupError'))
        setLoading(false)
        return
      }

      router.push(`/${locale}${data.redirectUrl}`)
    } catch {
      setError(t('lookupError'))
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-light/50 shadow-sm p-8">
      <h1 className="text-2xl font-heading font-bold text-navy text-center mb-6">
        {t('lookupHeading')}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="booking-ref"
            className="block text-sm font-medium text-navy mb-1"
          >
            {t('lookupRef')}
          </label>
          <input
            id="booking-ref"
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="BPG-2026-00001"
            required
            className="w-full px-4 py-2.5 border border-gray-light rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
          />
        </div>
        <div>
          <label
            htmlFor="booking-email"
            className="block text-sm font-medium text-navy mb-1"
          >
            {t('lookupEmail')}
          </label>
          <input
            id="booking-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-light rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gold text-white rounded-lg font-medium hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('lookupSearching')}
            </span>
          ) : (
            t('lookupSubmit')
          )}
        </button>
      </form>
    </div>
  )
}
