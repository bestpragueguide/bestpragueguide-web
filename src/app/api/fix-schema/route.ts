import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    const results: string[] = []

    const queries = [
      // Drop old incorrectly-created tables (wrong column names)
      `DROP TABLE IF EXISTS site_settings_booking_trust_badges_locales`,
      `DROP TABLE IF EXISTS site_settings_booking_trust_badges`,

      // site_settings_booking_trust_badges array table
      `CREATE TABLE IF NOT EXISTS site_settings_booking_trust_badges (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
        id varchar PRIMARY KEY
      )`,
      `CREATE INDEX IF NOT EXISTS site_settings_booking_trust_badges_order_idx ON site_settings_booking_trust_badges (_order)`,
      `CREATE INDEX IF NOT EXISTS site_settings_booking_trust_badges_parent_id_idx ON site_settings_booking_trust_badges (_parent_id)`,

      // site_settings_booking_trust_badges_locales table (text is localized)
      `CREATE TABLE IF NOT EXISTS site_settings_booking_trust_badges_locales (
        text varchar NOT NULL,
        id serial PRIMARY KEY,
        _locale _locales NOT NULL,
        _parent_id varchar NOT NULL REFERENCES site_settings_booking_trust_badges(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )`,

      // tours_rels table for relatedTours hasMany relationship
      `CREATE TABLE IF NOT EXISTS tours_rels (
        id serial PRIMARY KEY,
        "order" integer,
        parent_id integer NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
        path varchar NOT NULL,
        tours_id integer REFERENCES tours(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS tours_rels_order_idx ON tours_rels ("order")`,
      `CREATE INDEX IF NOT EXISTS tours_rels_parent_idx ON tours_rels (parent_id)`,
      `CREATE INDEX IF NOT EXISTS tours_rels_path_idx ON tours_rels (path)`,
      `CREATE INDEX IF NOT EXISTS tours_rels_tours_id_idx ON tours_rels (tours_id)`,

      // _tours_v_rels table for version drafts
      `CREATE TABLE IF NOT EXISTS _tours_v_rels (
        id serial PRIMARY KEY,
        "order" integer,
        parent_id integer NOT NULL REFERENCES _tours_v(id) ON DELETE CASCADE,
        path varchar NOT NULL,
        tours_id integer REFERENCES tours(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS _tours_v_rels_order_idx ON _tours_v_rels ("order")`,
      `CREATE INDEX IF NOT EXISTS _tours_v_rels_parent_idx ON _tours_v_rels (parent_id)`,
      `CREATE INDEX IF NOT EXISTS _tours_v_rels_path_idx ON _tours_v_rels (path)`,
      `CREATE INDEX IF NOT EXISTS _tours_v_rels_tours_id_idx ON _tours_v_rels (tours_id)`,
    ]

    for (const query of queries) {
      try {
        await drizzle.execute(sql.raw(query))
        results.push(`OK: ${query.substring(0, 60)}...`)
      } catch (e: any) {
        results.push(`SKIP: ${e.message?.substring(0, 80)}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
