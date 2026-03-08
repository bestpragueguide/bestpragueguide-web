import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

async function getUser() {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) return null

  try {
    const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    return user
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const locale = url.searchParams.get('locale') as 'en' | 'ru' | null

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'tours',
      sort: 'sortOrder',
      limit: 200,
      depth: 0,
      locale: locale || 'en',
      ...(locale ? { where: { publishedLocales: { in: [locale] } } } : {}),
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
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { order } = await req.json()
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }

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
