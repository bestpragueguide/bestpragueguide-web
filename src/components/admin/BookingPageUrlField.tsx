'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'

export function BookingPageUrlField() {
  const { value: offerToken } = useField<string>({ path: 'offerToken' })
  const { value: customerLanguage } = useField<string>({ path: 'customerLanguage' })
  const [copied, setCopied] = useState(false)

  if (!offerToken) return null

  const locale = customerLanguage || 'en'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const offerUrl = `${baseUrl}/${locale}/booking/${offerToken}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(offerUrl)
    } catch {
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

  return (
    <div style={{ marginBottom: 16 }}>
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
  )
}
