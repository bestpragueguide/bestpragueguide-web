import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * POST /api/fix-page-faq — Update FAQ items on a Pages collection entry
 * Body: { slug: string, faqItems: [{ question, answer }] }
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug, faqItems } = await req.json()
    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      locale: 'en',
    })

    if (!existing.docs.length) {
      return NextResponse.json({ error: `Page ${slug} not found` }, { status: 404 })
    }

    const doc = existing.docs[0]

    await payload.update({
      collection: 'pages',
      id: doc.id,
      locale: 'en',
      data: { faqItems } as any,
    })

    return NextResponse.json({ success: true, id: doc.id, slug, faqCount: faqItems.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
