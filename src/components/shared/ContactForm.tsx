'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface ContactFormProps {
  locale: string
  phoneDisplay?: string
}

export function ContactForm({ locale, phoneDisplay }: ContactFormProps) {
  const phone = phoneDisplay || '+420 776 306 858'
  const t = useTranslations('contact')
  const tPages = useTranslations('pages')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'rate_limited' | 'too_long'>('idle')

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setStatus('idle'), 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value
    if (message.length > 1000) {
      setStatus('too_long')
      return
    }

    setStatus('loading')

    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      message,
      locale,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (result.success) {
        setStatus('success')
        form.reset()
      } else if (res.status === 429) {
        setStatus('rate_limited')
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
      <noscript>
        <p className="bg-gold/10 text-navy p-4 rounded-lg text-sm">
          {locale === 'ru'
            ? 'Для использования этой формы необходимо включить JavaScript в браузере.'
            : 'Please enable JavaScript in your browser to use this form.'}
        </p>
      </noscript>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">
          {t('formName')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
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
          autoComplete="email"
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
          minLength={3}
          maxLength={30}
          placeholder="+1..."
          autoComplete="tel"
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
          minLength={4}
          maxLength={1000}
          autoComplete="off"
          aria-invalid={status === 'too_long'}
          aria-describedby={status === 'too_long' ? 'error-message' : undefined}
          className="w-full px-4 py-3 rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === 'loading' && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {status === 'loading' ? tPages('contactSending') : t('formSubmit')}
      </button>

      {status === 'too_long' && (
        <p id="error-message" className="text-sm text-error text-center">
          {tPages('contactTooLong')}
        </p>
      )}

      {status === 'rate_limited' && (
        <p className="text-sm text-error text-center">
          {tPages('contactRateLimit', { phone })}
        </p>
      )}

      {status === 'error' && (
        <p className="text-sm text-error text-center">
          {tPages('contactError')}
        </p>
      )}
    </form>
  )
}
