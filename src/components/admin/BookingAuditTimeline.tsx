'use client'

import React, { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

interface AuditEntry {
  id: number
  eventType: string
  actorType: string
  actorName: string
  description: string
  ipAddress: string
  createdAt: string
}

const eventIcons: Record<string, string> = {
  booking_created: '\u{1F4CB}',
  status_change: '\u{1F504}',
  field_update: '\u{270F}\u{FE0F}',
  email_sent: '\u{1F4E7}',
  email_failed: '\u{274C}',
  offer_sent: '\u{1F4E8}',
  checkout_created: '\u{1F4B3}',
  payment_success: '\u{2705}',
  payment_failed: '\u{274C}',
  webhook_received: '\u{1F514}',
  page_view: '\u{1F441}\u{FE0F}',
  page_view_return: '\u{1F501}',
  rate_limited: '\u{1F6AB}',
  n8n_webhook: '\u{26A1}',
  note: '\u{1F4DD}',
}

export function BookingAuditTimeline() {
  const { id } = useDocumentInfo()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/booking-audit-log?where[booking][equals]=${id}&sort=-createdAt&limit=50&depth=0`)
      .then(r => r.json())
      .then(data => setEntries(data.docs || []))
      .catch(() => {})
  }, [id])

  if (!id || entries.length === 0) return null

  const display = expanded ? entries : entries.slice(0, 5)

  return (
    <div style={{ marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          Audit Log ({entries.length}{entries.length >= 50 ? '+' : ''})
        </span>
        <a
          href={`/admin/collections/booking-audit-log?where[booking][equals]=${id}`}
          style={{ fontSize: 12, color: '#C4975C', textDecoration: 'none' }}
        >
          View All &rarr;
        </a>
      </div>
      <div style={{ maxHeight: expanded ? 600 : 300, overflowY: 'auto' }}>
        {display.map((entry) => (
          <div
            key={entry.id}
            style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>
                {eventIcons[entry.eventType] || '\u2022'}{' '}
                <strong>{entry.eventType.replace(/_/g, ' ')}</strong>
              </span>
              <span style={{ color: '#9ca3af', fontSize: 11 }}>
                {new Date(entry.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={{ color: '#4b5563' }}>{entry.description}</div>
            <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 1 }}>
              {entry.actorName || entry.actorType}
              {entry.ipAddress && entry.ipAddress !== 'unknown' ? ` \u00B7 ${entry.ipAddress}` : ''}
            </div>
          </div>
        ))}
      </div>
      {entries.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          type="button"
          style={{
            width: '100%', padding: 8, fontSize: 12, border: 'none',
            background: '#f9fafb', cursor: 'pointer', color: '#C4975C',
          }}
        >
          {expanded ? 'Show less' : `Show all ${entries.length} events`}
        </button>
      )}
    </div>
  )
}
