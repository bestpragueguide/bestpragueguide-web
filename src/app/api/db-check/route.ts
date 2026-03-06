import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = (payload.db as any).drizzle

    // Check column types for key tables
    const schemaCheck = await db.execute({
      sql: `SELECT table_name, column_name, data_type, udt_name
            FROM information_schema.columns
            WHERE table_name IN ('tours', 'tours_locales', 'tours_faq', 'tours_faq_locales', 'tours_included', 'tours_included_locales', 'tours_excluded', 'tours_excluded_locales', 'tours_gallery', 'reviews', 'reviews_locales', 'blog_posts', 'blog_posts_locales', 'homepage', 'about_page', 'booking_requests', 'contact_messages')
            AND column_name IN ('excerpt', 'body', 'guide_response', 'answer', 'text', 'instructions', 'guide_bio', 'founder_bio', 'team_description', 'special_requests', 'internal_notes', 'message', 'mobile_hero_image_id', 'mobile_image_id', 'object_fit', 'meeting_point_instructions')
            ORDER BY table_name, column_name;`,
    })

    // Try a simple tour query
    let tourError = null
    let tourCount = 0
    try {
      const tours = await payload.find({ collection: 'tours', limit: 1, depth: 0 })
      tourCount = tours.totalDocs
    } catch (e: any) {
      tourError = e.message || String(e)
    }

    return NextResponse.json({
      schema: schemaCheck.rows || schemaCheck,
      tourQuery: { count: tourCount, error: tourError },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
