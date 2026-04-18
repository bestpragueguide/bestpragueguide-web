import { getTrustBarIcon } from '@/lib/icon-map'
import type { TrustBarItem } from '@/lib/cms-types'

interface TrustBarProps {
  items: TrustBarItem[]
  locale?: string
}

// EN-only override for the 4th trust-bar item (seo24): swaps the generic
// "Custom Routes Available" checkmark for a privacy-framed differentiator.
// RU locale keeps the CMS-stored value untouched.
const EN_FOURTH_ITEM_OVERRIDE: TrustBarItem = {
  icon: 'private',
  text: 'Just Your Group, No Strangers',
}

export function TrustBar({ items, locale }: TrustBarProps) {
  const displayItems = items.map((item, index) =>
    locale === 'en' && index === 3 ? EN_FOURTH_ITEM_OVERRIDE : item,
  )

  return (
    <section id="content" className="bg-white py-8 border-y border-gray-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="text-gold">{getTrustBarIcon(item.icon)}</div>
              <span className="text-sm font-medium text-navy">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
