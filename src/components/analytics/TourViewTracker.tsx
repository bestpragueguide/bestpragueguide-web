'use client'

import { useEffect } from 'react'
import { trackTourView } from '@/lib/analytics'

interface TourViewTrackerProps {
  tourName: string
  tourId: number
  price?: number
}

export function TourViewTracker({ tourName, tourId, price }: TourViewTrackerProps) {
  useEffect(() => {
    trackTourView(tourName, tourId, price)
  }, [tourName, tourId, price])

  return null
}
