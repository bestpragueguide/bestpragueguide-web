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

    // Fix main table: for each tier that is NOT the last one in its tour,
    // set max_guests = next tier's min_guests - 1
    const r1 = await drizzle.execute(sql`
      WITH ordered AS (
        SELECT id, _parent_id, _order, min_guests, max_guests,
               LEAD(min_guests) OVER (PARTITION BY _parent_id ORDER BY _order) AS next_min
        FROM tours_pricing_group_tiers
      )
      UPDATE tours_pricing_group_tiers t
      SET max_guests = o.next_min - 1
      FROM ordered o
      WHERE t.id = o.id
        AND o.next_min IS NOT NULL
        AND t.max_guests IS NULL
    `)
    results.push(`tours_pricing_group_tiers fixed: ${r1.rowCount ?? 0} rows`)

    // Fix version table
    const r2 = await drizzle.execute(sql`
      WITH ordered AS (
        SELECT id, _parent_id, _order, min_guests, max_guests,
               LEAD(min_guests) OVER (PARTITION BY _parent_id ORDER BY _order) AS next_min
        FROM _tours_v_version_pricing_group_tiers
      )
      UPDATE _tours_v_version_pricing_group_tiers t
      SET max_guests = o.next_min - 1
      FROM ordered o
      WHERE t.id = o.id
        AND o.next_min IS NOT NULL
        AND t.max_guests IS NULL
    `)
    results.push(`_tours_v_version_pricing_group_tiers fixed: ${r2.rowCount ?? 0} rows`)

    // Verify: show current state of all tiers
    const verify = await drizzle.execute(sql`
      SELECT t._parent_id as tour_id, t._order, t.min_guests, t.max_guests, t.price
      FROM tours_pricing_group_tiers t
      ORDER BY t._parent_id, t._order
    `)

    return NextResponse.json({
      ok: true,
      results,
      tiers: verify.rows,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
