import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    // List all pages
    const all = await payload.find({
      collection: 'pages',
      limit: 0,
      locale: 'en',
    })

    const pages = all.docs.map((d: any) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      template: d.template,
      _status: d._status,
    }))

    // Try specific slug lookup
    const test = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'private-walking-tour-prague' } },
      limit: 1,
      locale: 'en',
    })

    return NextResponse.json({
      total: all.totalDocs,
      pages,
      testLookup: test.docs.length > 0 ? 'FOUND' : 'NOT FOUND',
      testDocs: test.docs.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
