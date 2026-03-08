import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tours',
      sort: 'sortOrder',
      limit: 200,
      depth: 0,
    })

    const tours = result.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      status: doc.status,
      category: doc.category,
      sortOrder: doc.sortOrder ?? 0,
    }))

    return NextResponse.json({ tours })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })

    // Verify user is authenticated
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { order } = await req.json()
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }

    // Update each tour's sortOrder
    for (const item of order) {
      await payload.update({
        collection: 'tours',
        id: item.id,
        data: { sortOrder: item.sortOrder },
        depth: 0,
      })
    }

    return NextResponse.json({ success: true, updated: order.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
