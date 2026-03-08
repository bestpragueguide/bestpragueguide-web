'use client'

import React, { useState } from 'react'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { BookingModal } from '../booking/BookingModal'
import type { TourPricing } from '@/lib/cms-types'

interface Props {
  tourSlug: string
  tourName: string
  pricing: TourPricing
  locale: 'en' | 'ru'
}

export function TourBookingSection({ tourSlug, tourName, pricing, locale }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

  const handleDateSelect = (date: string, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setModalOpen(true)
  }

  return (
    <>
      <AvailabilityCalendar
        tourSlug={tourSlug}
        locale={locale}
        onDateSelect={handleDateSelect}
      />
      <BookingModal
        tourName={tourName}
        pricing={pricing}
        locale={locale}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDate}
        defaultTime={selectedTime}
      />
    </>
  )
}
