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
    const db = (payload.db as any).drizzle

    const queries = [
      // Main locales table
      `ALTER TABLE tours_locales ADD COLUMN IF NOT EXISTS pricing_guest_categories_heading varchar`,
      // Version locales table
      `ALTER TABLE _tours_v_locales ADD COLUMN IF NOT EXISTS version_pricing_guest_categories_heading varchar`,
    ]

    const results: string[] = []
    for (const sql of queries) {
      try {
        await db.execute({ sql })
        results.push(`OK: ${sql.substring(0, 80)}`)
      } catch (err: any) {
        results.push(`ERR: ${sql.substring(0, 80)} — ${err.message}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
