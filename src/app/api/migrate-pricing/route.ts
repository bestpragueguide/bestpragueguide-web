import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action = req.headers.get('x-action') || 'diagnose'

  try {
    const payload = await getPayload({ config })
    const db = (payload.db as any).drizzle
    const results: string[] = []

    // Helper to run SQL and log
    async function run(label: string, query: string) {
      try {
        await db.execute(sql.raw(query))
        results.push(`OK: ${label}`)
      } catch (e: any) {
        results.push(`SKIP: ${label} — ${e.message?.slice(0, 200)}`)
      }
    }

    // Helper to query rows
    async function query(q: string): Promise<any[]> {
      const result = await db.execute(sql.raw(q))
      return result.rows || result || []
    }

    if (action === 'diagnose') {
      // ===== DIAGNOSE: Get Payload's expected table names from schema =====
      results.push('=== Payload Schema Table Names ===')
      const tables = (payload.db as any).tables
      if (tables) {
        const tableNames = Object.keys(tables).sort()
        for (const name of tableNames) {
          const tableObj = tables[name]
          const pgName = tableObj?.[Symbol.for('drizzle:Name')] || tableObj?._.name || name
          results.push(`  schema: ${name} → pg: ${pgName}`)
        }
      } else {
        results.push('  No tables found in payload.db.tables')
      }

      // List actual DB tables
      results.push('=== Actual DB Tables ===')
      const dbTables = await query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
      for (const row of dbTables) {
        results.push(`  ${row.tablename}`)
      }

      // Check column mismatches between Payload schema and actual DB
      results.push('=== Column Comparison for Pricing Tables ===')
      const pricingTables = [
        'tours', 'tours_locales', 'tours_pricing_group_tiers',
        'tours_pricing_guest_categories', 'tours_pricing_guest_categories_locales',
        'tours_pricing_additional_services', 'tours_pricing_additional_services_locales',
        'services', 'services_locales', 'services_guest_category_pricing',
        'services_guest_category_pricing_locales', 'services_group_tier_pricing',
        '_tours_v', '_tours_v_locales',
      ]

      const tables = (payload.db as any).tables
      for (const tableName of pricingTables) {
        const schemaTable = tables?.[tableName]
        if (!schemaTable) continue

        // Get schema columns
        const schemaCols: string[] = []
        for (const [colKey, colObj] of Object.entries(schemaTable)) {
          if (typeof colObj === 'object' && colObj !== null && 'name' in (colObj as any)) {
            schemaCols.push((colObj as any).name)
          }
        }

        // Get actual DB columns
        try {
          const dbCols = await query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = '${tableName}' ORDER BY ordinal_position
          `)
          const dbColNames = dbCols.map((r: any) => r.column_name)

          const missing = schemaCols.filter(c => !dbColNames.includes(c))
          const extra = dbColNames.filter((c: string) => !schemaCols.includes(c))

          if (missing.length > 0 || extra.length > 0) {
            results.push(`  ${tableName}:`)
            if (missing.length) results.push(`    MISSING: ${missing.join(', ')}`)
            if (extra.length) results.push(`    EXTRA: ${extra.join(', ')}`)
          } else {
            results.push(`  ${tableName}: OK (${schemaCols.length} cols)`)
          }
        } catch (e: any) {
          results.push(`  ${tableName}: DB query failed — ${e.message?.slice(0, 100)}`)
        }
      }

      // Check Payload find
      results.push('=== Payload Find Test ===')
      try {
        const tourResult = await payload.find({ collection: 'tours', limit: 1 })
        results.push(`OK: ${tourResult.totalDocs} tours, first: ${tourResult.docs[0]?.title || 'none'}`)
      } catch (e: any) {
        const msg = e.message || ''
        // Get the middle of the error (where the PG error usually is)
        results.push(`FAIL (800-1600): ${msg.slice(800, 1600)}`)
      }

      try {
        const svcResult = await payload.find({ collection: 'services', limit: 1 })
        results.push(`OK: ${svcResult.totalDocs} services`)
      } catch (e: any) {
        results.push(`FAIL services: ${e.message?.slice(-500)}`)
      }
    }

    if (action === 'fix-tables') {
      // ===== FIX: Rename wrongly-named tables to match Payload's expected names =====
      // First, get what Payload expects
      const expectedTables: Record<string, string> = {}
      const tables = (payload.db as any).tables
      if (tables) {
        for (const [key, tableObj] of Object.entries(tables)) {
          const pgName = (tableObj as any)?.[Symbol.for('drizzle:Name')] || (tableObj as any)?._.name || key
          expectedTables[key] = pgName
        }
      }

      // List expected tables that contain 'pricing' or 'services'
      results.push('=== Expected pricing/services tables ===')
      for (const [key, pgName] of Object.entries(expectedTables)) {
        if (pgName.includes('pricing') || pgName.includes('services')) {
          results.push(`  ${key} → ${pgName}`)
        }
      }

      // Get actual tables
      const dbTables = await query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
      const actualTableNames = new Set(dbTables.map((r: any) => r.tablename))

      // Find mismatches and rename
      results.push('=== Fixing table names ===')

      // Known potential renames (snake_case → what Payload expects)
      const renameMap: Record<string, string> = {}

      // Build rename map from expected tables
      for (const [, pgName] of Object.entries(expectedTables)) {
        if (!pgName.includes('pricing') && !pgName.includes('services')) continue
        if (actualTableNames.has(pgName)) {
          results.push(`  EXISTS: ${pgName}`)
          continue
        }

        // Try to find a snake_case equivalent
        const snakeVersion = pgName.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
        if (actualTableNames.has(snakeVersion)) {
          renameMap[snakeVersion] = pgName
        } else {
          results.push(`  MISSING: ${pgName} (no snake_case equivalent ${snakeVersion} found)`)
        }
      }

      // Execute renames
      for (const [from, to] of Object.entries(renameMap)) {
        await run(`Rename ${from} → ${to}`, `ALTER TABLE "${from}" RENAME TO "${to}"`)
      }

      // After renames, check if any tables are still missing and need creation
      const dbTablesAfter = await query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
      const actualAfter = new Set(dbTablesAfter.map((r: any) => r.tablename))

      results.push('=== Still missing after renames ===')
      for (const [, pgName] of Object.entries(expectedTables)) {
        if (!pgName.includes('pricing') && !pgName.includes('services')) continue
        if (!actualAfter.has(pgName)) {
          results.push(`  STILL MISSING: ${pgName}`)
        }
      }

      // Test Payload find after fix
      results.push('=== Payload Find Test After Fix ===')
      try {
        const tourResult = await payload.find({ collection: 'tours', limit: 1 })
        results.push(`OK: ${tourResult.totalDocs} tours, first: ${tourResult.docs[0]?.title || 'none'}`)
      } catch (e: any) {
        results.push(`FAIL: ${e.message?.slice(0, 500)}`)
      }
    }

    if (action === 'create-missing') {
      // ===== CREATE: Drop wrongly-named tables and create with Payload's expected names =====
      // Get what Payload expects
      const expectedTables: Record<string, string> = {}
      const tables = (payload.db as any).tables
      if (tables) {
        for (const [key, tableObj] of Object.entries(tables)) {
          const pgName = (tableObj as any)?.[Symbol.for('drizzle:Name')] || (tableObj as any)?._.name || key
          expectedTables[key] = pgName
        }
      }

      // Log all pricing/services expected tables
      results.push('=== Expected tables (pricing/services) ===')
      for (const [key, pgName] of Object.entries(expectedTables)) {
        if (pgName.includes('pricing') || pgName.includes('services')) {
          results.push(`  ${key} → ${pgName}`)
        }
      }

      // Get actual tables
      const dbTables = await query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
      const actualTableNames = new Set(dbTables.map((r: any) => r.tablename))

      // Drop ALL tables that are wrong and should not exist
      const wrongTables = [
        'tours_pricing_group_tiers',
        'tours_pricing_guest_categories_locales',
        'tours_pricing_guest_categories',
        'tours_pricing_additional_services_locales',
        'tours_pricing_additional_services',
        '_tours_v_version_pricing_group_tiers',
        '_tours_v_version_pricing_guest_categories_locales',
        '_tours_v_version_pricing_guest_categories',
        '_tours_v_version_pricing_additional_services_locales',
        '_tours_v_version_pricing_additional_services',
        'services_guest_category_pricing_locales',
        'services_guest_category_pricing',
        'services_group_tier_pricing',
      ]

      results.push('=== Dropping wrongly-named tables ===')
      for (const t of wrongTables) {
        if (actualTableNames.has(t)) {
          await run(`Drop ${t}`, `DROP TABLE IF EXISTS "${t}" CASCADE`)
        }
      }

      // Now use pushDevSchema to create correct tables
      results.push('=== Attempting pushDevSchema ===')
      try {
        // Access the push function from Payload's DB adapter
        const dbAdapter = payload.db as any
        if (dbAdapter.push) {
          await dbAdapter.push({ force: true })
          results.push('OK: pushDevSchema completed')
        } else {
          results.push('SKIP: No push function on db adapter')
        }
      } catch (e: any) {
        results.push(`FAIL pushDevSchema: ${e.message?.slice(0, 300)}`)
      }

      // Check final state
      const dbTablesAfter = await query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
      const actualAfter = new Set(dbTablesAfter.map((r: any) => r.tablename))

      results.push('=== Final state of pricing/services tables ===')
      for (const [, pgName] of Object.entries(expectedTables)) {
        if (!pgName.includes('pricing') && !pgName.includes('services')) continue
        results.push(`  ${pgName}: ${actualAfter.has(pgName) ? 'EXISTS' : 'MISSING'}`)
      }

      // Test Payload find
      results.push('=== Payload Find Test ===')
      try {
        const tourResult = await payload.find({ collection: 'tours', limit: 1 })
        results.push(`OK: ${tourResult.totalDocs} tours, first: ${tourResult.docs[0]?.title || 'none'}`)
      } catch (e: any) {
        results.push(`FAIL: ${e.message?.slice(0, 500)}`)
      }
    }

    if (action === 'manual-create') {
      // ===== MANUAL CREATE: Create tables with exact names from Payload schema =====
      // First get exact expected names from Payload
      const expectedPG: string[] = []
      const tables = (payload.db as any).tables
      if (tables) {
        for (const [, tableObj] of Object.entries(tables)) {
          const pgName = (tableObj as any)?.[Symbol.for('drizzle:Name')] || (tableObj as any)?._.name
          if (pgName && (pgName.includes('pricing') || (pgName.includes('services') && !pgName.includes('_rels')))) {
            expectedPG.push(pgName)
          }
        }
      }
      results.push(`Expected tables: ${JSON.stringify(expectedPG.sort())}`)

      // Drop wrong tables first
      const wrongTables = [
        'tours_pricing_group_tiers',
        'tours_pricing_guest_categories_locales',
        'tours_pricing_guest_categories',
        'tours_pricing_additional_services_locales',
        'tours_pricing_additional_services',
        '_tours_v_version_pricing_group_tiers',
        '_tours_v_version_pricing_guest_categories_locales',
        '_tours_v_version_pricing_guest_categories',
        '_tours_v_version_pricing_additional_services_locales',
        '_tours_v_version_pricing_additional_services',
        'services_guest_category_pricing_locales',
        'services_guest_category_pricing',
        'services_group_tier_pricing',
      ]

      for (const t of wrongTables) {
        await run(`Drop ${t}`, `DROP TABLE IF EXISTS "${t}" CASCADE`)
      }

      // Now create with the EXACT names from Payload's schema
      // We need to check what names Payload actually uses
      // The table names should match what Payload's Drizzle adapter generates
      // Based on Payload 3.x convention: array tables use the exact field path

      // For now, just report what names Payload expects so we can create them correctly
      results.push('=== Payload schema introspection ===')
      if (tables) {
        for (const [key, tableObj] of Object.entries(tables)) {
          const obj = tableObj as any
          const pgName = obj?.[Symbol.for('drizzle:Name')] || obj?._.name || key
          if (pgName.includes('pricing') || (pgName.includes('services') && !pgName.includes('_rels'))) {
            // Try to get column names
            const cols: string[] = []
            for (const [colKey, colObj] of Object.entries(obj)) {
              if (colKey.startsWith('_') || colKey === Symbol.for('drizzle:Name') as any) continue
              const colPgName = (colObj as any)?.name
              if (colPgName) cols.push(`${colKey}→${colPgName}`)
            }
            results.push(`  TABLE ${pgName}: ${cols.join(', ')}`)
          }
        }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
