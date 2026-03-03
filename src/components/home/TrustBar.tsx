import { getTranslations } from 'next-intl/server'

const icons = {
  experience: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  guests: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  licensed: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  curated: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="9,11 12,14 22,4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
}

export async function TrustBar() {
  const t = await getTranslations('trustBar')

  const items = [
    { key: 'experience' as const, icon: icons.experience },
    { key: 'guests' as const, icon: icons.guests },
    { key: 'licensed' as const, icon: icons.licensed },
    { key: 'curated' as const, icon: icons.curated },
  ]

  return (
    <section className="bg-white py-8 border-y border-gray-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="text-gold">{item.icon}</div>
              <span className="text-sm font-medium text-navy">
                {t(item.key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
