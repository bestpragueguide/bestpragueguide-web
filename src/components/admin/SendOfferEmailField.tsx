'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'

export function SendOfferEmailField() {
  const { id } = useDocumentInfo()
  const { value: offerToken } = useField<string>({ path: 'offerToken' })
  const { value: offerSentAt } = useField<string>({ path: 'offerSentAt' })
  const { value: status } = useField<string>({ path: 'status' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!offerToken) return null

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
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (data.success) {
        setMessage('Offer email sent successfully')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Request failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: 12, marginBottom: 16, padding: '12px 0', borderTop: '1px solid #e5e7eb' }}>
      {offerSentAt && (
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Last sent: {new Date(offerSentAt).toLocaleString()}
        </p>
      )}
      <button
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
        {loading ? 'Sending...' : offerSentAt ? 'Resend Offer Email' : 'Send Offer Email'}
      </button>
      {message && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#374151' }}>{message}</p>
      )}
    </div>
  )
}
