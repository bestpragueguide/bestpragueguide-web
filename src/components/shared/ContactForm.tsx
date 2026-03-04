'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ContactFormProps {
  locale: string
}

export function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      locale,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12 bg-trust/5 rounded-xl border border-trust/20">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-trust mx-auto mb-4">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-lg font-medium text-navy">{t('success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">
          {t('formName')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
          {t('formEmail')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors text-sm"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-navy mb-1">
          {t('formPhone')}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+1..."
          className="w-full px-4 py-3 rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors text-sm"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-navy mb-1">
          {t('formMessage')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50"
      >
        {status === 'loading'
          ? locale === 'ru'
            ? 'Отправка...'
            : 'Sending...'
          : t('formSubmit')}
      </button>

      {status === 'error' && (
        <p className="text-sm text-error text-center">
          {locale === 'ru'
            ? 'Ошибка отправки. Попробуйте ещё раз.'
            : 'Failed to send. Please try again.'}
        </p>
      )}
    </form>
  )
}
