import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

const MEDIA_DIR = process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media')

const IMAGE_SIZES = [
  { name: 'thumbnail', width: 400, height: 300 },
  { name: 'card', width: 640, height: 430 },
  { name: 'mobileCard', width: 480, height: 480 },
  { name: 'hero', width: 1920, height: 1080 },
  { name: 'mobileHero', width: 800, height: 600 },
  { name: 'og', width: 1200, height: 630 },
]

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { mediaIds, all, limit: queryLimit } = body as {
      mediaIds?: number[]
      all?: boolean
      limit?: number
    }

    const payload = await getPayload({ config })
    const results: Array<{
      id: number
      filename: string
      generated: string[]
      skipped: string[]
      errors: string[]
    }> = []

    let docs: any[] = []

    if (mediaIds?.length) {
      for (const id of mediaIds) {
        const doc = await payload.findByID({ collection: 'media', id })
        docs.push(doc)
      }
    } else if (all) {
      const maxLimit = queryLimit || 50
      const result = await payload.find({
        collection: 'media',
        limit: maxLimit,
        sort: 'id',
      })
      docs = result.docs
    } else {
      return NextResponse.json({ error: 'Provide mediaIds array or all:true' }, { status: 400 })
    }

    for (const doc of docs) {
      const filename = (doc as any).filename as string
      if (!filename) continue

      const origPath = path.join(MEDIA_DIR, filename)
      const result = { id: doc.id as number, filename, generated: [] as string[], skipped: [] as string[], errors: [] as string[] }

      if (!fs.existsSync(origPath)) {
        result.errors.push(`Original not found: ${origPath}`)
        results.push(result)
        continue
      }

      const ext = path.extname(filename)
      const baseName = path.basename(filename, ext)
      const focalX = ((doc as any).focalX ?? 50) / 100
      const focalY = ((doc as any).focalY ?? 50) / 100

      for (const size of IMAGE_SIZES) {
        const sizedFilename = `${baseName}-${size.width}x${size.height}.jpg`
        const sizedPath = path.join(MEDIA_DIR, sizedFilename)

        if (fs.existsSync(sizedPath)) {
          result.skipped.push(size.name)
          continue
        }

        try {
          const image = sharp(origPath)
          const metadata = await image.metadata()
          const origWidth = metadata.width || size.width
          const origHeight = metadata.height || size.height

          // Calculate focal-point-aware crop
          const targetAspect = size.width / size.height
          const origAspect = origWidth / origHeight

          let cropWidth: number, cropHeight: number, cropLeft: number, cropTop: number

          if (origAspect > targetAspect) {
            // Wider than target — crop sides
            cropHeight = origHeight
            cropWidth = Math.round(origHeight * targetAspect)
            cropLeft = Math.round((origWidth - cropWidth) * focalX)
            cropTop = 0
          } else {
            // Taller than target — crop top/bottom
            cropWidth = origWidth
            cropHeight = Math.round(origWidth / targetAspect)
            cropLeft = 0
            cropTop = Math.round((origHeight - cropHeight) * focalY)
          }

          // Clamp values
          cropLeft = Math.max(0, Math.min(cropLeft, origWidth - cropWidth))
          cropTop = Math.max(0, Math.min(cropTop, origHeight - cropHeight))

          await sharp(origPath)
            .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
            .resize(size.width, size.height)
            .jpeg({ quality: 80 })
            .toFile(sizedPath)

          result.generated.push(size.name)
        } catch (e: any) {
          result.errors.push(`${size.name}: ${e.message}`)
        }
      }

      results.push(result)
    }

    const totalGenerated = results.reduce((s, r) => s + r.generated.length, 0)
    const totalSkipped = results.reduce((s, r) => s + r.skipped.length, 0)
    const totalErrors = results.reduce((s, r) => s + r.errors.length, 0)

    return NextResponse.json({
      success: true,
      processed: results.length,
      totalGenerated,
      totalSkipped,
      totalErrors,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
