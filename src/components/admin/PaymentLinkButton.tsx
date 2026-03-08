'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'

export function PaymentLinkButton() {
  const { id } = useDocumentInfo()
  const { value: status } = useField<string>({ path: 'status' })
  const { value: paymentStatus } = useField<string>({ path: 'paymentStatus' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (status !== 'confirmed') return null
  if (paymentStatus === 'deposit_paid' || paymentStatus === 'fully_paid') return null

  const handleClick = async () => {
    if (!window.confirm('Send Stripe payment link to customer?')) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/booking/send-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      })
      const data = (await res.json()) as {
        success?: boolean
        depositEur?: number
        cashBalanceEur?: number
        error?: string
      }
      if (data.success) {
        setMessage(
          `✅ Payment link sent — deposit €${data.depositEur?.toFixed(2)}, cash balance €${data.cashBalanceEur?.toFixed(2)}`
        )
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch {
      setMessage('❌ Request failed — check console')
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #e5e7eb' }}>
      <button
        type="button"
        onClick={handleClick}
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
        {loading ? 'Sending...' : '💳 Send Payment Link'}
      </button>
      {message && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#374151' }}>{message}</p>
      )}
    </div>
  )
}
