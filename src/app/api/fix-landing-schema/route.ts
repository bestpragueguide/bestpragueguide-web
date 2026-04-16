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

    // First, drop and recreate the faq tables with correct structure
    const dropQueries = [
      `DROP TABLE IF EXISTS _pages_v_version_faq_items_locales CASCADE`,
      `DROP TABLE IF EXISTS _pages_v_version_faq_items CASCADE`,
      `DROP TABLE IF EXISTS pages_faq_items_locales CASCADE`,
      `DROP TABLE IF EXISTS pages_faq_items CASCADE`,
    ]

    for (const q of dropQueries) {
      try {
        await db.execute(sql.raw(q))
        results.push(`OK: ${q.substring(0, 50)}...`)
      } catch (err: any) {
        results.push(`SKIP: ${q.substring(0, 40)}... — ${err.message?.substring(0, 60)}`)
      }
    }

    const queries = [
      // Main table
      `ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_image_id integer REFERENCES media(id) ON DELETE SET NULL`,
      `ALTER TABLE pages ADD COLUMN IF NOT EXISTS landing_tour_slugs varchar`,
      `ALTER TABLE pages_locales ADD COLUMN IF NOT EXISTS subtitle varchar`,
      // Version table — must mirror ALL main table columns with version_ prefix
      `ALTER TABLE _pages_v ADD COLUMN IF NOT EXISTS version_hero_image_id integer`,
      `ALTER TABLE _pages_v ADD COLUMN IF NOT EXISTS version_landing_tour_slugs varchar`,
      `ALTER TABLE _pages_v ADD COLUMN IF NOT EXISTS version_template varchar`,
      `ALTER TABLE _pages_v ADD COLUMN IF NOT EXISTS version_seo_og_image_id integer`,
      `ALTER TABLE _pages_v_locales ADD COLUMN IF NOT EXISTS version_subtitle varchar`,
      `ALTER TABLE _pages_v_locales ADD COLUMN IF NOT EXISTS version_last_updated varchar`,
      `ALTER TABLE _pages_v_locales ADD COLUMN IF NOT EXISTS version_seo_meta_title varchar`,
      `ALTER TABLE _pages_v_locales ADD COLUMN IF NOT EXISTS version_seo_meta_description varchar`,
      // FAQ items array table — Payload format for localized array
      `CREATE TABLE IF NOT EXISTS pages_faq_items (
        id varchar NOT NULL PRIMARY KEY,
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES pages(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS pages_faq_items_order_idx ON pages_faq_items (_order)`,
      `CREATE INDEX IF NOT EXISTS pages_faq_items_parent_id_idx ON pages_faq_items (_parent_id)`,
      `CREATE TABLE IF NOT EXISTS pages_faq_items_locales (
        id serial PRIMARY KEY,
        question varchar,
        answer varchar,
        _parent_id varchar NOT NULL REFERENCES pages_faq_items(id) ON DELETE CASCADE,
        _locale _locales NOT NULL,
        UNIQUE(_parent_id, _locale)
      )`,
      // FAQ items version table
      `CREATE TABLE IF NOT EXISTS _pages_v_version_faq_items (
        id serial PRIMARY KEY,
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES _pages_v(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS _pages_v_version_faq_items_order_idx ON _pages_v_version_faq_items (_order)`,
      `CREATE TABLE IF NOT EXISTS _pages_v_version_faq_items_locales (
        id serial PRIMARY KEY,
        question varchar,
        answer varchar,
        _parent_id integer NOT NULL REFERENCES _pages_v_version_faq_items(id) ON DELETE CASCADE,
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
