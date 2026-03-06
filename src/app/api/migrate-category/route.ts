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
    const db = (payload.db as any).drizzle

    // Step 1: Update CHECK constraint on category column to allow new value
    // First drop the old constraint, then add updated one
    const constraints = await db.execute(sql`
      SELECT constraint_name FROM information_schema.check_constraints
      WHERE constraint_name LIKE '%tours_category%'
    `)
    const results: string[] = []

    for (const row of (constraints.rows || constraints)) {
      const name = (row as any).constraint_name
      await db.execute(sql.raw(`ALTER TABLE tours DROP CONSTRAINT IF EXISTS "${name}"`))
      results.push(`dropped: ${name}`)
    }

    // Also drop from versions table
    const vConstraints = await db.execute(sql`
      SELECT constraint_name FROM information_schema.check_constraints
      WHERE constraint_name LIKE '%tours_v_version_category%'
    `)
    for (const row of (vConstraints.rows || vConstraints)) {
      const name = (row as any).constraint_name
      await db.execute(sql.raw(`ALTER TABLE _tours_v DROP CONSTRAINT IF EXISTS "${name}"`))
      results.push(`dropped: ${name}`)
    }

    // Step 2: Update the data
    const updated = await db.execute(sql`
      UPDATE tours SET category = 'day-trips-from-prague' WHERE category = 'from-prague'
    `)
    results.push(`tours updated: ${(updated as any).rowCount || 'done'}`)

    const vUpdated = await db.execute(sql`
      UPDATE _tours_v SET version_category = 'day-trips-from-prague' WHERE version_category = 'from-prague'
    `)
    results.push(`versions updated: ${(vUpdated as any).rowCount || 'done'}`)

    // Step 3: Add new CHECK constraint with updated values
    await db.execute(sql`
      ALTER TABLE tours ADD CONSTRAINT tours_category_check
      CHECK (category IN ('prague-tours', 'day-trips-from-prague'))
    `)
    results.push('added new tours constraint')

    await db.execute(sql`
      ALTER TABLE _tours_v ADD CONSTRAINT tours_v_version_category_check
      CHECK (version_category IN ('prague-tours', 'day-trips-from-prague'))
    `)
    results.push('added new versions constraint')

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
