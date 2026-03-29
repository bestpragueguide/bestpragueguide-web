'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'

const statusLabels: Record<string, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  'offer-sent': 'Offer Sent',
  paid: 'Paid',
  completed: 'Completed',
  'no-show': 'No Show',
  cancelled: 'Cancelled',
  declined: 'Declined',
}

const statusColors: Record<string, string> = {
  new: '#1D4ED8',
  confirmed: '#C4975C',
  'offer-sent': '#C4975C',
  paid: '#16A34A',
  completed: '#16A34A',
  'no-show': '#9333EA',
  cancelled: '#DC2626',
  declined: '#DC2626',
}

const paymentLabels: Record<string, string> = {
  not_required: '',
  awaiting: 'Awaiting',
  link_sent: 'Link Sent',
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Fully Paid',
  refund_pending: 'Refund Pending',
  refunded: 'Refunded',
}

export function BookingStatusBar() {
  const { id } = useDocumentInfo()
  const { value: status } = useField<string>({ path: 'status' })
  const { value: offerToken } = useField<string>({ path: 'offerToken' })
  const { value: offerSentAt } = useField<string>({ path: 'offerSentAt' })
  const { value: lastUpdateSentAt } = useField<string>({ path: 'lastUpdateSentAt' })
  const { value: paymentStatus } = useField<string>({ path: 'paymentStatus' })
  const { value: totalPaid } = useField<number>({ path: 'totalPaid' })
  const { value: balanceDue } = useField<number>({ path: 'balanceDue' })
  const { value: bookingCurrency } = useField<string>({ path: 'currency' })
  const { value: customerLanguage } = useField<string>({ path: 'customerLanguage' })
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState<string | null>(null)
  const [localOfferSentAt, setLocalOfferSentAt] = useState<string | null>(null)
  const [localUpdateSentAt, setLocalUpdateSentAt] = useState<string | null>(null)

  if (!id) return null

  const color = statusColors[status || 'new'] || '#1D4ED8'
  const label = statusLabels[status || 'new'] || status || 'New'
  const payLabel = paymentLabels[paymentStatus || ''] || ''

  const locale = customerLanguage || 'en'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const offerUrl = offerToken ? `${baseUrl}/${locale}/booking/${offerToken}` : ''

  const handleCopy = async () => {
    if (!offerUrl) return
    try { await navigator.clipboard.writeText(offerUrl) } catch {
      const i = document.createElement('input')
      i.value = offerUrl
      document.body.appendChild(i)
      i.select()
      document.execCommand('copy')
      document.body.removeChild(i)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = async () => {
    const action = offerSentAt ? 'Resend (Booking Update)' : 'Send'
    if (!window.confirm(`Save and ${action} email to customer?`)) return
    setSending(true)
    setSendMsg(null)
    try {
      // Save the document first by clicking the save button
      const saveBtn = document.querySelector('button[type="button"]') as HTMLButtonElement | null
      const saveBtns = document.querySelectorAll('button')
      let saved = false
      for (const b of saveBtns) {
        const text = b.textContent?.trim() || ''
        if ((text === 'Save' || text === 'Save Draft' || text.includes('Save')) && !b.disabled) {
          b.click()
          await new Promise(resolve => setTimeout(resolve, 2000))
          saved = true
          break
        }
      }

      // Send offer email
      const res = await fetch('/api/booking/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (data.success) {
        const now = new Date().toISOString()
        if (status === 'confirmed' && !offerSentAt && !localOfferSentAt) {
          setLocalOfferSentAt(now)
        } else {
          setLocalUpdateSentAt(now)
        }
      }
      setSendMsg(data.success ? (saved ? 'Saved & Sent!' : 'Sent!') : `Error: ${data.error}`)
    } catch {
      setSendMsg('Failed')
    }
    setSending(false)
    setTimeout(() => setSendMsg(null), 4000)
  }

  const badge = (text: string, bg: string, fg: string) => (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 600, color: fg,
      backgroundColor: bg, padding: '2px 8px', borderRadius: 4,
      textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: '18px',
    }}>
      {text}
    </span>
  )

  const btn = (text: string, onClick: () => void, opts?: { bg?: string; fg?: string; disabled?: boolean; href?: string }) => {
    const style: React.CSSProperties = {
      display: 'inline-block', fontSize: 11, fontWeight: 500, padding: '4px 10px',
      borderRadius: 4, border: '1px solid var(--theme-elevation-150, #d1d5db)',
      backgroundColor: opts?.bg || 'var(--theme-elevation-50, #f9fafb)',
      color: opts?.fg || 'var(--theme-elevation-800, #1f2937)',
      cursor: opts?.disabled ? 'not-allowed' : 'pointer', opacity: opts?.disabled ? 0.6 : 1,
      textDecoration: 'none', whiteSpace: 'nowrap', lineHeight: '18px',
    }
    if (opts?.href) {
      return <a href={opts.href} target="_blank" rel="noopener noreferrer" style={style}>{text}</a>
    }
    return <button type="button" onClick={onClick} disabled={opts?.disabled} style={style}>{text}</button>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
      {/* Row 1: Status badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {badge(label, `${color}18`, color)}
        {payLabel && badge(`Payment: ${payLabel}`, '#f3f4f6', '#6b7280')}
        {(localOfferSentAt || offerSentAt) && badge(`Offer sent ${new Date(localOfferSentAt || offerSentAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, '#f0fdf4', '#16A34A')}
        {(localUpdateSentAt || lastUpdateSentAt) && badge(`Update sent ${new Date(localUpdateSentAt || lastUpdateSentAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, '#eff6ff', '#1D4ED8')}
        {totalPaid > 0 && balanceDue > 0.01 && badge(`Additional payment: ${Math.round(balanceDue)} ${bookingCurrency || 'EUR'}`, '#FEF3C7', '#D97706')}
        {totalPaid > 0 && balanceDue < -0.01 && badge(`Refund available: ${Math.round(Math.abs(balanceDue))} ${bookingCurrency || 'EUR'}`, '#EFF6FF', '#1D4ED8')}
        {totalPaid > 0 && Math.abs(balanceDue) <= 0.01 && badge('Settled', '#f0fdf4', '#16A34A')}
      </div>

      {/* Row 2: URL + actions (only when token exists) */}
      {offerToken && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <input
            type="text" readOnly value={offerUrl}
            style={{
              flex: 1, minWidth: 180, fontSize: 11, padding: '4px 8px',
              border: '1px solid var(--theme-elevation-150, #d1d5db)', borderRadius: 4,
              backgroundColor: 'var(--theme-elevation-50, #f9fafb)',
              color: 'var(--theme-elevation-600, #4b5563)', lineHeight: '18px',
            }}
            onFocus={(e) => e.target.select()}
          />
          {btn(copied ? 'Copied!' : 'Copy', handleCopy)}
          {btn('Open', () => {}, { href: offerUrl })}
          {status === 'confirmed' && !offerSentAt && btn(
            sending ? 'Saving & Sending...' : 'Send Offer',
            handleSend,
            { bg: '#C4975C', fg: '#fff', disabled: sending },
          )}
          {(offerSentAt || status === 'declined' || status === 'cancelled') && !(status === 'confirmed' && !offerSentAt) && btn(
            sending ? 'Saving & Sending...' : 'Send Update',
            handleSend,
            { bg: '#C4975C', fg: '#fff', disabled: sending },
          )}
          {sendMsg && (
            <span style={{ fontSize: 11, color: sendMsg.startsWith('Error') ? '#DC2626' : '#16A34A' }}>
              {sendMsg}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
