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

    // Drop incorrectly-named camelCase tables
    await drizzle.execute(sql`DROP TABLE IF EXISTS "tours_preferredTimes"`)
    await drizzle.execute(sql`DROP TABLE IF EXISTS "_tours_v_version_preferredTimes"`)
    results.push('Dropped camelCase tables')

    // Payload uses snake_case for all sub-tables
    await drizzle.execute(sql`
      CREATE TABLE IF NOT EXISTS tours_preferred_times (
        id        varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id integer REFERENCES tours(id) ON DELETE CASCADE,
        value     varchar(10),
        "order"   integer
      )
    `)
    results.push('Created tours_preferred_times')

    await drizzle.execute(sql`
      CREATE TABLE IF NOT EXISTS _tours_v_version_preferred_times (
        id         varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        _parent_id integer REFERENCES _tours_v(id) ON DELETE CASCADE,
        value      varchar(10),
        "order"    integer
      )
    `)
    results.push('Created _tours_v_version_preferred_times')

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

    const result = await drizzle.execute(sql`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND (tablename LIKE 'tours%' OR tablename LIKE '_tours%')
      ORDER BY tablename
    `)

    return NextResponse.json({ tables: result.rows || result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
