'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'

export function BookingStatusBar() {
  const { id } = useDocumentInfo()
  const { value: status } = useField<string>({ path: 'status' })
  const { value: offerToken } = useField<string>({ path: 'offerToken' })
  const { value: offerSentAt } = useField<string>({ path: 'offerSentAt' })
  const { value: paymentStatus } = useField<string>({ path: 'paymentStatus' })
  const { value: customerLanguage } = useField<string>({ path: 'customerLanguage' })
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState<string | null>(null)

  if (!id) return null

  const statusColors: Record<string, { bg: string; text: string }> = {
    new: { bg: '#EFF6FF', text: '#1D4ED8' },
    confirmed: { bg: '#FFF7ED', text: '#C4975C' },
    'payment-sent': { bg: '#FFF7ED', text: '#C4975C' },
    paid: { bg: '#F0FDF4', text: '#16A34A' },
    completed: { bg: '#F0FDF4', text: '#16A34A' },
    declined: { bg: '#FEF2F2', text: '#DC2626' },
  }
  const colors = statusColors[status || 'new'] || statusColors.new

  const locale = customerLanguage || 'en'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const offerUrl = offerToken ? `${baseUrl}/${locale}/booking/${offerToken}` : ''

  const handleCopy = async () => {
    if (!offerUrl) return
    try { await navigator.clipboard.writeText(offerUrl) } catch {
      const input = document.createElement('input')
      input.value = offerUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = async () => {
    const action = offerSentAt ? 'Resend' : 'Send'
    if (!window.confirm(`${action} booking offer email to customer?`)) return
    setSending(true)
    setSendMsg(null)
    try {
      const res = await fetch('/api/booking/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      setSendMsg(data.success ? 'Sent!' : `Error: ${data.error}`)
    } catch {
      setSendMsg('Failed')
    }
    setSending(false)
    if (!sendMsg?.startsWith('Error')) setTimeout(() => setSendMsg(null), 3000)
  }

  return (
    <div style={{ marginBottom: 16, padding: 16, backgroundColor: colors.bg, borderRadius: 8, border: `1px solid ${colors.text}22` }}>
      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.text,
          backgroundColor: `${colors.text}15`,
          padding: '4px 12px',
          borderRadius: 20,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {status || 'new'}
        </span>
        {paymentStatus && paymentStatus !== 'not_required' && (
          <span style={{
            fontSize: 12,
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '3px 10px',
            borderRadius: 20,
          }}>
            Payment: {paymentStatus?.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Booking URL + actions */}
      {offerToken && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              readOnly
              value={offerUrl}
              style={{
                flex: 1,
                minWidth: 200,
                fontSize: 12,
                padding: '5px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                backgroundColor: '#fff',
                color: '#374151',
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{
                fontSize: 12,
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                backgroundColor: copied ? '#dcfce7' : '#f3f4f6',
                color: '#1a1a1a',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={offerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                backgroundColor: '#f3f4f6',
                color: '#1a1a1a',
                fontWeight: 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Open
            </a>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              style={{
                fontSize: 12,
                padding: '6px 14px',
                border: 'none',
                borderRadius: 4,
                backgroundColor: '#C4975C',
                color: '#fff',
                fontWeight: 600,
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {sending ? '...' : offerSentAt ? 'Resend Email' : 'Send Offer'}
            </button>
            {sendMsg && (
              <span style={{ fontSize: 12, color: sendMsg.startsWith('Error') ? '#DC2626' : '#16A34A' }}>
                {sendMsg}
              </span>
            )}
          </div>
          {offerSentAt && (
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              Last sent: {new Date(offerSentAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
