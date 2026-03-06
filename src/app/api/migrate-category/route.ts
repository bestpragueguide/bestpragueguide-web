import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const tours = await payload.find({
      collection: 'tours',
      where: { category: { equals: 'from-prague' } },
      limit: 100,
    })

    const updated: number[] = []
    for (const tour of tours.docs) {
      await payload.update({
        collection: 'tours',
        id: tour.id,
        data: { category: 'day-trips-from-prague' },
      })
      updated.push(tour.id as number)
    }

    return NextResponse.json({ success: true, updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
