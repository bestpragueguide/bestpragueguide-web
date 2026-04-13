import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET — audit media alt text: find images missing alt in EN and/or RU
 * POST — bulk update alt texts: { updates: [{ id, altEn, altRu }] }
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    const enMedia = await payload.find({
      collection: 'media',
      limit: 0,
      locale: 'en',
      fallbackLocale: false as any,
      depth: 0,
    })

    const ruMedia = await payload.find({
      collection: 'media',
      limit: 0,
      locale: 'ru',
      fallbackLocale: false as any,
      depth: 0,
    })

    const ruAltMap = new Map<number, string>()
    for (const m of ruMedia.docs) {
      ruAltMap.set(m.id as number, (m.alt || '') as string)
    }

    let withAltBoth = 0
    let withAltEnOnly = 0
    let withAltRuOnly = 0
    let missingBoth = 0
    const missingEnList: Array<{ id: number; filename: string; altRu: string }> = []
    const missingRuList: Array<{ id: number; filename: string; altEn: string }> = []
    const missingBothList: Array<{ id: number; filename: string }> = []

    for (const m of enMedia.docs) {
      const id = m.id as number
      const enAlt = ((m.alt || '') as string).trim()
      const ruAlt = (ruAltMap.get(id) || '').trim()
      const filename = (m.filename || '') as string

      if (enAlt && ruAlt) {
        withAltBoth++
      } else if (enAlt && !ruAlt) {
        withAltEnOnly++
        if (missingRuList.length < 30) missingRuList.push({ id, filename, altEn: enAlt })
      } else if (!enAlt && ruAlt) {
        withAltRuOnly++
        if (missingEnList.length < 30) missingEnList.push({ id, filename, altRu: ruAlt })
      } else {
        missingBoth++
        if (missingBothList.length < 50) missingBothList.push({ id, filename })
      }
    }

    return NextResponse.json({
      total: enMedia.totalDocs,
      withAltBoth,
      withAltEnOnly,
      withAltRuOnly,
      missingBoth,
      missingEnSample: missingEnList,
      missingRuSample: missingRuList,
      missingBothSample: missingBothList,
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
    const { updates } = await req.json() as {
      updates: Array<{ id: number; altEn?: string; altRu?: string }>
    }

    if (!updates?.length) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    let fixed = 0
    let errors = 0

    for (const u of updates) {
      try {
        if (u.altEn) {
          await payload.update({
            collection: 'media',
            id: u.id,
            locale: 'en',
            data: { alt: u.altEn } as any,
          })
        }
        if (u.altRu) {
          await payload.update({
            collection: 'media',
            id: u.id,
            locale: 'ru',
            data: { alt: u.altRu } as any,
          })
        }
        fixed++
      } catch {
        errors++
      }
    }

    return NextResponse.json({ total: updates.length, fixed, errors })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
