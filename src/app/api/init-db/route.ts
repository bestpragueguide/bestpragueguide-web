import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { pushDevSchema } from '@payloadcms/drizzle'

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db as unknown as Parameters<typeof pushDevSchema>[0]
    await pushDevSchema(db)
    return NextResponse.json({ success: true, message: 'Database schema pushed successfully' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
