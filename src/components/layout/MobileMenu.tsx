'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  navLinks: Array<{ href: string; label: string }>
  ctaLabel: string
  ctaHref: string
}

export function MobileMenu({ open, onClose, navLinks, ctaLabel, ctaHref }: MobileMenuProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Slide-out panel */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 text-navy"
            aria-label="Close menu"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col px-6 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="py-3 text-lg font-medium text-navy border-b border-gray-light/50 hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* CTA */}
          <Link
            href={ctaHref}
            onClick={onClose}
            className="mt-6 py-3 text-center font-medium bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
          >
            {ctaLabel}
          </Link>

        </nav>
      </div>
    </>
  )
}
