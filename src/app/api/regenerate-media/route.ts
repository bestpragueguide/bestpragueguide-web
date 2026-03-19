import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const results: string[] = []

    // Fetch all media documents
    let page = 1
    let hasMore = true

    while (hasMore) {
      const media = await payload.find({
        collection: 'media',
        limit: 20,
        page,
        depth: 0,
      })

      for (const doc of media.docs) {
        try {
          // Re-uploading with the same file triggers size regeneration
          // Use Payload's update to re-process the image
          await payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              // Touch the document to trigger re-processing
              alt: (doc as any).alt || '',
            },
          })
          results.push(`OK: ${(doc as any).filename || doc.id}`)
        } catch (err) {
          results.push(`FAIL: ${(doc as any).filename || doc.id} — ${String(err).slice(0, 100)}`)
        }
      }

      hasMore = media.hasNextPage
      page++
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} media files. Note: image sizes are regenerated on next upload. For existing files, re-upload from Payload admin to apply new quality settings.`,
      processed: results.length,
      results,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
