import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug } from '@/lib/cms-data'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import RichText from '@/components/shared/RichTextRenderer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const page = await getPageBySlug('terms', locale)

  if (page?.seo?.metaTitle) {
    const title = page.seo.metaTitle
    const description = page.seo.metaDescription || ''
    return { title, description, ...buildPageMetadata(locale, 'terms', { title, description }) }
  }

  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('termsTitle')
  const description = t('termsDesc')
  return { title, description, ...buildPageMetadata(locale, 'terms', { title, description }) }
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const page = await getPageBySlug('terms', locale)

  if (page?.content) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[{
            label: locale === 'ru' ? 'Условия использования' : 'Terms of Service',
          }]}
          locale={locale}
        />
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-2">
          {page.title}
        </h1>
        {page.lastUpdated && (
          <p className="text-sm text-gray mb-8">{page.lastUpdated}</p>
        )}
        <div className="prose prose-sm max-w-none text-gray text-justify">
          <RichText content={typeof page.content === 'string' ? undefined : page.content as import('@payloadcms/richtext-lexical/lexical').SerializedEditorState} />
        </div>
      </div>
    )
  }

  const t = await getTranslations({ locale, namespace: 'legal' })

  const sections = [
    { title: t('termsBookingTitle'), content: t('termsBooking') },
    { title: t('termsPricingTitle'), content: t('termsPricing') },
    { title: t('termsLiabilityTitle'), content: t('termsLiability') },
    { title: t('termsChangesTitle'), content: t('termsChanges') },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{
          label: locale === 'ru' ? 'Условия использования' : 'Terms of Service',
        }]}
        locale={locale}
      />

      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-2">
        {t('termsHeading')}
      </h1>
      <p className="text-sm text-gray mb-8">{t('termsLastUpdated')}</p>

      <p className="text-sm text-gray leading-relaxed mb-8">
        {t('termsIntro')}
      </p>

      {sections.map((section, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-lg font-heading font-semibold text-navy mb-3">
            {section.title}
          </h2>
          <p className="text-sm text-gray leading-relaxed">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  )
}
