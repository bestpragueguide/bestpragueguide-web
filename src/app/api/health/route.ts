import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    // Lightweight DB check — find 1 doc, select nothing
    await payload.find({ collection: 'tours', limit: 1, depth: 0 })
    return NextResponse.json({
      status: 'ok',
      ts: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[health] DB check failed:', err)
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
