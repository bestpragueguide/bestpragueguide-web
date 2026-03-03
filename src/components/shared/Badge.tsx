import React from 'react'

type BadgeVariant = 'category' | 'trust' | 'tag'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  category:
    'bg-gold/10 text-gold-dark border border-gold/20',
  trust:
    'bg-trust/10 text-trust border border-trust/20',
  tag:
    'bg-navy/5 text-navy-light border border-navy/10',
}

export function Badge({
  variant = 'tag',
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
