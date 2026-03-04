'use client'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    ym?: (id: number, method: string, goal: string, params?: Record<string, unknown>) => void
  }
}

const YANDEX_ID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) || 0

/**
 * Push event to GTM dataLayer and Yandex Metrika reachGoal.
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

export function trackBookingSubmit(tourName: string, tourId: number) {
  trackEvent('booking_submit', { tour_name: tourName, tour_id: tourId })
}

export function trackCtaClick(tourName: string, location: string) {
  trackEvent('cta_click', { tour_name: tourName, location })
}

export function trackWhatsAppClick(tourName?: string) {
  trackEvent('whatsapp_click', { tour_name: tourName || 'general' })
}

export function trackTourView(tourName: string, tourId: number) {
  trackEvent('tour_view', { tour_name: tourName, tour_id: tourId })
}

export function trackContactSubmit() {
  trackEvent('contact_submit')
}
