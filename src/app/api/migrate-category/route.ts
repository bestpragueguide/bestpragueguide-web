import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action = new URL(req.url).searchParams.get('action') || 'inspect'

  try {
    const payload = await getPayload({ config })
    const db = (payload.db as any).drizzle

    if (action === 'inspect') {
      // Check column type and constraints
      const colInfo = await db.execute(sql`
        SELECT column_name, data_type, udt_name, column_default
        FROM information_schema.columns
        WHERE table_name = 'tours' AND column_name = 'category'
      `)

      const constraints = await db.execute(sql`
        SELECT con.conname, con.contype, pg_get_constraintdef(con.oid) as definition
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'tours'
        AND pg_get_constraintdef(con.oid) LIKE '%category%'
      `)

      // Check enum types
      const enums = await db.execute(sql`
        SELECT t.typname, e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE t.typname LIKE '%category%'
        ORDER BY e.enumsortorder
      `)

      // Count tours with from-prague
      const count = await db.execute(sql`
        SELECT category, count(*) as cnt FROM tours GROUP BY category
      `)

      return NextResponse.json({
        column: colInfo.rows || colInfo,
        constraints: constraints.rows || constraints,
        enums: enums.rows || enums,
        categoryCounts: count.rows || count,
      })
    }

    if (action === 'fix-cms') {
      const results: string[] = []

      // Update Navigation global — replace from-prague in all link hrefs
      const navUpdate = await db.execute(sql`
        UPDATE navigation_footer_columns_links
        SET href = REPLACE(href, 'from-prague', 'day-trips-from-prague')
        WHERE href LIKE '%from-prague%'
      `)
      results.push(`nav links updated: ${(navUpdate as any).rowCount ?? 'done'}`)

      const navHeaderUpdate = await db.execute(sql`
        UPDATE navigation_header_links
        SET href = REPLACE(href, 'from-prague', 'day-trips-from-prague')
        WHERE href LIKE '%from-prague%'
      `)
      results.push(`header links updated: ${(navHeaderUpdate as any).rowCount ?? 'done'}`)

      // Update Homepage global — categories array
      const homepageUpdate = await db.execute(sql`
        UPDATE homepage_categories
        SET href = REPLACE(href, 'from-prague', 'day-trips-from-prague')
        WHERE href LIKE '%from-prague%'
      `)
      results.push(`homepage categories updated: ${(homepageUpdate as any).rowCount ?? 'done'}`)

      // Also update localized labels
      const labelUpdates = await db.execute(sql`
        UPDATE homepage_categories_locales
        SET label = 'Day Trips from Prague'
        WHERE label = 'From Prague'
      `)
      results.push(`EN labels updated: ${(labelUpdates as any).rowCount ?? 'done'}`)

      const ruLabelUpdates = await db.execute(sql`
        UPDATE homepage_categories_locales
        SET label = 'Однодневные поездки из Праги'
        WHERE label = 'Из Праги'
      `)
      results.push(`RU labels updated: ${(ruLabelUpdates as any).rowCount ?? 'done'}`)

      // Update nav footer column link labels
      const footerLabelEn = await db.execute(sql`
        UPDATE navigation_footer_columns_links_locales
        SET label = 'Day Trips from Prague'
        WHERE label = 'From Prague'
      `)
      results.push(`footer EN labels: ${(footerLabelEn as any).rowCount ?? 'done'}`)

      const footerLabelRu = await db.execute(sql`
        UPDATE navigation_footer_columns_links_locales
        SET label = 'Однодневные поездки из Праги'
        WHERE label = 'Из Праги'
      `)
      results.push(`footer RU labels: ${(footerLabelRu as any).rowCount ?? 'done'}`)

      return NextResponse.json({ success: true, results })
    }

    if (action === 'fix') {
      const results: string[] = []

      // Check if it's an enum type
      const colInfo = await db.execute(sql`
        SELECT data_type, udt_name FROM information_schema.columns
        WHERE table_name = 'tours' AND column_name = 'category'
      `)
      const udtName = ((colInfo.rows || colInfo)[0] as any)?.udt_name

      if (udtName && udtName !== 'varchar' && udtName !== 'text') {
        // It's a custom enum type — add new value to enum
        try {
          await db.execute(sql.raw(`ALTER TYPE "${udtName}" ADD VALUE IF NOT EXISTS 'day-trips-from-prague'`))
          results.push(`added 'day-trips-from-prague' to enum ${udtName}`)
        } catch (e: any) {
          results.push(`enum add error: ${e.message}`)
        }
      } else {
        // It's varchar — drop CHECK constraints
        const constraints = await db.execute(sql`
          SELECT con.conname
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          WHERE rel.relname = 'tours'
          AND pg_get_constraintdef(con.oid) LIKE '%category%'
        `)
        for (const row of (constraints.rows || constraints)) {
          const name = (row as any).conname
          await db.execute(sql.raw(`ALTER TABLE tours DROP CONSTRAINT IF EXISTS "${name}"`))
          results.push(`dropped constraint: ${name}`)
        }
      }

      // Also handle _tours_v table
      const vColInfo = await db.execute(sql`
        SELECT data_type, udt_name FROM information_schema.columns
        WHERE table_name = '_tours_v' AND column_name = 'version_category'
      `)
      const vUdtName = ((vColInfo.rows || vColInfo)[0] as any)?.udt_name
      if (vUdtName && vUdtName !== 'varchar' && vUdtName !== 'text' && vUdtName !== udtName) {
        try {
          await db.execute(sql.raw(`ALTER TYPE "${vUdtName}" ADD VALUE IF NOT EXISTS 'day-trips-from-prague'`))
          results.push(`added 'day-trips-from-prague' to enum ${vUdtName}`)
        } catch (e: any) {
          results.push(`v enum add error: ${e.message}`)
        }
      }

      // Now update the data
      const updated = await db.execute(sql`
        UPDATE tours SET category = 'day-trips-from-prague' WHERE category = 'from-prague'
      `)
      results.push(`tours updated: ${(updated as any).rowCount ?? 'done'}`)

      const vUpdated = await db.execute(sql`
        UPDATE _tours_v SET version_category = 'day-trips-from-prague' WHERE version_category = 'from-prague'
      `)
      results.push(`versions updated: ${(vUpdated as any).rowCount ?? 'done'}`)

      return NextResponse.json({ success: true, results })
    }

    return NextResponse.json({ error: 'Use ?action=inspect or ?action=fix' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
