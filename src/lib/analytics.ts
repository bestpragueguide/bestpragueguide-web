'use client'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    ym?: (id: number, method: string, goal: string, params?: Record<string, unknown>) => void
  }
}

const YANDEX_ID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) || 0

/** Fire Meta Pixel event (no-op if Pixel not loaded) */
function fbqTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params)
  }
}

/**
 * Push event to GTM dataLayer, Yandex Metrika reachGoal, and Meta Pixel.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  // GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event: name, ...params })
  }

  // Yandex Metrika
  if (typeof window !== 'undefined' && window.ym && YANDEX_ID) {
    window.ym(YANDEX_ID, 'reachGoal', name, params)
  }
}

export function trackBookingSubmit(tourName: string, tourId: number, price?: number, currency?: string) {
  trackEvent('booking_submit', { tour_name: tourName, tour_id: tourId })
  fbqTrack('Lead', {
    content_name: tourName,
    content_category: 'Private Tour',
    ...(price ? { value: price, currency: currency || 'EUR' } : {}),
  })
}

export function trackCtaClick(tourName: string, location: string) {
  trackEvent('cta_click', { tour_name: tourName, location })
}

export function trackWhatsAppClick(tourName?: string) {
  trackEvent('whatsapp_click', { tour_name: tourName || 'general' })
  fbqTrack('Contact', { content_name: 'WhatsApp Click' })
}

export function trackPhoneClick() {
  trackEvent('phone_click')
  fbqTrack('Contact', { content_name: 'Phone Click' })
}

export function trackTourView(tourName: string, tourId: number, price?: number) {
  trackEvent('tour_view', { tour_name: tourName, tour_id: tourId })
  fbqTrack('ViewContent', {
    content_name: tourName,
    content_type: 'product',
    content_ids: [String(tourId)],
    ...(price ? { value: price, currency: 'EUR' } : {}),
  })
}

export function trackContactSubmit() {
  trackEvent('contact_submit')
  fbqTrack('Lead', { content_name: 'Contact Form', content_category: 'General Inquiry' })
}
