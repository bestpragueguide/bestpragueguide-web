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

    // Create tours_preferred_times table (select hasMany)
    await drizzle.execute(sql`
      CREATE TABLE IF NOT EXISTS tours_preferred_times (
        id        varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id integer REFERENCES tours(id) ON DELETE CASCADE,
        value     varchar(10),
        "order"   integer
      )
    `)
    results.push('Created tours_preferred_times')

    // Create version table equivalent
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
