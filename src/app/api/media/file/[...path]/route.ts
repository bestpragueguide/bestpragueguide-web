import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MEDIA_DIR = process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media')

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params
  const filename = decodeURIComponent(segments.join('/'))

  // Prevent directory traversal
  if (filename.includes('..') || filename.startsWith('/')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const filePath = path.join(MEDIA_DIR, filename)

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(fileBuffer.length),
    },
  })
}
