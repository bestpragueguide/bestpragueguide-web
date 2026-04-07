'use client'

import { trackWhatsAppClick } from '@/lib/analytics'

interface TrackedWhatsAppLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

export function TrackedWhatsAppLink({ href, className, children }: TrackedWhatsAppLinkProps) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick()}
    >
      {children}
    </a>
  )
}
