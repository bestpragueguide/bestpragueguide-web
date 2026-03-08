'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'

interface Tour {
  id: number
  title: string
  status: string
  category: string
  sortOrder: number
}

function SortableItem({ tour, index }: { tour: Tour; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tour.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#fff',
    border: isDragging ? '1px solid #60a5fa' : '1px solid #e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    published: { bg: '#dcfce7', color: '#166534' },
    draft: { bg: '#fef9c3', color: '#854d0e' },
    archived: { bg: '#f3f4f6', color: '#6b7280' },
  }
  const sc = statusColors[tour.status] || statusColors.archived

  return (
    <div ref={setNodeRef} style={style}>
      <button
        {...attributes}
        {...listeners}
        type="button"
        style={{ cursor: 'grab', color: '#9ca3af', padding: '0 4px', background: 'none', border: 'none' }}
        aria-label="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>
      <span style={{ fontSize: 13, color: '#9ca3af', width: 24, textAlign: 'right', fontFamily: 'monospace' }}>
        {index + 1}
      </span>
      <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{tour.title}</span>
      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>
        {tour.status}
      </span>
      <span style={{ fontSize: 12, color: '#9ca3af' }}>{tour.category}</span>
    </div>
  )
}

export function TourOrderView() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState('')
  const [locale, setLocale] = useState<'en' | 'ru'>('en')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const loadTours = useCallback((loc: string) => {
    setLoading(true)
    setMessage('')
    fetch(`/api/tour-order?locale=${loc}`)
      .then((res) => {
        if (res.status === 401) {
          setUnauthorized(true)
          setLoading(false)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data) {
          setTours(data.tours || [])
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadTours(locale)
  }, [locale, loadTours])

  const handleLocaleChange = (newLocale: 'en' | 'ru') => {
    if (dirty) {
      if (!window.confirm('You have unsaved changes. Switch language and discard them?')) {
        return
      }
    }
    setDirty(false)
    setLocale(newLocale)
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setTours((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id)
      const newIndex = prev.findIndex((t) => t.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    setDirty(true)
    setMessage('')
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const order = tours.map((t, i) => ({ id: t.id, sortOrder: i }))
      const res = await fetch('/api/tour-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      })
      const data = await res.json()
      if (data.success) {
        setDirty(false)
        setMessage('Order saved successfully')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to save order')
    }
    setSaving(false)
  }

  if (unauthorized) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Login Required</h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
          Please log in to the admin panel first.
        </p>
        <Link
          href="/admin"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: '#1A1A1A',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          Go to Admin
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tour Order</h1>
            <Link href="/admin" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>
              ← Back to Admin
            </Link>
          </div>
          <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            Drag and drop to reorder tours. This order is used on the website.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <button
              type="button"
              onClick={() => handleLocaleChange('en')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: locale === 'en' ? '#1A1A1A' : '#fff',
                color: locale === 'en' ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange('ru')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderLeft: '1px solid #e5e7eb',
                background: locale === 'ru' ? '#1A1A1A' : '#fff',
                color: locale === 'ru' ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Русский
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            style={{
              padding: '10px 24px',
              borderRadius: 6,
              border: 'none',
              background: dirty ? '#1A1A1A' : '#ccc',
              color: '#fff',
              cursor: dirty ? 'pointer' : 'default',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '10px 16px',
            marginBottom: 16,
            borderRadius: 6,
            background: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
            color: message.startsWith('Error') ? '#991b1b' : '#166534',
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          Loading tours...
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tours.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {tours.map((tour, index) => (
                  <SortableItem key={tour.id} tour={tour} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {tours.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
              No tours found for {locale === 'en' ? 'English' : 'Russian'}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default TourOrderView
