import React from 'react'

import '@payloadcms/next/css'

export const metadata = {
  title: 'Best Prague Guide Admin',
}

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
