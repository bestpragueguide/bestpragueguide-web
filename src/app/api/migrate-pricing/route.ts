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

    async function run(label: string, query: string) {
      try {
        await db.execute(sql.raw(query))
        results.push(`OK: ${label}`)
      } catch (e: any) {
        results.push(`SKIP: ${label} — ${e.message?.slice(0, 200)}`)
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

    await run('Create services_locales', `
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

    // ===== 2. TOURS PRICING COLUMNS =====
    await run('Add pricing_model to tours', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_model varchar`)
    await run('Add pricing_per_person_price', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_per_person_price numeric`)
    await run('Add pricing_per_person_max_guests', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_per_person_max_guests numeric`)
    await run('Add pricing_flat_rate_price', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_flat_rate_price numeric`)
    await run('Add pricing_flat_rate_max_guests', `ALTER TABLE tours ADD COLUMN IF NOT EXISTS pricing_flat_rate_max_guests numeric`)
    await run('Add pricing_on_request_note to tours_locales', `ALTER TABLE tours_locales ADD COLUMN IF NOT EXISTS pricing_on_request_note varchar`)

    // ===== 3. TOURS PRICING ARRAY TABLES =====
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
        service_id integer REFERENCES services(id) ON DELETE SET NULL,
        override_pricing boolean DEFAULT false
      )
    `)

    // FIX: Add missing service_id column if table already existed without it
    await run('Add service_id to tours_pricing_additional_services', `
      ALTER TABLE tours_pricing_additional_services
      ADD COLUMN IF NOT EXISTS service_id integer REFERENCES services(id) ON DELETE SET NULL
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

    // ===== 4. VERSION TABLES =====
    await run('Add version_pricing_model to _tours_v', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_model varchar`)
    await run('Add version_pricing_per_person_price', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_per_person_price numeric`)
    await run('Add version_pricing_per_person_max_guests', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_per_person_max_guests numeric`)
    await run('Add version_pricing_flat_rate_price', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_flat_rate_price numeric`)
    await run('Add version_pricing_flat_rate_max_guests', `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_pricing_flat_rate_max_guests numeric`)
    await run('Add version_pricing_on_request_note', `ALTER TABLE _tours_v_locales ADD COLUMN IF NOT EXISTS version_pricing_on_request_note varchar`)

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
        service_id integer REFERENCES services(id) ON DELETE SET NULL,
        override_pricing boolean DEFAULT false
      )
    `)

    // FIX: Add missing service_id column if table already existed without it
    await run('Add service_id to _tours_v_version_pricing_additional_services', `
      ALTER TABLE _tours_v_version_pricing_additional_services
      ADD COLUMN IF NOT EXISTS service_id integer REFERENCES services(id) ON DELETE SET NULL
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

    // ===== 5. FIX: Add services_id to payload system rels tables =====
    await run('Add services_id to payload_locked_documents_rels', `
      ALTER TABLE payload_locked_documents_rels
      ADD COLUMN IF NOT EXISTS services_id integer REFERENCES services(id) ON DELETE CASCADE
    `)

    // ===== 6. FIX: Add missing _uuid column to ALL array tables =====
    // Payload 3.x requires _uuid on array row tables for tracking
    const arrayTables = [
      'tours_pricing_group_tiers',
      'tours_pricing_guest_categories',
      'tours_pricing_additional_services',
      'tours_pricing_guest_categories_locales',
      'tours_pricing_additional_services_locales',
      '_tours_v_version_pricing_group_tiers',
      '_tours_v_version_pricing_guest_categories',
      '_tours_v_version_pricing_additional_services',
      '_tours_v_version_pricing_guest_categories_locales',
      '_tours_v_version_pricing_additional_services_locales',
      'services_guest_category_pricing',
      'services_guest_category_pricing_locales',
      'services_group_tier_pricing',
    ]

    for (const table of arrayTables) {
      await run(`Add _uuid to ${table}`, `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS _uuid varchar`)
    }

    // ===== 7. DATA MIGRATION: Convert groupPrice → GROUP_TIERS =====
    results.push('=== Data Migration ===')

    // Set pricing_model for all tours that have group_price but no pricing_model yet
    await run('Set pricing_model=GROUP_TIERS for legacy tours', `
      UPDATE tours
      SET pricing_model = 'GROUP_TIERS'
      WHERE group_price IS NOT NULL AND (pricing_model IS NULL OR pricing_model = '')
    `)

    // Insert group tier rows for tours that have group_price but no tiers yet
    await run('Create group tier rows from legacy groupPrice', `
      INSERT INTO tours_pricing_group_tiers (_order, _parent_id, min_guests, max_guests, price)
      SELECT 1, t.id, 1, COALESCE(t.max_group_size, 8), t.group_price
      FROM tours t
      WHERE t.group_price IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM tours_pricing_group_tiers gt WHERE gt._parent_id = t.id
        )
    `)

    // Same for version tables
    await run('Set version_pricing_model on _tours_v', `
      UPDATE _tours_v
      SET version_pricing_model = 'GROUP_TIERS'
      WHERE version_group_price IS NOT NULL AND (version_pricing_model IS NULL OR version_pricing_model = '')
    `)

    await run('Create version group tier rows from legacy groupPrice', `
      INSERT INTO _tours_v_version_pricing_group_tiers (_order, _parent_id, min_guests, max_guests, price)
      SELECT 1, v.id, 1, COALESCE(v.version_max_group_size, 8), v.version_group_price
      FROM _tours_v v
      WHERE v.version_group_price IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM _tours_v_version_pricing_group_tiers gt WHERE gt._parent_id = v.id
        )
    `)

    // ===== 8. TEST =====
    results.push('=== Testing Payload find ===')
    try {
      const tourResult = await payload.find({ collection: 'tours', limit: 1 })
      const tour = tourResult.docs[0] as any
      results.push(`OK: ${tourResult.totalDocs} tours found, first: ${tour?.title || 'none'}`)
      if (tour?.pricing?.model) {
        results.push(`  pricing.model: ${tour.pricing.model}`)
        results.push(`  pricing.groupTiers: ${JSON.stringify(tour.pricing.groupTiers)}`)
      } else {
        results.push(`  WARNING: no pricing.model on first tour`)
      }
    } catch (e: any) {
      const msg = e.message || ''
      const pgErrorMatch = msg.match(/error:.*$/im)
      results.push(`FAIL: ${pgErrorMatch?.[0] || msg.slice(-300)}`)
    }

    try {
      const svcResult = await payload.find({ collection: 'services', limit: 1 })
      results.push(`OK: ${svcResult.totalDocs} services found`)
    } catch (e: any) {
      results.push(`FAIL services: ${e.message?.slice(-300)}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
