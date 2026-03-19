'use client'

import { useEffect } from 'react'

export function BookingPageTracker({ offerToken }: { offerToken: string }) {
  useEffect(() => {
    fetch('/api/booking/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerToken }),
    }).catch(() => {})
  }, [offerToken])

  return null
}
