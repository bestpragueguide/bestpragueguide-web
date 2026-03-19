import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const MEDIA_DIR = process.env.MEDIA_DIR || '/app/media'

const sizes = [
  { name: 'thumbnail', width: 400, height: 300, quality: 85 },
  { name: 'card', width: 640, height: 430, quality: 90 },
  { name: 'mobileCard', width: 480, height: 480, quality: 90 },
  { name: 'hero', width: 1920, height: 1080, quality: 92 },
  { name: 'mobileHero', width: 800, height: 600, quality: 90 },
  { name: 'og', width: 1200, height: 630, quality: 92 },
]

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const results: string[] = []
    let processed = 0
    let regenerated = 0

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
        const filename = (doc as any).filename as string | undefined
        if (!filename) continue
        processed++

        const mimeType = (doc as any).mimeType as string || ''
        if (!mimeType.startsWith('image/')) continue

        const srcPath = path.join(MEDIA_DIR, filename)
        try {
          await fs.access(srcPath)
        } catch {
          results.push(`SKIP: ${filename} — source file missing`)
          continue
        }

        // Get focal point
        const focalX = ((doc as any).focalX ?? 50) / 100
        const focalY = ((doc as any).focalY ?? 50) / 100

        let fileRegenerated = 0
        for (const size of sizes) {
          const ext = path.extname(filename)
          const base = path.basename(filename, ext)
          const sizeFilename = `${base}${ext}-${size.width}x${size.height}${ext.toLowerCase() === '.png' ? '.png' : '.jpg'}`
          const outPath = path.join(MEDIA_DIR, sizeFilename)

          try {
            const img = sharp(srcPath)
            const metadata = await img.metadata()
            const srcW = metadata.width || size.width
            const srcH = metadata.height || size.height

            // Calculate crop region based on focal point
            const targetAspect = size.width / size.height
            const srcAspect = srcW / srcH
            let cropW: number, cropH: number, cropX: number, cropY: number

            if (srcAspect > targetAspect) {
              cropH = srcH
              cropW = Math.round(srcH * targetAspect)
              cropX = Math.round((srcW - cropW) * focalX)
              cropY = 0
            } else {
              cropW = srcW
              cropH = Math.round(srcW / targetAspect)
              cropX = 0
              cropY = Math.round((srcH - cropH) * focalY)
            }
            cropX = Math.max(0, Math.min(cropX, srcW - cropW))
            cropY = Math.max(0, Math.min(cropY, srcH - cropH))

            await sharp(srcPath)
              .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
              .resize(size.width, size.height, {
                kernel: sharp.kernel.lanczos3,
                withoutEnlargement: true,
              })
              .jpeg({ quality: size.quality, mozjpeg: true })
              .toFile(outPath)

            fileRegenerated++
          } catch (err) {
            results.push(`FAIL: ${sizeFilename} — ${String(err).slice(0, 80)}`)
          }
        }

        if (fileRegenerated > 0) {
          regenerated++
          if (regenerated <= 10) {
            results.push(`OK: ${filename} — ${fileRegenerated} sizes regenerated`)
          }
        }
      }

      hasMore = media.hasNextPage
      page++
    }

    return NextResponse.json({
      success: true,
      processed,
      regenerated,
      message: `Regenerated ${regenerated} images with Lanczos3 + mozjpeg quality`,
      results: results.slice(0, 50),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
