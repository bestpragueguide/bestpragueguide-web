'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { TIME_SLOTS } from '@/lib/booking'
import { trackBookingSubmit } from '@/lib/analytics'
import { currencies, formatPrice, type Currency } from '@/lib/currency'
import { calculatePrice, getMaxGuests, getDisplayPrice, hasOpenEndedTier } from '@/lib/pricing'
import type { TourPricing, ServiceData } from '@/lib/cms-types'
import { guestsLabel } from '@/lib/plurals'

interface BookingRequestFormProps {
  tourId: number
  tourName: string
  pricing: TourPricing
  maxGroupSize?: number
  locale: string
  defaultDate?: string
  defaultTime?: string
  preferredTimes?: string[]
}

export function BookingRequestForm({
  tourId,
  tourName,
  pricing,
  maxGroupSize,
  locale,
  defaultDate,
  defaultTime,
  preferredTimes,
}: BookingRequestFormProps) {
  const t = useTranslations('booking')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error' | 'rate-limited'
  >('idle')
  const [requestRef, setRequestRef] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [guests, setGuests] = useState(2)
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<number>>(new Set())
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({})

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const maxGuests = useMemo(() => getMaxGuests(pricing, maxGroupSize), [pricing, maxGroupSize])
  const openEnded = useMemo(() => hasOpenEndedTier(pricing), [pricing])

  const availableServices = useMemo(() => {
    return (pricing.additionalServices || [])
      .map(a => typeof a.service === 'object' ? a.service as ServiceData : null)
      .filter((s): s is ServiceData => s !== null)
  }, [pricing])

  const selectedServices = useMemo(() => {
    return availableServices.filter(s => selectedServiceIds.has(s.id))
  }, [availableServices, selectedServiceIds])

  const priceResult = useMemo(
    () => calculatePrice(pricing, guests, selectedServices, undefined, locale),
    [pricing, guests, selectedServices, locale],
  )

  const categoryModifier = useMemo(() => {
    if (!pricing.guestCategories?.length) return 0
    return pricing.guestCategories.reduce((total, cat) => {
      const count = categoryBreakdown[cat.label] || 0
      if (cat.isFree || cat.onRequest) return total
      return total + count * (cat.priceModifier || 0)
    }, 0)
  }, [pricing.guestCategories, categoryBreakdown])

  const displayInfo = useMemo(() => getDisplayPrice(pricing), [pricing])

  const totalWithModifiers = priceResult.total !== null
    ? priceResult.total + categoryModifier
    : null

  function toggleService(id: number) {
    setSelectedServiceIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateCategory(label: string, count: number) {
    setCategoryBreakdown(prev => ({ ...prev, [label]: count }))
  }

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
      totalPrice: totalWithModifiers,
      pricingModel: pricing.model,
      isOnRequest: priceResult.isOnRequest,
      currency,
      locale,
      selectedServices: selectedServices.map(s => ({ id: s.id, name: s.name })),
      guestCategories: Object.keys(categoryBreakdown).length > 0 ? categoryBreakdown : undefined,
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
        trackBookingSubmit(tourName, tourId)
      } else if (res.status === 429) {
        setStatus('rate-limited')
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

  const servicePrice = (service: ServiceData): string => {
    if (service.pricingModel === 'FLAT' && service.flatPrice != null)
      return `+${formatPrice(service.flatPrice, currency)}`
    if (service.pricingModel === 'PER_PERSON') {
      const cat = service.guestCategoryPricing?.find(c => !c.isFree && !c.onRequest && c.price != null)
      if (cat?.price != null) return `+${formatPrice(cat.price, currency)}/${locale === 'ru' ? 'чел' : 'pp'}`
    }
    if (service.pricingModel === 'ON_REQUEST')
      return locale === 'ru' ? 'по запросу' : 'on request'
    return ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Total price + currency selector */}
      <div className="bg-cream/50 rounded-lg p-3 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {currencies.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                currency === c
                  ? 'bg-gold text-white border-gold'
                  : 'bg-white text-gray border-gray-light hover:border-gold/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs font-medium text-navy/60 mb-1">
          {t('totalPrice')}
        </p>
        {priceResult.isOnRequest && totalWithModifiers === null ? (
          <span className="text-xl font-bold text-gold">
            {t('onRequest')}
          </span>
        ) : (
          <>
            <span className="text-2xl font-bold text-gold">
              {formatPrice(totalWithModifiers ?? 0, currency)}
            </span>
            <p className="text-xs text-gray mt-1">
              {priceResult.breakdown.basePriceLabel}
            </p>
          </>
        )}
      </div>

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
          {(preferredTimes && preferredTimes.length > 0 ? preferredTimes : TIME_SLOTS).map((slot) => (
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
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n === maxGuests && openEnded
                ? `${n}+ ${guestsLabel(n, locale)}`
                : `${n} ${guestsLabel(n, locale)}`}
            </option>
          ))}
        </select>
        {priceResult.isOnRequest && priceResult.total !== null && (
          <p className="text-xs text-gold mt-1">
            {t('exactPriceOnRequest')}
          </p>
        )}
      </div>

      {/* Guest Categories */}
      {pricing.guestCategories && pricing.guestCategories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-navy mb-2">
            {pricing.guestCategoriesHeading || t('guestCategoriesDefault')}
          </p>
          <div className="space-y-2">
            {pricing.guestCategories.map((cat) => (
              <div key={cat.label} className="flex items-center justify-between">
                <span className="text-sm text-navy/70">
                  {cat.label}
                  {cat.isFree
                    ? ` (${t('free')})`
                    : cat.priceModifier
                      ? ` (+${formatPrice(cat.priceModifier, currency)})`
                      : ''}
                </span>
                <select
                  value={categoryBreakdown[cat.label] || 0}
                  onChange={(e) => updateCategory(cat.label, Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm text-center"
                >
                  {Array.from({ length: guests + 1 }, (_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Services */}
      {availableServices.length > 0 && (
        <div>
          <p className="text-sm font-medium text-navy mb-2">
            {t('additionalServices')}
          </p>
          <div className="space-y-2">
            {availableServices.map((service) => (
              <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServiceIds.has(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="h-4 w-4 rounded border-gray-light text-gold focus:ring-gold accent-[#C4975C]"
                />
                <span className="text-sm text-navy/70 flex-1">{service.name}</span>
                <span className="text-sm font-medium text-navy">{servicePrice(service)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

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
        {status === 'loading' ? t('sending') : t('submit')}
      </button>

      {status === 'rate-limited' && (
        <div className="text-sm text-center p-3 bg-gold/5 border border-gold/20 rounded-lg">
          <p className="text-navy">
            {t('rateLimitTitle')}
          </p>
          <a href="tel:+420776306858" className="text-gold font-medium">
            +420 776 306 858
          </a>
        </div>
      )}

      {status === 'error' && !Object.keys(errors).length && (
        <p className="text-sm text-error text-center">
          {t('errorSend')}
        </p>
      )}
    </form>
  )
}
