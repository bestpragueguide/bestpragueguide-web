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
    const formData = await req.formData()

    const results: Array<{ filename: string; mediaId: number; url: string }> = []
    const errors: Array<{ filename: string; error: string }> = []

    // Process each file in the form data
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      if (!(value instanceof File)) continue

      const alt = formData.get(`${key}_alt`) as string || value.name
      const caption = formData.get(`${key}_caption`) as string || ''

      try {
        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const media = await payload.create({
          collection: 'media',
          data: {
            alt,
            caption,
          },
          file: {
            data: buffer,
            name: value.name,
            mimetype: value.type || 'image/jpeg',
            size: buffer.length,
          },
        })

        results.push({
          filename: value.name,
          mediaId: media.id as number,
          url: (media as any).url || '',
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        errors.push({ filename: value.name, error: message })
      }
    }

    return NextResponse.json({ success: true, uploaded: results, errors })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
