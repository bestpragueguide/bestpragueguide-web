import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle
    const results: string[] = []

    // Fetch all published tours with their published locales
    const toursResult = await drizzle.execute(sql`
      SELECT t.id, t.category, t.subcategory,
        tl.title,
        COALESCE(
          (SELECT array_agg(tpl.value) FROM tours_published_locales tpl WHERE tpl.parent_id = t.id),
          ARRAY[]::text[]
        ) as locales
      FROM tours t
      LEFT JOIN tours_locales tl ON tl._parent_id = t.id AND tl._locale = 'en'
      WHERE t._status = 'published'
      ORDER BY t.sort_order
    `)
    const tours = toursResult.rows || toursResult

    // Get RU titles for tours that don't have EN title
    const ruTitles = await drizzle.execute(sql`
      SELECT tl._parent_id as id, tl.title
      FROM tours_locales tl
      WHERE tl._locale = 'ru'
    `)
    const ruTitleMap = new Map<number, string>()
    for (const r of (ruTitles.rows || ruTitles)) {
      ruTitleMap.set(r.id, r.title)
    }

    // Enrich tours with locale info
    const enriched = tours.map((t: any) => ({
      id: t.id,
      title: t.title || ruTitleMap.get(t.id) || `Tour #${t.id}`,
      category: t.category || '',
      subcategory: t.subcategory || '',
      locales: t.locales || [],
      isEn: (t.locales || []).includes('en'),
      isRu: (t.locales || []).includes('ru'),
    }))

    // Clear all existing relatedTours
    await drizzle.execute(sql`DELETE FROM tours_rels WHERE path = 'relatedTours'`)
    // Also clear version rels
    try {
      await drizzle.execute(sql`DELETE FROM _tours_v_rels WHERE path = 'version_relatedTours'`)
    } catch { /* table might not exist */ }

    for (const tour of enriched) {
      // Find candidates in the SAME locale only
      const candidates = enriched.filter((t: any) => {
        if (t.id === tour.id) return false
        // EN tour → only EN candidates
        if (tour.isEn && !t.isEn) return false
        // RU tour → only RU candidates
        if (!tour.isEn && tour.isRu && !t.isRu) return false
        return true
      })

      // Score by relevance
      const scored = candidates
        .map((t: any) => {
          let score = 0
          if (t.category && t.category === tour.category) score += 10
          if (t.subcategory && t.subcategory === tour.subcategory) score += 5
          if (t.category && t.category !== tour.category) score += 1
          return { id: t.id, title: t.title, score }
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3)

      if (scored.length === 0) {
        results.push(`SKIP: ${tour.title} (no candidates in same locale)`)
        continue
      }

      // Insert rels
      for (let i = 0; i < scored.length; i++) {
        await drizzle.execute(sql`
          INSERT INTO tours_rels ("order", parent_id, path, tours_id)
          VALUES (${i + 1}, ${tour.id}, 'relatedTours', ${scored[i].id})
        `)
      }

      const locale = tour.isEn ? 'EN' : 'RU'
      results.push(`OK [${locale}]: ${tour.title} → ${scored.map((s: any) => s.title).join(', ')}`)
    }

    return NextResponse.json({
      success: true,
      total: enriched.length,
      updated: results.filter((r: string) => r.startsWith('OK')).length,
      skipped: results.filter((r: string) => r.startsWith('SKIP')).length,
      results,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
