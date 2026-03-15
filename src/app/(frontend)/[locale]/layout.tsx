import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { BackToTop } from '@/components/shared/BackToTop'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import { RefreshOnSave } from '@/components/shared/RefreshOnSave'
import { CookieConsent } from '@/components/shared/CookieConsent'
import {
  GoogleTagManagerHead,
  GoogleTagManagerBody,
} from '@/components/analytics/GoogleTagManager'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { YandexMetrika } from '@/components/analytics/YandexMetrika'
import { UmamiAnalytics } from '@/components/analytics/UmamiAnalytics'
import { getSiteSettings, getNavigation } from '@/lib/cms-data'
import '@/app/globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'Best Prague Guide — Private Tours in Prague',
  description:
    'Private tours in Prague from a guide with 17 years of experience.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  other: {
    'theme-color': '#C4975C',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com',
  ),
  openGraph: {
    siteName: 'Best Prague Guide',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-default.jpg'],
  },
}

export default async function FrontendLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'ru')) {
    notFound()
  }

  const [messages, siteSettings, navigation] = await Promise.all([
    getMessages(),
    getSiteSettings(locale),
    getNavigation(locale),
  ])

  return (
    <html lang={locale} dir="ltr">
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        <GoogleTagManagerBody />
        <NextIntlClientProvider messages={messages}>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-gold focus:text-white focus:rounded-lg">
            {locale === 'ru' ? 'Перейти к содержимому' : 'Skip to content'}
          </a>
          <Nav navigation={navigation} locale={locale} />
          <main id="main-content" className="pt-16">{children}</main>
          <Footer navigation={navigation} siteSettings={siteSettings} locale={locale} />
          <WhatsAppButton
            phone={siteSettings.whatsappNumber}
            messageTemplate={siteSettings.whatsappMessageTemplate}
            tourMessageTemplate={siteSettings.whatsappTourMessageTemplate}
            locale={locale}
          />
          <BackToTop />
          <CookieConsent locale={locale} />
          <OrganizationSchema />
          <RefreshOnSave />
        </NextIntlClientProvider>
        <GoogleTagManagerHead />
        <GoogleAnalytics />
        <UmamiAnalytics />
        <YandexMetrika />
      </body>
    </html>
  )
}
