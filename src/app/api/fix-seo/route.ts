import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

function extractPlainText(data: any): string {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (data?.root?.children) {
    return data.root.children
      .map((node: any) => {
        if (node.type === 'text') return node.text || ''
        if (node.children) return node.children.map((c: any) => c.text || '').join('')
        return ''
      })
      .filter(Boolean)
      .join(' ')
  }
  return ''
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  const trimmed = str.slice(0, max - 1)
  const lastSpace = trimmed.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? trimmed.slice(0, lastSpace) : trimmed) + '…'
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-init-secret')
    const payload = await getPayload({ config })
    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const locales = ['en', 'ru'] as const
    const results: any[] = []

    for (const locale of locales) {
      const allTours = await payload.find({
        collection: 'tours',
        limit: 200,
        locale,
        depth: 1,
      })

      for (const tour of allTours.docs) {
        const seo = (tour as any).seo || {}
        const heroImage = typeof tour.heroImage === 'object' ? tour.heroImage : null
        const heroImageId = heroImage?.id || (typeof tour.heroImage === 'number' ? tour.heroImage : null)
        const ogImageId = typeof seo.ogImage === 'object' ? seo.ogImage?.id : seo.ogImage
        const updates: Record<string, any> = {}
        const changes: string[] = []

        // Generate metaTitle if missing
        if (!seo.metaTitle && tour.title) {
          const suffix = locale === 'ru' ? ' — Best Prague Guide' : ' — Best Prague Guide'
          const maxTitleLen = 60 - suffix.length
          const metaTitle = truncate(tour.title as string, maxTitleLen) + suffix
          updates['seo.metaTitle'] = metaTitle
          changes.push(`metaTitle: "${metaTitle}"`)
        }

        // Generate metaDescription if missing
        if (!seo.metaDescription) {
          const excerptText = extractPlainText(tour.excerpt)
          if (excerptText) {
            const metaDescription = truncate(excerptText, 160)
            updates['seo.metaDescription'] = metaDescription
            changes.push(`metaDescription: "${metaDescription.slice(0, 50)}..."`)
          }
        }

        // Set ogImage from heroImage if missing
        if (!ogImageId && heroImageId) {
          updates['seo.ogImage'] = heroImageId
          changes.push(`ogImage: heroImage #${heroImageId}`)
        }

        if (Object.keys(updates).length > 0) {
          await payload.update({
            collection: 'tours',
            id: tour.id as number,
            locale,
            data: updates,
            depth: 0,
          })
          results.push({
            id: tour.id,
            locale,
            title: tour.title,
            changes,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      details: results,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
