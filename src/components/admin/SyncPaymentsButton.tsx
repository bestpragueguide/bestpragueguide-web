'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function SyncPaymentsButton() {
  const { id } = useDocumentInfo()
  const [syncing, setSyncing] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  if (!id) return null

  const handleSync = async () => {
    setSyncing(true)
    setMsg(null)
    try {
      const res = await fetch('/api/booking/sync-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      })
      const data = (await res.json()) as { success?: boolean; synced?: number; error?: string; message?: string }
      if (data.success) {
        setMsg(data.synced ? `Synced ${data.synced} transactions` : (data.message || 'In sync'))
        if (data.synced) setTimeout(() => window.location.reload(), 1000)
      } else {
        setMsg(`Error: ${data.error}`)
      }
    } catch {
      setMsg('Failed')
    }
    setSyncing(false)
    setTimeout(() => setMsg(null), 5000)
  }

  return (
    <div style={{ margin: '12px 0' }}>
      <button
        type="button"
        onClick={handleSync}
        disabled={syncing}
        style={{
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid var(--theme-elevation-150, #d1d5db)',
          backgroundColor: 'var(--theme-elevation-50, #f9fafb)',
          color: 'var(--theme-elevation-800, #1f2937)',
          cursor: syncing ? 'not-allowed' : 'pointer',
          opacity: syncing ? 0.6 : 1,
        }}
      >
        {syncing ? 'Syncing with Stripe...' : 'Sync Payments from Stripe'}
      </button>
      {msg && (
        <span style={{ marginLeft: 10, fontSize: 12, color: msg.startsWith('Error') ? '#DC2626' : '#16A34A' }}>
          {msg}
        </span>
      )}
    </div>
  )
}
