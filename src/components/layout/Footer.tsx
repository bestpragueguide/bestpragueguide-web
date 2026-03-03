import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'

export async function Footer() {
  const locale = await getLocale()
  const t = await getTranslations('footer')
  const navT = await getTranslations('nav')

  const currentYear = new Date().getFullYear()

  const tourLinks = [
    { href: `/${locale}/tours`, label: navT('tours') },
  ]

  const companyLinks = [
    { href: `/${locale}/about`, label: navT('about') },
    { href: `/${locale}/reviews`, label: navT('reviews') },
    { href: `/${locale}/contact`, label: navT('contact') },
    { href: `/${locale}/faq`, label: 'FAQ' },
  ]

  const legalLinks = [
    { href: `/${locale}/privacy`, label: t('privacy') },
    { href: `/${locale}/terms`, label: t('terms') },
    { href: `/${locale}/cancellation-policy`, label: t('cancellation') },
  ]

  return (
    <footer className="bg-navy text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href={`/${locale}`}
              className="text-xl font-heading font-bold text-white"
            >
              Best Prague Guide
            </Link>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Tours + Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('tours')}
            </h3>
            <ul className="space-y-2">
              {tourLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 mt-8">
              {t('company')}
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('legal')}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {navT('contact')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:info@bestpragueguide.com"
                  className="text-white/60 hover:text-gold transition-colors"
                >
                  info@bestpragueguide.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/420776306858"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-gold transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/bestpragueguide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-gold transition-colors"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="tel:+420776306858"
                  className="text-white/60 hover:text-gold transition-colors"
                >
                  +420 776 306 858
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <p className="text-xs text-white/40">
                {t('hours')}: 09:00–20:00 CET
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/40 text-center sm:text-left">
            <p>{t('license')}</p>
            <p className="mt-1">{t('copyright', { year: currentYear })}</p>
          </div>
          <LanguageSwitcher className="border-white/20 text-white/60 hover:bg-white/10 hover:text-white" />
        </div>
      </div>
    </footer>
  )
}
