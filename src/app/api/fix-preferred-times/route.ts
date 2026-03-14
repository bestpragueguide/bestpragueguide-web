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

    // Drop any existing tables (both naming variants)
    await drizzle.execute(sql`DROP TABLE IF EXISTS "tours_preferredTimes"`)
    await drizzle.execute(sql`DROP TABLE IF EXISTS "_tours_v_version_preferredTimes"`)
    await drizzle.execute(sql`DROP TABLE IF EXISTS tours_preferred_times`)
    await drizzle.execute(sql`DROP TABLE IF EXISTS _tours_v_version_preferred_times`)
    results.push('Dropped all existing preferred_times tables')

    // Main table: parent_id (no underscore prefix)
    await drizzle.execute(sql`
      CREATE TABLE tours_preferred_times (
        id        varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id integer REFERENCES tours(id) ON DELETE CASCADE,
        value     varchar(10),
        "order"   integer
      )
    `)
    results.push('Created tours_preferred_times (parent_id)')

    // Version table: also parent_id (no underscore) — NOT _parent_id
    await drizzle.execute(sql`
      CREATE TABLE _tours_v_version_preferred_times (
        id        varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id integer REFERENCES _tours_v(id) ON DELETE CASCADE,
        value     varchar(10),
        "order"   integer
      )
    `)
    results.push('Created _tours_v_version_preferred_times (parent_id)')

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    // List tables and their columns for debugging
    const tables = await drizzle.execute(sql`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND (tablename LIKE 'tours%' OR tablename LIKE '_tours%')
      ORDER BY tablename
    `)

    // Get columns for version published_locales (known working reference)
    const refCols = await drizzle.execute(sql`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = '_tours_v_version_published_locales'
      ORDER BY ordinal_position
    `)

    // Get columns for our new tables
    const mainCols = await drizzle.execute(sql`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'tours_preferred_times'
      ORDER BY ordinal_position
    `)

    const versionCols = await drizzle.execute(sql`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = '_tours_v_version_preferred_times'
      ORDER BY ordinal_position
    `)

    return NextResponse.json({
      tables: tables.rows || tables,
      reference_published_locales_columns: refCols.rows || refCols,
      tours_preferred_times_columns: mainCols.rows || mainCols,
      _tours_v_version_preferred_times_columns: versionCols.rows || versionCols,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
