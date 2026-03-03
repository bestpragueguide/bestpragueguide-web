'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { TIME_SLOTS } from '@/lib/booking'

interface BookingRequestFormProps {
  tourId: number
  tourName: string
  price: number
  surchargePercent?: number
  locale: string
}

export function BookingRequestForm({
  tourId,
  tourName,
  price,
  surchargePercent,
  locale,
}: BookingRequestFormProps) {
  const t = useTranslations('booking')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [requestRef, setRequestRef] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [guests, setGuests] = useState(2)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrors({})

    const form = e.currentTarget
    const data = {
      tourId,
      tourName,
      preferredDate: (form.elements.namedItem('preferredDate') as HTMLInputElement).value,
      preferredTime: (form.elements.namedItem('preferredTime') as HTMLSelectElement).value,
      guests,
      customerName: (form.elements.namedItem('customerName') as HTMLInputElement).value,
      customerEmail: (form.elements.namedItem('customerEmail') as HTMLInputElement).value,
      customerPhone: (form.elements.namedItem('customerPhone') as HTMLInputElement).value || '',
      specialRequests: (form.elements.namedItem('specialRequests') as HTMLTextAreaElement).value || '',
      locale,
    }

    try {
      const res = await fetch('/api/booking/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok && result.success) {
        setStatus('success')
        setRequestRef(result.requestRef || '')
      } else if (result.details) {
        const fieldErrors: Record<string, string> = {}
        for (const err of result.details) {
          if (err.path?.[0]) {
            fieldErrors[err.path[0]] = err.message
          }
        }
        setErrors(fieldErrors)
        setStatus('error')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8 bg-trust/5 rounded-xl border border-trust/20">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-trust mx-auto mb-4"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-lg font-medium text-navy mb-2">{t('successTitle')}</p>
        <p className="text-sm text-gray">
          {t('successMessage')}
        </p>
        {requestRef && (
          <p className="text-xs text-gray mt-2">
            {t('referenceNumber')}: {requestRef}
          </p>
        )}
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div>
        <label htmlFor="preferredDate" className="block text-sm font-medium text-navy mb-1">
          {t('date')}
        </label>
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          min={minDate}
          required
          className={inputClass}
        />
        {errors.preferredDate && (
          <p className="text-xs text-error mt-1">{errors.preferredDate}</p>
        )}
      </div>

      {/* Time */}
      <div>
        <label htmlFor="preferredTime" className="block text-sm font-medium text-navy mb-1">
          {t('time')}
        </label>
        <select
          id="preferredTime"
          name="preferredTime"
          required
          className={inputClass}
        >
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>

      {/* Guests */}
      <div>
        <label htmlFor="guests" className="block text-sm font-medium text-navy mb-1">
          {t('guests')}
        </label>
        <select
          id="guests"
          name="guests"
          required
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className={inputClass}
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? (locale === 'ru' ? 'гость' : 'guest') : locale === 'ru' ? 'гостей' : 'guests'}
            </option>
          ))}
        </select>
        {guests > 4 && surchargePercent && surchargePercent > 0 && (
          <p className="text-xs text-gold mt-1">
            {t('surchargeNote', { percent: surchargePercent })}
          </p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-navy mb-1">
          {t('name')}
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          required
          className={inputClass}
        />
        {errors.customerName && (
          <p className="text-xs text-error mt-1">{errors.customerName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="customerEmail" className="block text-sm font-medium text-navy mb-1">
          {t('email')}
        </label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          required
          className={inputClass}
        />
        {errors.customerEmail && (
          <p className="text-xs text-error mt-1">{errors.customerEmail}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="customerPhone" className="block text-sm font-medium text-navy mb-1">
          {t('phone')}
        </label>
        <input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          placeholder="+1..."
          className={inputClass}
        />
      </div>

      {/* Special Requests */}
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-navy mb-1">
          {t('requests')}
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          rows={3}
          placeholder={locale === 'ru' ? 'Дети, мобильность, интересы...' : 'Children, mobility, interests...'}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 min-h-[44px]"
      >
        {status === 'loading'
          ? locale === 'ru'
            ? 'Отправка...'
            : 'Sending...'
          : t('submit')}
      </button>

      {status === 'error' && !Object.keys(errors).length && (
        <p className="text-sm text-error text-center">
          {locale === 'ru'
            ? 'Ошибка отправки. Попробуйте ещё раз.'
            : 'Failed to send. Please try again.'}
        </p>
      )}
    </form>
  )
}
