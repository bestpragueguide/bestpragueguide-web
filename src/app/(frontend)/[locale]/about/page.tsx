import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

// Photo mapping using Payload media API URLs
const founderPhoto = `${SERVER_URL}/api/media/file/photo_4_2026-03-03_18-30-45.jpg`
const teamPhotos = [
  { src: `${SERVER_URL}/api/media/file/photo_1_2026-03-03_18-30-46.jpg`, alt: 'Guide at the Astronomical Clock' },
  { src: `${SERVER_URL}/api/media/file/photo_5_2026-03-03_18-30-45.jpg`, alt: 'Private tour group at Tyn Church' },
  { src: `${SERVER_URL}/api/media/file/photo_6_2026-03-03_18-30-45.jpg`, alt: 'Tour at the Vltava riverbank' },
  { src: `${SERVER_URL}/api/media/file/photo_7_2026-03-03_18-30-45.jpg`, alt: 'Family tour at Kampa Island' },
]
const galleryPhotos = [
  `${SERVER_URL}/api/media/file/photo_2_2026-03-03_18-30-45.jpg`,
  `${SERVER_URL}/api/media/file/photo_3_2026-03-03_18-30-45.jpg`,
  `${SERVER_URL}/api/media/file/photo_6_2026-03-03_18-30-45.jpg`,
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('aboutTitle'), description: t('aboutDesc') }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: locale === 'ru' ? 'О нас' : 'About Us' }]}
        locale={locale}
      />

      {/* Block 1: Founder */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-8">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
          <Image
            src={founderPhoto}
            alt={locale === 'ru' ? 'Ульяна Формина — основатель Best Prague Guide' : 'Uliana Formina — Founder of Best Prague Guide'}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            {t('founderHeading')}
          </h1>
          <p className="mt-6 text-lg text-navy/70 leading-relaxed">
            {t('founderBio')}
          </p>
          <blockquote className="mt-6 border-l-4 border-gold pl-4 italic text-navy/60">
            &ldquo;{t('founderQuote')}&rdquo;
          </blockquote>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-navy">
            <div>
              <span className="text-2xl font-heading font-bold text-gold block">
                17+
              </span>
              {locale === 'ru' ? 'лет опыта' : 'years experience'}
            </div>
            <div>
              <span className="text-2xl font-heading font-bold text-gold block">
                10,000+
              </span>
              {locale === 'ru' ? 'довольных гостей' : 'happy guests'}
            </div>
            <div>
              <span className="text-2xl font-heading font-bold text-gold block">
                EN + RU
              </span>
              {locale === 'ru' ? 'языки экскурсий' : 'tour languages'}
            </div>
          </div>
        </div>
      </section>

      {/* Block 2: Team */}
      <section className="py-16 border-t border-gray-light/50">
        <h2 className="text-3xl font-heading font-bold text-navy text-center mb-4">
          {t('teamHeading')}
        </h2>
        <p className="text-center text-navy/70 max-w-2xl mx-auto mb-8">
          {t('teamDesc')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {teamPhotos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="trust">{t('teamBadge1')}</Badge>
          <Badge variant="trust">{t('teamBadge2')}</Badge>
          <Badge variant="trust">{t('teamBadge3')}</Badge>
        </div>
      </section>

      {/* Block 3: Values */}
      <section className="py-16 border-t border-gray-light/50">
        <h2 className="text-3xl font-heading font-bold text-navy text-center mb-12">
          {t('valuesHeading')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t('value1'), desc: t('value1Desc') },
            { title: t('value2'), desc: t('value2Desc') },
            { title: t('value3'), desc: t('value3Desc') },
            { title: t('value4'), desc: t('value4Desc') },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center bg-white p-6 rounded-xl border border-gray-light/50"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 text-gold mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                {index + 1}
              </div>
              <h3 className="text-base font-heading font-semibold text-navy mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Block 4: Gallery + CTA */}
      <section className="py-16 border-t border-gray-light/50">
        <div className="grid grid-cols-3 gap-3 mb-12">
          {galleryPhotos.map((src, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src={src}
                alt={locale === 'ru' ? `Экскурсии по Праге ${i + 1}` : `Prague tours ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 33vw"
              />
            </div>
          ))}
        </div>
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href={`/${locale}/tours`} size="lg">
              {locale === 'ru' ? 'Выбрать экскурсию' : 'Choose a Tour'}
            </Button>
            <Button href={`/${locale}/contact`} variant="secondary" size="lg">
              {locale === 'ru' ? 'Связаться с нами' : 'Contact Us'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
