import { NextResponse } from 'next/server'

export async function GET() {
  const results: string[] = []

  try {
    const sharp = (await import('sharp')).default
    results.push('sharp: loaded')

    // Check sharp version and platform
    const versions = sharp.versions || {}
    results.push(`versions: ${JSON.stringify(versions)}`)
    results.push(`platform: ${process.platform}/${process.arch}`)

    // Test basic resize
    const buf = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .jpeg()
      .toBuffer()
    results.push(`basic create: OK (${buf.length} bytes)`)

    // Test resize with focalpoint-like crop (extract + resize)
    const src = await sharp({
      create: { width: 2000, height: 1500, channels: 3, background: { r: 0, g: 128, b: 255 } },
    })
      .jpeg()
      .toBuffer()
    results.push(`source buffer: ${src.length} bytes`)

    // Test generating each configured size
    const sizes = [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'card', width: 640, height: 430 },
      { name: 'mobileCard', width: 480, height: 480 },
      { name: 'hero', width: 1920, height: 1080 },
      { name: 'mobileHero', width: 800, height: 600 },
      { name: 'og', width: 1200, height: 630 },
    ]

    for (const size of sizes) {
      try {
        const resized = await sharp(src)
          .resize(size.width, size.height, { fit: 'cover', position: 'centre' })
          .jpeg()
          .toBuffer()
        results.push(`${size.name} (${size.width}x${size.height}): OK (${resized.length} bytes)`)
      } catch (e: any) {
        results.push(`${size.name} (${size.width}x${size.height}): FAIL: ${e.message}`)
      }
    }

    // Test writing to /app/media
    const fs = await import('fs')
    try {
      const testPath = '/app/media/sharp-test.jpg'
      await sharp(src)
        .resize(400, 300, { fit: 'cover' })
        .jpeg()
        .toFile(testPath)
      results.push(`write to /app/media: OK`)
      fs.unlinkSync(testPath)
    } catch (e: any) {
      results.push(`write to /app/media: FAIL: ${e.message}`)
    }

    // Test with focalpoint position
    try {
      const fp = await sharp(src)
        .resize(400, 300, { fit: 'cover', position: sharp.strategy.attention })
        .jpeg()
        .toBuffer()
      results.push(`focalpoint strategy: OK (${fp.length} bytes)`)
    } catch (e: any) {
      results.push(`focalpoint strategy: FAIL: ${e.message}`)
    }

  } catch (e: any) {
    results.push(`FATAL: ${e.message}\n${e.stack?.substring(0, 500)}`)
  }

  return NextResponse.json({ results })
}
