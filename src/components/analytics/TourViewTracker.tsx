'use client'

import { useEffect } from 'react'
import { trackTourView } from '@/lib/analytics'

interface TourViewTrackerProps {
  tourName: string
  tourId: number
}

export function TourViewTracker({ tourName, tourId }: TourViewTrackerProps) {
  useEffect(() => {
    trackTourView(tourName, tourId)
  }, [tourName, tourId])

  return null
}
