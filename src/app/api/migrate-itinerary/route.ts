import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

function parseTime(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  return parseInt(match[1]) * 60 + parseInt(match[2])
}

function formatRelative(diffMinutes: number): string {
  if (diffMinutes === 0) return 'Start'
  const hours = Math.floor(diffMinutes / 60)
  const mins = diffMinutes % 60
  if (hours === 0) return `+${mins} min`
  if (mins === 0) return `+${hours}h`
  return `+${hours}h ${mins}min`
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const results: Array<{ id: number; title: string; locale: string; changes: string[] }> = []

  for (const locale of ['en', 'ru']) {
    const { docs: tours } = await payload.find({
      collection: 'tours',
      locale: locale as 'en' | 'ru',
      limit: 100,
      draft: true,
    })

    for (const tour of tours) {
      const itinerary = (tour as any).itinerary as Array<{
        id?: string
        time?: string | null
        title: string
        description?: string | null
        location?: string | null
      }> | undefined

      if (!itinerary || itinerary.length === 0) continue

      // Check if first stop has an absolute time (HH:MM format)
      const firstTime = itinerary[0]?.time
      if (!firstTime || !parseTime(firstTime)) continue

      const baseMinutes = parseTime(firstTime)!
      const changes: string[] = []
      let changed = false

      const updatedItinerary = itinerary.map((stop) => {
        const absMinutes = stop.time ? parseTime(stop.time) : null
        if (absMinutes !== null) {
          const relative = formatRelative(absMinutes - baseMinutes)
          if (relative !== stop.time) {
            changes.push(`${stop.time} → ${relative} (${stop.title})`)
            changed = true
          }
          return { ...stop, time: relative }
        }
        return stop
      })

      if (changed) {
        await payload.update({
          collection: 'tours',
          id: tour.id,
          locale: locale as 'en' | 'ru',
          data: { itinerary: updatedItinerary } as any,
        })
        results.push({
          id: tour.id as number,
          title: (tour as any).title || 'untitled',
          locale,
          changes,
        })
      }
    }
  }

  return NextResponse.json({ migrated: results.length, results })
}
