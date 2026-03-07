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

    const results: string[] = []

    // Helper to run SQL and log
    async function run(label: string, query: string) {
      try {
        await db.execute(sql.raw(query))
        results.push(`OK: ${label}`)
      } catch (e: any) {
        results.push(`SKIP: ${label} — ${e.message?.slice(0, 100)}`)
      }
    }

    // ===== 1. SERVICES COLLECTION =====
    await run('Create services table', `
      CREATE TABLE IF NOT EXISTS services (
        id serial PRIMARY KEY,
        name varchar,
        type varchar NOT NULL,
        description varchar,
        pricing_model varchar NOT NULL,
        require_guest_breakdown boolean DEFAULT true,
        flat_price numeric,
        on_request_threshold numeric,
        updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
        created_at timestamp(3) with time zone DEFAULT now() NOT NULL
      )
    `)

    await run('Create services_locales table', `
      CREATE TABLE IF NOT EXISTS services_locales (
        name varchar,
        description varchar,
        id serial PRIMARY KEY,
        _locale varchar NOT NULL,
        _parent_id integer NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )
    `)

    await run('Create services_guest_category_pricing', `
      CREATE TABLE IF NOT EXISTS services_guest_category_pricing (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        id serial PRIMARY KEY,
        label varchar,
        age_min numeric,
        age_max numeric,
        price numeric,
        is_free boolean DEFAULT false,
        on_request boolean DEFAULT false
      )
    `)

    await run('Create services_guest_category_pricing_locales', `
      CREATE TABLE IF NOT EXISTS services_guest_category_pricing_locales (
        label varchar,
        id serial PRIMARY KEY,
        _locale varchar NOT NULL,
        _parent_id integer NOT NULL REFERENCES services_guest_category_pricing(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )
    `)

    await run('Create services_group_tier_pricing', `
      CREATE TABLE IF NOT EXISTS services_group_tier_pricing (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        id serial PRIMARY KEY,
        min_guests numeric NOT NULL,
        max_guests numeric,
        price numeric,
        on_request boolean DEFAULT false
      )
    `)

    // ===== 2. TOURS PRICING GROUP (columns on tours table) =====
    await run('Add pricing_model to tours', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_model varchar`)
    await run('Add pricing_per_person_price to tours', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_per_person_price numeric`)
    await run('Add pricing_per_person_max_guests to tours', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_per_person_max_guests numeric`)
    await run('Add pricing_flat_rate_price to tours', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_flat_rate_price numeric`)
    await run('Add pricing_flat_rate_max_guests to tours', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_flat_rate_max_guests numeric`)

    // Localized field in pricing group
    await run('Add pricing_on_request_note to tours_locales', `ALTER TABLE tours_locales ADD COLUMN IF NOT EXISTS pricing_on_request_note varchar`)

    // ===== 3. TOURS PRICING ARRAYS =====
    await run('Create tours_pricing_group_tiers', `
      CREATE TABLE IF NOT EXISTS tours_pricing_group_tiers (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
        id serial PRIMARY KEY,
        min_guests numeric NOT NULL,
        max_guests numeric,
        price numeric,
        on_request boolean DEFAULT false
      )
    `)

    await run('Create tours_pricing_guest_categories', `
      CREATE TABLE IF NOT EXISTS tours_pricing_guest_categories (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
        id serial PRIMARY KEY,
        age_min numeric,
        age_max numeric,
        price_modifier numeric,
        is_free boolean DEFAULT false,
        on_request boolean DEFAULT false
      )
    `)

    await run('Create tours_pricing_guest_categories_locales', `
      CREATE TABLE IF NOT EXISTS tours_pricing_guest_categories_locales (
        label varchar,
        id serial PRIMARY KEY,
        _locale varchar NOT NULL,
        _parent_id integer NOT NULL REFERENCES tours_pricing_guest_categories(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )
    `)

    await run('Create tours_pricing_additional_services', `
      CREATE TABLE IF NOT EXISTS tours_pricing_additional_services (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
        id serial PRIMARY KEY,
        override_pricing boolean DEFAULT false
      )
    `)

    await run('Create tours_pricing_additional_services_locales', `
      CREATE TABLE IF NOT EXISTS tours_pricing_additional_services_locales (
        custom_pricing_note varchar,
        id serial PRIMARY KEY,
        _locale varchar NOT NULL,
        _parent_id integer NOT NULL REFERENCES tours_pricing_additional_services(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )
    `)

    // Relationship for service field in additional_services
    await run('Add services_id to tours_rels', `ALTER TABLE tours_rels ADD COLUMN IF NOT EXISTS services_id integer REFERENCES services(id) ON DELETE CASCADE`)

    // ===== 4. VERSION TABLES (tours have versions: { drafts: true }) =====
    await run('Add pricing_model to _tours_v', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_model varchar`)
    await run('Add pricing_per_person_price to _tours_v', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_per_person_price numeric`)
    await run('Add pricing_per_person_max_guests to _tours_v', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_per_person_max_guests numeric`)
    await run('Add pricing_flat_rate_price to _tours_v', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_flat_rate_price numeric`)
    await run('Add pricing_flat_rate_max_guests to _tours_v', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_flat_rate_max_guests numeric`)

    await run('Add pricing_on_request_note to _tours_v_locales', `ALTER TABLE _tours_v_locales ADD COLUMN IF NOT EXISTS version_pricing_on_request_note varchar`)

    // Version array tables
    await run('Create _tours_v_version_pricing_group_tiers', `
      CREATE TABLE IF NOT EXISTS _tours_v_version_pricing_group_tiers (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES _tours_v(id) ON DELETE CASCADE,
        id serial PRIMARY KEY,
        min_guests numeric,
        max_guests numeric,
        price numeric,
        on_request boolean DEFAULT false
      )
    `)

    await run('Create _tours_v_version_pricing_guest_categories', `
      CREATE TABLE IF NOT EXISTS _tours_v_version_pricing_guest_categories (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES _tours_v(id) ON DELETE CASCADE,
        id serial PRIMARY KEY,
        age_min numeric,
        age_max numeric,
        price_modifier numeric,
        is_free boolean DEFAULT false,
        on_request boolean DEFAULT false
      )
    `)

    await run('Create _tours_v_version_pricing_guest_categories_locales', `
      CREATE TABLE IF NOT EXISTS _tours_v_version_pricing_guest_categories_locales (
        label varchar,
        id serial PRIMARY KEY,
        _locale varchar NOT NULL,
        _parent_id integer NOT NULL REFERENCES _tours_v_version_pricing_guest_categories(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )
    `)

    await run('Create _tours_v_version_pricing_additional_services', `
      CREATE TABLE IF NOT EXISTS _tours_v_version_pricing_additional_services (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES _tours_v(id) ON DELETE CASCADE,
        id serial PRIMARY KEY,
        override_pricing boolean DEFAULT false
      )
    `)

    await run('Create _tours_v_version_pricing_additional_services_locales', `
      CREATE TABLE IF NOT EXISTS _tours_v_version_pricing_additional_services_locales (
        custom_pricing_note varchar,
        id serial PRIMARY KEY,
        _locale varchar NOT NULL,
        _parent_id integer NOT NULL REFERENCES _tours_v_version_pricing_additional_services(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )
    `)

    // Version rels for services
    await run('Add services_id to _tours_v_rels', `ALTER TABLE _tours_v_rels ADD COLUMN IF NOT EXISTS services_id integer REFERENCES services(id) ON DELETE CASCADE`)

    // Diagnostic: list tours table columns
    try {
      const cols = await db.execute(sql.raw(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = 'tours' AND column_name LIKE 'pricing%'
        ORDER BY ordinal_position
      `))
      results.push('--- tours pricing columns ---')
      for (const row of cols.rows || cols) {
        results.push(`  ${(row as any).column_name}: ${(row as any).data_type}`)
      }
    } catch (e: any) {
      results.push(`Diagnostic failed: ${e.message?.slice(0, 100)}`)
    }

    // Count tours
    try {
      const countResult = await db.execute(sql.raw(`SELECT count(*) as cnt FROM tours`))
      const cnt = (countResult.rows || countResult)?.[0]
      results.push(`--- tours count: ${(cnt as any)?.cnt}`)
    } catch (e: any) {
      results.push(`Count failed: ${e.message?.slice(0, 200)}`)
    }

    // Try Payload Local API
    try {
      const tourResult = await payload.find({ collection: 'tours', limit: 1 })
      results.push(`--- Payload find tours: ${tourResult.totalDocs} total, first: ${tourResult.docs[0]?.title || 'none'}`)
    } catch (e: any) {
      results.push(`Payload find failed: ${e.message?.slice(0, 1000)}`)
    }

    // Check table list
    try {
      const tables = await db.execute(sql.raw(`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%tour%' ORDER BY tablename
      `))
      results.push('--- tour-related tables ---')
      for (const row of tables.rows || tables) {
        results.push(`  ${(row as any).tablename}`)
      }
    } catch (e: any) {
      results.push(`Tables failed: ${e.message?.slice(0, 100)}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
