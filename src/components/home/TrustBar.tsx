import { getTrustBarIcon } from '@/lib/icon-map'
import type { TrustBarItem } from '@/lib/cms-types'

interface TrustBarProps {
  items: TrustBarItem[]
}

export function TrustBar({ items }: TrustBarProps) {
  return (
    <section id="content" className="bg-white py-8 border-y border-gray-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((item, index) => (
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
