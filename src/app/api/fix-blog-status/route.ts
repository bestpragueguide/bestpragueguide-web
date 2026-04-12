import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    // Find all blog posts where status is not 'published' or _status is not 'published'
    const allPosts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      depth: 0,
    })

    const drafts = allPosts.docs.filter(
      (doc: any) => doc.status !== 'published' || doc._status !== 'published'
    )

    const results: Array<{ id: number; slug: string; status: string; prevStatus: string; prevDraftStatus: string }> = []

    for (const doc of drafts) {
      try {
        await payload.update({
          collection: 'blog-posts',
          id: doc.id,
          data: {
            status: 'published',
            _status: 'published',
          } as any,
        })
        results.push({
          id: doc.id as number,
          slug: (doc.slug || '') as string,
          status: 'fixed',
          prevStatus: (doc as any).status || 'unknown',
          prevDraftStatus: (doc as any)._status || 'unknown',
        })
      } catch (err: any) {
        results.push({
          id: doc.id as number,
          slug: (doc.slug || '') as string,
          status: 'error: ' + err.message?.substring(0, 100),
          prevStatus: (doc as any).status || 'unknown',
          prevDraftStatus: (doc as any)._status || 'unknown',
        })
      }
    }

    return NextResponse.json({
      total: allPosts.totalDocs,
      alreadyPublished: allPosts.totalDocs - drafts.length,
      fixed: results.filter(r => r.status === 'fixed').length,
      errors: results.filter(r => r.status.startsWith('error')).length,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    const allPosts = await payload.find({
      collection: 'blog-posts',
      limit: 0,
      depth: 0,
    })

    const drafts = allPosts.docs.filter(
      (doc: any) => doc.status !== 'published' || doc._status !== 'published'
    )

    return NextResponse.json({
      total: allPosts.totalDocs,
      published: allPosts.totalDocs - drafts.length,
      drafts: drafts.length,
      draftList: drafts.map((d: any) => ({
        id: d.id,
        slug: d.slug,
        status: d.status,
        _status: d._status,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
