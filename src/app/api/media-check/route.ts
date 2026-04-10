import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const MEDIA_DIR = process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media')

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const mediaId = req.nextUrl.searchParams.get('id')

  try {
    // Check filesystem
    let dirExists = false
    let fileCount = 0
    let sampleFiles: string[] = []

    try {
      dirExists = fs.existsSync(MEDIA_DIR)
      if (dirExists) {
        const files = fs.readdirSync(MEDIA_DIR)
        fileCount = files.length
        sampleFiles = files.slice(0, 20)
      }
    } catch (e: any) {
      return NextResponse.json({ error: `Filesystem error: ${e.message}`, mediaDir: MEDIA_DIR })
    }

    // If specific media ID requested, check that file
    if (mediaId) {
      const payload = await getPayload({ config })
      const doc = await payload.findByID({ collection: 'media', id: parseInt(mediaId) })
      const filename = (doc as any).filename
      const sizes = (doc as any).sizes || {}

      const fileChecks: Record<string, { exists: boolean; path: string }> = {}

      // Check original
      const origPath = path.join(MEDIA_DIR, filename)
      fileChecks['original'] = { exists: fs.existsSync(origPath), path: origPath }

      // Check each size
      for (const [name, sizeData] of Object.entries(sizes)) {
        if (sizeData && (sizeData as any).filename) {
          const sizePath = path.join(MEDIA_DIR, (sizeData as any).filename)
          fileChecks[name] = { exists: fs.existsSync(sizePath), path: sizePath }
        }
      }

      return NextResponse.json({
        mediaDir: MEDIA_DIR,
        dirExists,
        mediaId: parseInt(mediaId),
        filename,
        fileChecks,
      })
    }

    return NextResponse.json({
      mediaDir: MEDIA_DIR,
      dirExists,
      fileCount,
      sampleFiles,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
