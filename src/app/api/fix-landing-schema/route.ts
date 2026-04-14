import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = (payload.db as any).drizzle
    const results: string[] = []

    const queries = [
      `ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_image_id integer REFERENCES media(id) ON DELETE SET NULL`,
      `ALTER TABLE pages ADD COLUMN IF NOT EXISTS landing_tour_slugs varchar`,
      `ALTER TABLE pages_locales ADD COLUMN IF NOT EXISTS subtitle varchar`,
      `CREATE TABLE IF NOT EXISTS pages_faq_items (
        id varchar PRIMARY KEY,
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES pages(id) ON DELETE CASCADE
      )`,
      `ALTER TABLE pages_faq_items ADD COLUMN IF NOT EXISTS _locale _locales`,
      `CREATE TABLE IF NOT EXISTS pages_faq_items_locales (
        id serial PRIMARY KEY,
        question varchar,
        answer varchar,
        _parent_id varchar NOT NULL,
        _locale _locales NOT NULL,
        UNIQUE(_parent_id, _locale)
      )`,
    ]

    for (const q of queries) {
      try {
        await db.execute(sql.raw(q))
        results.push(`OK: ${q.substring(0, 60)}...`)
      } catch (err: any) {
        results.push(`ERR: ${q.substring(0, 40)}... — ${err.message?.substring(0, 80)}`)
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
