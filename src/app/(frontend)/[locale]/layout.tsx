import React from 'react'
import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import {
  GoogleTagManagerHead,
  GoogleTagManagerBody,
} from '@/components/analytics/GoogleTagManager'
import { YandexMetrika } from '@/components/analytics/YandexMetrika'
import { getSiteSettings, getNavigation } from '@/lib/cms-data'
import '@/app/globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Best Prague Guide — Private Tours in Prague',
  description:
    'Private tours in Prague from a guide with 17 years of experience.',
  icons: {
    icon: '/favicon.svg',
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
          <Nav navigation={navigation} locale={locale} />
          <main className="pt-16">{children}</main>
          <Footer navigation={navigation} siteSettings={siteSettings} locale={locale} />
          <WhatsAppButton
            phone={siteSettings.whatsappNumber}
            messageTemplate={siteSettings.whatsappMessageTemplate}
            tourMessageTemplate={siteSettings.whatsappTourMessageTemplate}
            locale={locale}
          />
          <OrganizationSchema />
        </NextIntlClientProvider>
        <GoogleTagManagerHead />
        <YandexMetrika />
      </body>
    </html>
  )
}
