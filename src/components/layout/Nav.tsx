'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { Logo } from '@/components/shared/Logo'
import { MobileMenu } from './MobileMenu'
import { localizeHref } from '@/i18n/routing'
import type { NavigationData } from '@/lib/cms-types'

interface NavProps {
  navigation: NavigationData
  locale: string
}

export function Nav({ navigation, locale }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = navigation.headerLinks.map((link) => ({
    href: localizeHref(link.href, locale),
    label: link.label,
  }))

  const ctaHref = localizeHref(navigation.headerCta.href, locale)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-light/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`}>
            <Logo variant="sm" locale={locale} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-navy/70 hover:text-navy transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA + Language */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href={ctaHref}
              className="px-5 py-2 text-sm font-medium bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
            >
              {navigation.headerCta.label}
            </Link>
          </div>

          {/* Mobile: language switcher + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-navy"
              aria-label={locale === 'ru' ? 'Открыть меню' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
        ctaLabel={navigation.headerCta.label}
        ctaHref={ctaHref}
      />
    </>
  )
}
