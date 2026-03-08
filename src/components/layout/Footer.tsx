import Link from 'next/link'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { Logo } from '@/components/shared/Logo'
import type { NavigationData, SiteSettingsData } from '@/lib/cms-types'

interface FooterProps {
  navigation: NavigationData
  siteSettings: SiteSettingsData
  locale: string
}

const associationText: Record<string, string> = {
  en: 'Member of the Czech Guides Association —\naffiliated with the Union of Tourist Business and the World Federation of Tourist Guide Associations',
  ru: 'Член Ассоциации гидов Чехии —\nвходящей в Союз туристического бизнеса и Всемирную федерацию ассоциаций туристических гидов',
}

export function Footer({ navigation, siteSettings, locale }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Centered logo block — matches BPG_Logo_Final reference */}
        <div className="text-center">
          <Link href={`/${locale}`} className="inline-block">
            <Logo variant="footer" locale={locale} />
          </Link>
          <p className="text-xs text-[#555] mt-4 leading-[1.8]">
            {(associationText[locale] || associationText.en).split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <p className="text-xs text-[#444] mt-3">
            <a href={`mailto:${siteSettings.contactEmail}`} className="text-gold hover:text-gold-dark transition-colors">
              {siteSettings.contactEmail}
            </a>
            {' · '}
            <a href={`https://wa.me/${siteSettings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark transition-colors">
              WhatsApp
            </a>
            {' · '}
            <a href={`tel:${siteSettings.contactPhone}`} className="text-gold hover:text-gold-dark transition-colors">
              {siteSettings.contactPhoneDisplay}
            </a>
          </p>

          {/* Social icons */}
          {siteSettings.socialLinks?.instagramUrl && (
            <div className="mt-4 flex justify-center gap-4">
              <a
                href={siteSettings.socialLinks.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Navigation columns */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
          {navigation.footerColumns.map((column, colIdx) => (
            <div key={colIdx} className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href.startsWith('/') ? `/${locale}${link.href}` : link.href}
                      className="text-sm text-white/60 hover:text-gold transition-colors"
                      {...(link.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-[#444] text-center sm:text-left">
            <p>
              {navigation.footerCopyright.replace('{year}', String(currentYear))}
            </p>
          </div>
          <LanguageSwitcher className="border-white/20 text-white/60 hover:bg-white/10 hover:text-white" />
        </div>
      </div>
    </footer>
  )
}
