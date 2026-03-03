interface ReviewCardProps {
  customerName: string
  customerCountry?: string | null
  rating: number
  body: string
  tourName?: string
  tourDate?: string | null
}

export function ReviewCard({
  customerName,
  customerCountry,
  rating,
  body,
  tourName,
  tourDate,
}: ReviewCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-light/50 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {/* Initials avatar */}
        <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center text-lg font-bold shrink-0">
          {customerName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy truncate">
            {customerName}
          </p>
          {customerCountry && (
            <p className="text-xs text-gray">{customerCountry}</p>
          )}
        </div>
        {/* Stars */}
        <div className="ml-auto flex gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={star <= rating ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              className={star <= rating ? 'text-gold' : 'text-gray-light'}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>

      <p className="text-sm text-navy/70 leading-relaxed">{body}</p>

      {(tourName || tourDate) && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray">
          {tourName && <span>{tourName}</span>}
          {tourDate && <span>· {new Date(tourDate).toLocaleDateString()}</span>}
        </div>
      )}
    </div>
  )
}
