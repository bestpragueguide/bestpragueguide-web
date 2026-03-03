import React from 'react'
import type { Metadata } from 'next'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Best Prague Guide — Private Tours in Prague',
  description: 'Private tours in Prague from a guide with 17 years of experience.',
}

export default function FrontendLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  )
}
