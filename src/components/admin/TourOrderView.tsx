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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white border rounded-md ${
        isDragging ? 'shadow-lg border-blue-400' : 'border-gray-200'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 px-1"
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
      <span className="text-sm text-gray-400 w-6 text-right font-mono">{index + 1}</span>
      <span className="flex-1 font-medium text-sm">{tour.title}</span>
      <span
        className={`text-xs px-2 py-0.5 rounded ${
          tour.status === 'published'
            ? 'bg-green-100 text-green-700'
            : tour.status === 'draft'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-500'
        }`}
      >
        {tour.status}
      </span>
      <span className="text-xs text-gray-400">{tour.category}</span>
    </div>
  )
}

export function TourOrderView() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    fetch('/api/tour-order')
      .then((res) => res.json())
      .then((data) => {
        setTours(data.tours || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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
    } catch (e) {
      setMessage('Failed to save order')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading tours...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '40px 20px',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tour Order</h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            Drag and drop to reorder tours. This order is used on the website.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          style={{
            padding: '8px 20px',
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

      {message && (
        <div
          style={{
            padding: '8px 16px',
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tours.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tours.map((tour, index) => (
              <SortableItem key={tour.id} tour={tour} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {tours.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
          No tours found
        </p>
      )}
    </div>
  )
}

export default TourOrderView
