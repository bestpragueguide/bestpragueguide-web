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

    // Fetch all published tours via SQL (bypasses Payload validation)
    const toursResult = await drizzle.execute(sql`
      SELECT t.id, t.category, t.subcategory, tl.title
      FROM tours t
      LEFT JOIN tours_locales tl ON tl._parent_id = t.id AND tl._locale = 'en'
      WHERE t._status = 'published'
      ORDER BY t.sort_order
    `)
    const tours = toursResult.rows || toursResult

    // Check existing related tours
    const existingRels = await drizzle.execute(sql`
      SELECT parent_id, tours_id FROM tours_rels WHERE path = 'relatedTours'
    `)
    const relMap = new Map<number, number[]>()
    for (const rel of (existingRels.rows || existingRels)) {
      const pid = rel.parent_id
      if (!relMap.has(pid)) relMap.set(pid, [])
      relMap.get(pid)!.push(rel.tours_id)
    }

    for (const tour of tours) {
      // Skip if already has 3+ related
      const existing = relMap.get(tour.id) || []
      if (existing.length >= 3) {
        results.push(`SKIP: ${tour.title} (has ${existing.length})`)
        continue
      }

      // Score other tours
      const scored = tours
        .filter((t: any) => t.id !== tour.id)
        .map((t: any) => {
          let score = 0
          if (t.category && t.category === tour.category) score += 10
          if (t.subcategory && t.subcategory === tour.subcategory) score += 5
          if (t.category && t.category !== tour.category) score += 1
          return { id: t.id, title: t.title, score }
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3)

      if (scored.length === 0) continue

      // Delete existing rels for this tour
      await drizzle.execute(sql`
        DELETE FROM tours_rels WHERE parent_id = ${tour.id} AND path = 'relatedTours'
      `)

      // Insert new rels
      for (let i = 0; i < scored.length; i++) {
        await drizzle.execute(sql`
          INSERT INTO tours_rels ("order", parent_id, path, tours_id)
          VALUES (${i + 1}, ${tour.id}, 'relatedTours', ${scored[i].id})
        `)
      }

      results.push(`OK: ${tour.title} → ${scored.map((s: any) => s.title).join(', ')}`)
    }

    return NextResponse.json({
      success: true,
      total: tours.length,
      updated: results.filter((r: string) => r.startsWith('OK')).length,
      skipped: results.filter((r: string) => r.startsWith('SKIP')).length,
      results,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
