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
    const body = await req.json() as {
      assignments: Array<{ tourSlug: string; mediaId: number }>
    }

    const results: Array<{ tourSlug: string; success: boolean; error?: string }> = []

    for (const { tourSlug, mediaId } of body.assignments) {
      try {
        // Find the tour by slug
        const tourResult = await payload.find({
          collection: 'tours',
          where: { slug: { equals: tourSlug } },
          limit: 1,
          draft: true,
        })

        if (tourResult.docs.length === 0) {
          results.push({ tourSlug, success: false, error: 'Tour not found' })
          continue
        }

        const tour = tourResult.docs[0]

        // Update tour with hero image
        await payload.update({
          collection: 'tours',
          id: tour.id,
          data: {
            heroImage: mediaId,
          } as any,
        })

        results.push({ tourSlug, success: true })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        results.push({ tourSlug, success: false, error: message })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
