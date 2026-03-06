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

    // Check column types for key tables
    const schemaCheck = await db.execute(sql`
      SELECT table_name, column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name IN ('tours', 'tours_locales', 'tours_faq', 'tours_faq_locales', 'tours_included', 'tours_included_locales', 'tours_excluded', 'tours_excluded_locales', 'tours_gallery', 'reviews', 'reviews_locales', 'blog_posts', 'blog_posts_locales', 'homepage', 'about_page', 'booking_requests', 'contact_messages')
      AND column_name IN ('excerpt', 'body', 'guide_response', 'answer', 'text', 'instructions', 'guide_bio', 'founder_bio', 'team_description', 'special_requests', 'internal_notes', 'message', 'mobile_hero_image_id', 'mobile_image_id', 'object_fit', 'meeting_point_instructions')
      ORDER BY table_name, column_name
    `)

    // Fix: Add all missing columns
    const action = new URL(req.url).searchParams.get('action')
    if (action === 'fix-all') {
      const alterStatements = [
        // Media: mobileCard + mobileHero size columns
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_card_url varchar`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_card_width numeric`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_card_height numeric`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_card_mime_type varchar`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_card_filesize numeric`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_card_filename varchar`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_hero_url varchar`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_hero_width numeric`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_hero_height numeric`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_hero_mime_type varchar`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_hero_filesize numeric`,
        sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_mobile_hero_filename varchar`,
        // Tours versions: mobile hero image
        sql`ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_mobile_hero_image_id integer`,
        // Tours gallery versions: mobile image + object fit
        sql`ALTER TABLE _tours_v_version_gallery ADD COLUMN IF NOT EXISTS mobile_image_id integer`,
        sql`ALTER TABLE _tours_v_version_gallery ADD COLUMN IF NOT EXISTS object_fit varchar DEFAULT 'cover'`,
      ]
      const results = []
      for (const stmt of alterStatements) {
        try {
          await db.execute(stmt)
          results.push('OK')
        } catch (e: any) {
          results.push(`ERR: ${e.message}`)
        }
      }
      return NextResponse.json({ success: true, results })
    }

    // Test 1: Simple tour query
    let tourError = null
    let tourCount = 0
    try {
      const tours = await payload.find({ collection: 'tours', limit: 1, depth: 0 })
      tourCount = tours.totalDocs
    } catch (e: any) {
      tourError = e.message || String(e)
    }

    // Test 2: Filtered query (same as listing page)
    let filteredError = null
    let filteredCount = 0
    try {
      const filtered = await payload.find({
        collection: 'tours',
        where: {
          status: { equals: 'published' },
          publishedLocales: { in: ['en'] },
        },
        sort: 'sortOrder',
        limit: 50,
        locale: 'en',
      })
      filteredCount = filtered.totalDocs
    } catch (e: any) {
      filteredError = e.message || String(e)
    }

    // Test 3: Tour by slug
    let slugError = null
    let slugFound = false
    try {
      const bySlug = await payload.find({
        collection: 'tours',
        where: { slug: { equals: 'best-of-prague-car-tour' } },
        limit: 1,
        locale: 'en',
      })
      slugFound = bySlug.totalDocs > 0
    } catch (e: any) {
      slugError = e.message || String(e)
    }

    // Test 4: Homepage global fetch
    let homepageError = null
    let guideBioType = null
    try {
      const hp = await payload.findGlobal({ slug: 'homepage', locale: 'en' })
      guideBioType = typeof (hp as any).guideBio
      if (typeof (hp as any).guideBio === 'object') {
        guideBioType = `object: ${JSON.stringify((hp as any).guideBio).substring(0, 200)}`
      } else if (typeof (hp as any).guideBio === 'string') {
        guideBioType = `string: ${((hp as any).guideBio as string).substring(0, 200)}`
      }
    } catch (e: any) {
      homepageError = e.message || String(e)
    }

    // Test 5: Tour excerpt type
    let tourExcerptType = null
    let tourExcerptError = null
    try {
      const t = await payload.find({ collection: 'tours', limit: 1, locale: 'en', where: { status: { equals: 'published' }, publishedLocales: { in: ['en'] } } })
      if (t.docs[0]) {
        const ex = (t.docs[0] as any).excerpt
        tourExcerptType = typeof ex
        if (typeof ex === 'object') tourExcerptType = `object: ${JSON.stringify(ex).substring(0, 200)}`
        if (typeof ex === 'string') tourExcerptType = `string: ${ex.substring(0, 200)}`
      }
    } catch (e: any) {
      tourExcerptError = e.message || String(e)
    }

    return NextResponse.json({
      schema: schemaCheck.rows || schemaCheck,
      tourQuery: { count: tourCount, error: tourError },
      filteredQuery: { count: filteredCount, error: filteredError },
      slugQuery: { found: slugFound, error: slugError },
      homepage: { guideBioType, error: homepageError },
      tourExcerpt: { type: tourExcerptType, error: tourExcerptError },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
