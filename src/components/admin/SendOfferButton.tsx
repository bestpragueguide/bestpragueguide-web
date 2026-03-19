'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'

export function SendOfferButton() {
  const { id } = useDocumentInfo()
  const { value: status } = useField<string>({ path: 'status' })
  const { value: offerToken } = useField<string>({ path: 'offerToken' })
  const { value: offerSentAt } = useField<string>({ path: 'offerSentAt' })
  const { value: paymentStatus } = useField<string>({ path: 'paymentStatus' })
  const { value: customerLanguage } = useField<string>({ path: 'customerLanguage' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Show when booking has an offer token (generated on confirm)
  if (!offerToken) return null

  const locale = customerLanguage || 'en'
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : ''
  const offerUrl = `${baseUrl}/${locale}/booking/${offerToken}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(offerUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = offerUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSend = async () => {
    const action = offerSentAt ? 'Resend' : 'Send'
    if (!window.confirm(`${action} booking offer email to customer?`)) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/booking/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      })
      const data = (await res.json()) as {
        success?: boolean
        offerUrl?: string
        error?: string
      }
      if (data.success) {
        setMessage(`Offer email sent successfully`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Request failed -- check console')
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #e5e7eb' }}>
      {/* Booking page URL */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
          Booking Page URL
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            readOnly
            value={offerUrl}
            style={{
              flex: 1,
              fontSize: 13,
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              backgroundColor: '#f9fafb',
              color: '#374151',
            }}
          />
          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: 13,
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              backgroundColor: copied ? '#dcfce7' : '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Sent status */}
      {offerSentAt && (
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Last sent: {new Date(offerSentAt).toLocaleString()}
        </p>
      )}

      {/* Send/Resend button — hide after full payment */}
      {paymentStatus !== 'fully_paid' && <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        style={{
          backgroundColor: '#C4975C',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? 'Sending...'
          : offerSentAt
            ? 'Resend Offer Email'
            : 'Send Offer Email'}
      </button>}

      {message && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#374151' }}>{message}</p>
      )}
    </div>
  )
}
