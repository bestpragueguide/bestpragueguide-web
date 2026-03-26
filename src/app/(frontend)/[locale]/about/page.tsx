import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getAboutPageData, resolveMediaUrl } from '@/lib/cms-data'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Button } from '@/components/shared/Button'
import { SafeRichText } from '@/components/shared/SafeRichText'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

// Fallback photo URLs used when CMS has no images
const fallbackFounderPhoto = `${SERVER_URL}/api/media/file/photo_4_2026-03-03_18-30-45.jpg`
const fallbackGalleryPhotos = [
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
  const aboutData = await getAboutPageData(locale)

  if (aboutData.seo?.metaTitle) {
    const title = aboutData.seo.metaTitle
    const description = aboutData.seo.metaDescription || ''
    return { title, description, ...buildPageMetadata(locale, 'about', { title, description }) }
  }

  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('aboutTitle')
  const description = t('aboutDesc')
  return { title, description, ...buildPageMetadata(locale, 'about', { title, description }) }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const data = await getAboutPageData(locale)
  const tPages = await getTranslations({ locale, namespace: 'pages' })

  const founderPhotoUrl = resolveMediaUrl(data.founderPhoto) || fallbackFounderPhoto

  const galleryPhotos = data.galleryPhotos.length > 0
    ? data.galleryPhotos.map((p) => resolveMediaUrl(p.image) || '')
    : fallbackGalleryPhotos

  const ctaPrimaryHref = data.ctaPrimaryHref.startsWith('/')
    ? `/${locale}${data.ctaPrimaryHref}`
    : data.ctaPrimaryHref
  const ctaSecondaryHref = data.ctaSecondaryHref.startsWith('/')
    ? `/${locale}${data.ctaSecondaryHref}`
    : data.ctaSecondaryHref

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: tPages('aboutBreadcrumb') }]}
        locale={locale}
      />

      {/* Block 1: Founder */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-8">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
          <Image
            src={founderPhotoUrl}
            alt={locale === 'ru' ? 'Ульяна Формина — основатель Best Prague Guide' : 'Uliana Formina — Founder of Best Prague Guide'}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            {data.founderHeading}
          </h1>
          <SafeRichText data={data.founderBio} className="mt-6 text-lg text-navy/70 leading-relaxed prose prose-lg max-w-none text-justify" />
          {data.founderQuote && (
            <blockquote className="mt-6 border-l-4 border-gold pl-4 italic text-navy/60">
              &ldquo;{data.founderQuote}&rdquo;
            </blockquote>
          )}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-navy">
            {data.stats.map((stat, i) => (
              <div key={i}>
                <span className="text-2xl font-heading font-bold text-gold block">
                  {stat.value}
                </span>
                {stat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Block 2: Values */}
      <section className="py-16 border-t border-gray-light/50">
        <h2 className="text-3xl font-heading font-bold text-navy text-center mb-12">
          {data.valuesHeading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.values.map((item, index) => (
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
              <p className="text-sm text-gray">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Block 4: Gallery + CTA */}
      <section className="py-16 border-t border-gray-light/50">
        {galleryPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-12">
            {galleryPhotos.map((src, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                  src={src}
                  alt={locale === 'ru' ? `Экскурсии по Праге ${i + 1}` : `Prague tours ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 33vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href={ctaPrimaryHref} size="lg">
              {data.ctaPrimaryLabel}
            </Button>
            <Button href={ctaSecondaryHref} variant="secondary" size="lg">
              {data.ctaSecondaryLabel}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
