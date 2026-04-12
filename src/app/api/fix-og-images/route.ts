import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET  — audit blog posts and tours missing hero/OG images
 * POST — assign hero images OR delete posts by ID
 *
 * POST body options:
 *   { "action": "delete", "ids": [4, 479] }  — delete specific posts
 *   { "action": "assign" }                    — auto-assign hero images
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    const enPosts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      locale: 'en',
      depth: 0,
    })

    let blogWithHero = 0
    let blogWithoutHero = 0
    const missingHeroPosts: Array<{ id: number; slug: string; title: string }> = []

    for (const post of enPosts.docs) {
      if (post.heroImage) {
        blogWithHero++
      } else {
        blogWithoutHero++
        missingHeroPosts.push({
          id: post.id as number,
          slug: post.slug as string,
          title: (post.title as string || '').substring(0, 60),
        })
      }
    }

    const tours = await payload.find({
      collection: 'tours',
      limit: 0,
      locale: 'en',
      depth: 0,
    })

    let toursWithHero = 0
    let toursWithoutHero = 0

    for (const tour of tours.docs) {
      if (tour.heroImage) toursWithHero++
      else toursWithoutHero++
    }

    const media = await payload.find({
      collection: 'media',
      limit: 0,
      depth: 0,
    })

    return NextResponse.json({
      blog: { total: enPosts.totalDocs, withHero: blogWithHero, withoutHero: blogWithoutHero, missingList: missingHeroPosts },
      tours: { total: tours.totalDocs, withHero: toursWithHero, withoutHero: toursWithoutHero },
      media: { total: media.totalDocs },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const payload = await getPayload({ config })

    if (body.action === 'delete' && Array.isArray(body.ids)) {
      const results: Array<{ id: number; status: string }> = []
      for (const id of body.ids) {
        try {
          await payload.delete({ collection: 'blog-posts', id })
          results.push({ id, status: 'deleted' })
        } catch (err: any) {
          results.push({ id, status: 'error: ' + err.message?.substring(0, 80) })
        }
      }
      return NextResponse.json({ action: 'delete', results })
    }

    return NextResponse.json({ error: 'Unknown action. Use { "action": "delete", "ids": [...] }' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
