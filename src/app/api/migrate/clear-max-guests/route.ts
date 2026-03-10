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

    // Clear maxGroupSize from tours
    const r1 = await drizzle.execute(
      sql`UPDATE tours SET max_group_size = NULL WHERE max_group_size IS NOT NULL`,
    )
    results.push(`tours.max_group_size cleared: ${r1.rowCount ?? 0} rows`)

    // Clear maxGuests from groupTiers
    const r2 = await drizzle.execute(
      sql`UPDATE tours_pricing_group_tiers SET max_guests = NULL WHERE max_guests IS NOT NULL`,
    )
    results.push(`tours_pricing_group_tiers.max_guests cleared: ${r2.rowCount ?? 0} rows`)

    // Clear from version tables too
    const r3 = await drizzle.execute(
      sql`UPDATE _tours_v SET version_max_group_size = NULL WHERE version_max_group_size IS NOT NULL`,
    )
    results.push(`_tours_v.version_max_group_size cleared: ${r3.rowCount ?? 0} rows`)

    const r4 = await drizzle.execute(
      sql`UPDATE _tours_v_version_pricing_group_tiers SET max_guests = NULL WHERE max_guests IS NOT NULL`,
    )
    results.push(`_tours_v_version_pricing_group_tiers.max_guests cleared: ${r4.rowCount ?? 0} rows`)

    return NextResponse.json({ ok: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
