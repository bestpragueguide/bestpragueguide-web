import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('cancellationTitle'),
    description: t('cancellationDesc'),
  }
}

export default async function CancellationPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })

  const sections = [
    {
      title: t('cancellationFreeTitle'),
      content: t('cancellationFree'),
    },
    {
      title: t('cancellationLateTitle'),
      content: t('cancellationLate'),
    },
    {
      title: t('cancellationNoShowTitle'),
      content: t('cancellationNoShow'),
    },
    {
      title: t('cancellationByUsTitle'),
      content: t('cancellationByUs'),
    },
    {
      title: t('cancellationRefundsTitle'),
      content: t('cancellationRefunds'),
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          {
            label:
              locale === 'ru'
                ? 'Условия отмены'
                : 'Cancellation Policy',
          },
        ]}
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
