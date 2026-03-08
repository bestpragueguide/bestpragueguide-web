'use client'

import Link from 'next/link'

export function TourOrderLink() {
  return (
    <Link
      href="/tour-order"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        fontSize: 13,
        color: 'var(--theme-text)',
        textDecoration: 'none',
        opacity: 0.8,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
        <rect x="1" y="1" width="14" height="3" rx="1" />
        <rect x="1" y="6.5" width="14" height="3" rx="1" />
        <rect x="1" y="12" width="14" height="3" rx="1" />
      </svg>
      Tour Order
    </Link>
  )
}

export default TourOrderLink
