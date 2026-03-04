'use client'

import { createContext, useContext } from 'react'

const AlternateLocaleContext = createContext<string | null>(null)

export function AlternateLocaleProvider({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <AlternateLocaleContext.Provider value={href}>
      {children}
    </AlternateLocaleContext.Provider>
  )
}

export function useAlternateLocaleHref() {
  return useContext(AlternateLocaleContext)
}
