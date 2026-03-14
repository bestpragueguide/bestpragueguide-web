import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), 'media')

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const results: Array<{ filename: string; size: number }> = []
    const errors: Array<{ filename: string; error: string }> = []
    let skipped = 0

    await mkdir(MEDIA_DIR, { recursive: true })

    const entries = Array.from(formData.entries())
    for (const [, value] of entries) {
      if (!(value instanceof File)) continue

      const filename = value.name
      const destPath = path.join(MEDIA_DIR, filename)

      if (existsSync(destPath)) {
        skipped++
        continue
      }

      try {
        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        await writeFile(destPath, buffer)
        results.push({ filename, size: buffer.length })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        errors.push({ filename, error: message })
      }
    }

    return NextResponse.json({
      success: true,
      restored: results.length,
      skipped,
      errors: errors.length,
      details: { restored: results, errors },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { readdirSync } = await import('fs')
  try {
    const files = readdirSync(MEDIA_DIR)
    return NextResponse.json({ mediaDir: MEDIA_DIR, fileCount: files.length })
  } catch {
    return NextResponse.json({ mediaDir: MEDIA_DIR, fileCount: 0, error: 'Directory not found' })
  }
}
