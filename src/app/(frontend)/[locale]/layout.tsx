import React from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Best Prague Guide — Private Tours in Prague',
  description:
    'Private tours in Prague from a guide with 17 years of experience.',
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

  const messages = await getMessages()

  return (
    <html lang={locale} dir="ltr">
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
