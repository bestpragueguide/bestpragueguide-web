import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = (payload.db as any).drizzle

    const results: string[] = []

    // Add mobile_hero_image_id to homepage table
    const cols = [
      { table: 'homepage', column: 'mobile_hero_image_id', type: 'integer' },
      { table: 'homepage_rels', column: 'homepage_id', type: 'integer', skip: true },
    ]

    // Check what columns exist on homepage
    const existing = await db.execute(sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'homepage'
      ORDER BY ordinal_position
    `)
    results.push(`homepage columns: ${existing.rows.map((r: any) => r.column_name).join(', ')}`)

    // Add missing column
    try {
      await db.execute(sql`ALTER TABLE homepage ADD COLUMN IF NOT EXISTS mobile_hero_image_id integer`)
      results.push('Added mobile_hero_image_id to homepage')
    } catch (e: any) {
      results.push(`mobile_hero_image_id: ${e.message}`)
    }

    // Check _homepage_v table too (versions)
    try {
      const vExists = await db.execute(sql`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = '_homepage_v'
        ORDER BY ordinal_position
      `)
      results.push(`_homepage_v columns: ${vExists.rows.map((r: any) => r.column_name).join(', ')}`)

      await db.execute(sql`ALTER TABLE _homepage_v ADD COLUMN IF NOT EXISTS version_mobile_hero_image_id integer`)
      results.push('Added version_mobile_hero_image_id to _homepage_v')
    } catch (e: any) {
      results.push(`_homepage_v: ${e.message}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
