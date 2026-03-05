import Image from 'next/image'
import { Button } from '@/components/shared/Button'
import { resolveMediaUrl } from '@/lib/cms-data'
import type { HomepageData } from '@/lib/cms-types'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

interface GuideProfileProps {
  data: HomepageData
  locale: string
}

export function GuideProfile({ data, locale }: GuideProfileProps) {
  const photoUrl = resolveMediaUrl(data.guidePhoto)
    || `${SERVER_URL}/api/media/file/photo_4_2026-03-03_18-30-45.jpg`

  const learnMoreHref = data.guideLearnMoreHref.startsWith('/')
    ? `/${locale}${data.guideLearnMoreHref}`
    : data.guideLearnMoreHref

  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden order-2 lg:order-1">
            <Image
              src={photoUrl}
              alt={locale === 'ru' ? 'Ульяна Формина — ваш гид по Праге' : 'Uliana Formina — Your Prague Guide'}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
              {data.guideHeading}
            </h2>
            <p className="mt-6 text-lg text-navy/70 leading-relaxed">
              {data.guideBio}
            </p>
            <div className="mt-8">
              <Button href={learnMoreHref} variant="secondary">
                {data.guideLearnMore}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
