import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { ContactForm } from '@/components/shared/ContactForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('contactTitle')
  const description = t('contactDesc')

  return {
    title,
    description,
    ...buildPageMetadata(locale, 'contact', { title, description }),
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: locale === 'ru' ? 'Контакты' : 'Contact' }]}
        locale={locale}
      />

      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-8">
        {t('heading')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact form */}
        <div>
          <ContactForm locale={locale} />
        </div>

        {/* Direct contacts */}
        <div>
          <h2 className="text-xl font-heading font-semibold text-navy mb-6">
            {t('directContact')}
          </h2>

          <div className="space-y-4">
            <a
              href="mailto:info@bestpragueguide.com"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-light/50 hover:border-gold/50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 6L2 7" />
              </svg>
              <span className="text-sm text-navy">info@bestpragueguide.com</span>
            </a>

            <a
              href="https://wa.me/420776306858"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-light/50 hover:border-trust/50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-trust">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-sm text-navy">WhatsApp</span>
            </a>

            <a
              href="https://t.me/bestpragueguide"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-light/50 hover:border-blue-400/50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="text-sm text-navy">Telegram</span>
            </a>

            <a
              href="tel:+420776306858"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-light/50 hover:border-gold/50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="text-sm text-navy">+420 776 306 858</span>
            </a>
          </div>

          <p className="mt-6 text-sm text-gray">
            {locale === 'ru' ? 'Режим работы' : 'Business Hours'}: 09:00–20:00 CET
          </p>

          {/* Map */}
          <div className="mt-8">
            <iframe
              title="Office Location"
              src="https://maps.google.com/maps?q=50.0875,14.4213&z=15&output=embed"
              className="w-full h-64 rounded-lg border border-gray-light"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}
