'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface DateSlot {
  date: string          // YYYY-MM-DD
  startTime: string     // HH:MM
  status: 'available' | 'limited' | 'full'
  availableSpots: number
  maxCapacity: number
  priceNote?: string | null
}

interface Props {
  tourSlug: string
  locale: 'en' | 'ru'
  onDateSelect: (date: string, time: string) => void
  className?: string
}

const STATUS_CLS: Record<string, string> = {
  available: 'bg-green-50 text-green-800 hover:bg-green-100 cursor-pointer ring-1 ring-green-200',
  limited:   'bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer ring-1 ring-amber-200',
  full:      'bg-red-50 text-red-400 cursor-not-allowed opacity-60',
}

const MONTH_NAMES_EN = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const MONTH_NAMES_RU = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
]
const DAY_NAMES_EN = ['Su','Mo','Tu','We','Th','Fr','Sa']
const DAY_NAMES_RU = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']

export function AvailabilityCalendar({ tourSlug, locale, onDateSelect, className }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-based
  const [slots, setSlots] = useState<DateSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  const monthNames = locale === 'ru' ? MONTH_NAMES_RU : MONTH_NAMES_EN
  const dayNames = locale === 'ru' ? DAY_NAMES_RU : DAY_NAMES_EN

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/availability/${tourSlug}?month=${monthKey}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { dates: DateSlot[] }
      setSlots(data.dates ?? [])
    } catch {
      setError(true)
    }
    setLoading(false)
  }, [tourSlug, monthKey])

  useEffect(() => { void fetchSlots() }, [fetchSlots])

  const slotMap = Object.fromEntries(slots.map((s) => [s.date, s]))
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const canGoPrev = new Date(year, month - 2, 1) >= new Date(now.getFullYear(), now.getMonth(), 1)

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ‹
        </button>
        <span className="font-semibold text-navy text-base">
          {monthNames[month - 1]} {year}
        </span>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-gray-400">
          {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
        </div>
      ) : error ? (
        <div className="h-40 flex items-center justify-center text-sm text-red-400">
          {locale === 'ru' ? 'Ошибка загрузки' : 'Could not load availability'}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`gap-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const slot = slotMap[dateStr]
            const isPast = new Date(dateStr) < today

            if (isPast) {
              return (
                <div key={day} className="aspect-square flex items-center justify-center text-sm text-gray-200 select-none">
                  {day}
                </div>
              )
            }

            if (!slot) {
              return (
                <div key={day} className="aspect-square flex items-center justify-center text-sm text-gray-300 select-none">
                  {day}
                </div>
              )
            }

            const isBookable = slot.status === 'available' || slot.status === 'limited'
            const title =
              slot.status === 'full'
                ? (locale === 'ru' ? 'Мест нет' : 'Fully booked')
                : slot.priceNote
                  ? slot.priceNote
                  : `${slot.availableSpots} ${locale === 'ru' ? 'мест' : 'spots'}`

            return (
              <button
                key={day}
                type="button"
                disabled={!isBookable}
                onClick={() => onDateSelect(dateStr, slot.startTime)}
                title={title}
                className={`aspect-square flex flex-col items-center justify-center text-sm rounded-xl transition-all ${STATUS_CLS[slot.status] ?? ''}`}
              >
                <span className="leading-none">{day}</span>
                {slot.status === 'limited' && (
                  <span className="text-[10px] leading-none mt-0.5 opacity-70">
                    {slot.availableSpots}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-50 ring-1 ring-green-200 inline-block" />
          {locale === 'ru' ? 'Свободно' : 'Available'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-50 ring-1 ring-amber-200 inline-block" />
          {locale === 'ru' ? 'Мало мест' : 'Limited'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-50 ring-1 ring-red-200 inline-block" />
          {locale === 'ru' ? 'Занято' : 'Full'}
        </span>
      </div>
    </div>
  )
}
