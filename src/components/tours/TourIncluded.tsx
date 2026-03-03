interface TourIncludedProps {
  included: Array<{ text: string }>
  excluded: Array<{ text: string }>
  locale: string
}

export function TourIncluded({ included, excluded, locale }: TourIncludedProps) {
  if (included.length === 0 && excluded.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-heading font-bold text-navy mb-6">
        {locale === 'ru' ? 'Что включено' : "What's Included"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Included */}
        {included.length > 0 && (
          <div>
            <ul className="space-y-2">
              {included.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-trust shrink-0 mt-0.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-navy">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Excluded */}
        {excluded.length > 0 && (
          <div>
            <ul className="space-y-2">
              {excluded.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray shrink-0 mt-0.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="text-gray">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
