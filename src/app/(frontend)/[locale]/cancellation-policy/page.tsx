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
  const page = await getPageBySlug('cancellation-policy', locale)

  if (page?.seo?.metaTitle) {
    const title = page.seo.metaTitle
    const description = page.seo.metaDescription || ''
    return { title, description, ...buildPageMetadata(locale, 'cancellation-policy', { title, description }) }
  }

  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('cancellationTitle')
  const description = t('cancellationDesc')
  return { title, description, ...buildPageMetadata(locale, 'cancellation-policy', { title, description }) }
}

export default async function CancellationPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const page = await getPageBySlug('cancellation-policy', locale)

  if (page?.content) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[{
            label: locale === 'ru' ? 'Условия отмены' : 'Cancellation Policy',
          }]}
          locale={locale}
        />
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-2">
          {page.title}
        </h1>
        {page.lastUpdated && (
          <p className="text-sm text-gray mb-8">{page.lastUpdated}</p>
        )}
        <div className="prose prose-sm max-w-none text-gray">
          <RichText content={typeof page.content === 'string' ? undefined : page.content as import('@payloadcms/richtext-lexical/lexical').SerializedEditorState} />
        </div>
      </div>
    )
  }

  const t = await getTranslations({ locale, namespace: 'legal' })

  const sections = [
    { title: t('cancellationFreeTitle'), content: t('cancellationFree') },
    { title: t('cancellationLateTitle'), content: t('cancellationLate') },
    { title: t('cancellationNoShowTitle'), content: t('cancellationNoShow') },
    { title: t('cancellationByUsTitle'), content: t('cancellationByUs') },
    { title: t('cancellationRefundsTitle'), content: t('cancellationRefunds') },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{
          label: locale === 'ru' ? 'Условия отмены' : 'Cancellation Policy',
        }]}
        locale={locale}
      />

      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-2">
        {t('cancellationHeading')}
      </h1>
      <p className="text-sm text-gray mb-8">
        {t('cancellationLastUpdated')}
      </p>

      <p className="text-sm text-gray leading-relaxed mb-8">
        {t('cancellationIntro')}
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
