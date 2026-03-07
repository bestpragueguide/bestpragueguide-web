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

    async function run(label: string, query: string) {
      try {
        await db.execute(sql.raw(query))
        results.push(`OK: ${label}`)
      } catch (e: any) {
        results.push(`SKIP: ${label} — ${e.message?.slice(0, 500)}`)
      }
    }

    // Diagnostic: check current id column types
    const diagResult = await db.execute(sql.raw(`
      SELECT table_name, column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE column_name = 'id'
      AND table_name IN (
        'tours_pricing_group_tiers', 'tours_pricing_guest_categories',
        'tours_pricing_additional_services', 'services_group_tier_pricing',
        'services_guest_category_pricing'
      )
      ORDER BY table_name
    `))
    results.push(`DIAG: ${JSON.stringify(diagResult.rows)}`)

    // Check all constraints on failing tables
    const constraintResult = await db.execute(sql.raw(`
      SELECT conname, conrelid::regclass, contype, confrelid::regclass
      FROM pg_constraint
      WHERE conrelid::regclass::text IN (
        'tours_pricing_guest_categories', 'tours_pricing_additional_services',
        'services_guest_category_pricing'
      )
      ORDER BY conrelid::regclass::text, conname
    `))
    results.push(`CONSTRAINTS: ${JSON.stringify(constraintResult.rows)}`)

    // Array tables that need id changed from serial/integer to varchar.
    // Payload 3.x generates string ObjectIds for array row IDs.
    // Each entry: [arrayTable, localesTable or null]
    const arrayTablesWithLocales: [string, string | null][] = [
      ['tours_pricing_group_tiers', null],
      ['tours_pricing_guest_categories', 'tours_pricing_guest_categories_locales'],
      ['tours_pricing_additional_services', 'tours_pricing_additional_services_locales'],
      ['services_group_tier_pricing', null],
      ['services_guest_category_pricing', 'services_guest_category_pricing_locales'],
    ]

    for (const [table, localesTable] of arrayTablesWithLocales) {
      // 1. Drop FK on locales table first (if exists) so we can change parent type
      if (localesTable) {
        await run(
          `Drop FK on ${localesTable}._parent_id`,
          `ALTER TABLE ${localesTable} DROP CONSTRAINT IF EXISTS ${localesTable}_parent_id_fk`
        )
      }

      // 2. Drop the default (serial sequence) on array table id
      await run(`Drop default on ${table}.id`, `ALTER TABLE ${table} ALTER COLUMN id DROP DEFAULT`)

      // 3. Convert array table id from integer to varchar
      await run(
        `Change ${table}.id to varchar`,
        `ALTER TABLE ${table} ALTER COLUMN id TYPE character varying USING id::character varying`
      )

      // 4. Convert locales table _parent_id from integer to varchar and re-add FK
      if (localesTable) {
        await run(
          `Change ${localesTable}._parent_id to varchar`,
          `ALTER TABLE ${localesTable} ALTER COLUMN _parent_id TYPE character varying USING _parent_id::character varying`
        )
        await run(
          `Re-add FK on ${localesTable}._parent_id`,
          `ALTER TABLE ${localesTable} ADD CONSTRAINT ${localesTable}_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES ${table}(id) ON DELETE CASCADE`
        )
      }

      // 5. Drop orphaned sequence
      await run(`Drop sequence ${table}_id_seq`, `DROP SEQUENCE IF EXISTS ${table}_id_seq`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
