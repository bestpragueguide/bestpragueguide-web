import type { HomepageData, SiteSettingsData } from '@/lib/cms-types'

interface CTASectionProps {
  data: HomepageData
  siteSettings: SiteSettingsData
  locale: string
}

export function CTASection({ data, siteSettings, locale }: CTASectionProps) {
  const ctaHref = data.ctaButtonHref.startsWith('/')
    ? `/${locale}${data.ctaButtonHref}`
    : data.ctaButtonHref

  return (
    <section className="py-10 lg:py-14 bg-gold">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
          {data.ctaHeading}
        </h2>
        <p className="mt-4 text-lg text-white/80">{data.ctaSubtitle}</p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center font-medium rounded-lg px-8 py-4 text-lg bg-white text-navy hover:bg-cream transition-colors visited:text-navy"
          >
            {data.ctaButtonLabel}
          </a>

          <a
            href={`https://wa.me/${siteSettings.whatsappNumber}`}
            className="inline-flex items-center justify-center font-medium rounded-lg px-8 py-4 text-lg border-2 border-white text-white hover:bg-white/10 transition-colors visited:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.ctaWhatsappLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
