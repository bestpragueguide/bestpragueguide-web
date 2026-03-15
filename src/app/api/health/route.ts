import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    // Lightweight DB check — find 1 doc, select nothing
    await payload.find({ collection: 'tours', limit: 1, depth: 0 })
    const response = NextResponse.json({
      status: 'ok',
      ts: new Date().toISOString(),
    })
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30')
    return response
  } catch (err) {
    console.error('[health] DB check failed:', err)
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
