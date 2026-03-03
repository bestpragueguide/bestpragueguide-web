interface ItineraryStop {
  time?: string | null
  title: string
  description?: string | null
  location?: string | null
}

interface TourItineraryProps {
  stops: ItineraryStop[]
  locale: string
}

export function TourItinerary({ stops, locale }: TourItineraryProps) {
  if (stops.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-heading font-bold text-navy mb-6">
        {locale === 'ru' ? 'Маршрут' : 'Itinerary'}
      </h2>

      <div className="relative pl-8 border-l-2 border-gold/30 space-y-6">
        {stops.map((stop, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 rounded-full bg-gold border-2 border-cream" />

            {stop.time && (
              <span className="text-xs font-medium text-gold uppercase tracking-wider">
                {stop.time}
              </span>
            )}
            <h3 className="text-base font-semibold text-navy mt-1">
              {stop.title}
            </h3>
            {stop.description && (
              <p className="text-sm text-gray mt-1 leading-relaxed">
                {stop.description}
              </p>
            )}
            {stop.location && (
              <p className="text-xs text-gray/60 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {stop.location}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
