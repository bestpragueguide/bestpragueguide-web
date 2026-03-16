import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

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

    const db = payload.db.drizzle
    const locales = ['en', 'ru'] as const
    const results: any[] = []
    const errors: any[] = []

    for (const locale of locales) {
      const allTours = await payload.find({
        collection: 'tours',
        where: { publishedLocales: { in: [locale] } },
        limit: 200,
        locale,
        depth: 1,
      })

      for (const tour of allTours.docs) {
        const seo = (tour as any).seo || {}
        const heroImage = typeof tour.heroImage === 'object' ? tour.heroImage : null
        const heroImageId = heroImage?.id || (typeof tour.heroImage === 'number' ? tour.heroImage : null)
        const ogImageId = typeof seo.ogImage === 'object' ? seo.ogImage?.id : seo.ogImage
        const changes: string[] = []

        try {
          // Generate metaTitle if missing
          if (!seo.metaTitle && tour.title) {
            const suffix = ' — Best Prague Guide'
            const maxTitleLen = 60 - suffix.length
            const metaTitle = truncate(tour.title as string, maxTitleLen) + suffix

            // Update main table
            await db.execute(
              sql`UPDATE tours_locales SET seo_meta_title = ${metaTitle}
                  WHERE _parent_id = ${tour.id} AND _locale = ${locale}
                  AND (seo_meta_title IS NULL OR seo_meta_title = '')`
            )
            // Update version table (latest version)
            await db.execute(
              sql`UPDATE _tours_v_locales SET version_seo_meta_title = ${metaTitle}
                  WHERE _parent_id IN (
                    SELECT id FROM _tours_v WHERE parent_id = ${tour.id} ORDER BY id DESC LIMIT 1
                  ) AND _locale = ${locale}
                  AND (version_seo_meta_title IS NULL OR version_seo_meta_title = '')`
            )
            changes.push(`metaTitle: "${metaTitle}"`)
          }

          // Generate metaDescription if missing
          if (!seo.metaDescription) {
            const excerptText = extractPlainText(tour.excerpt)
            if (excerptText) {
              const metaDescription = truncate(excerptText, 160)

              // Update main table
              await db.execute(
                sql`UPDATE tours_locales SET seo_meta_description = ${metaDescription}
                    WHERE _parent_id = ${tour.id} AND _locale = ${locale}
                    AND (seo_meta_description IS NULL OR seo_meta_description = '')`
              )
              // Update version table
              await db.execute(
                sql`UPDATE _tours_v_locales SET version_seo_meta_description = ${metaDescription}
                    WHERE _parent_id IN (
                      SELECT id FROM _tours_v WHERE parent_id = ${tour.id} ORDER BY id DESC LIMIT 1
                    ) AND _locale = ${locale}
                    AND (version_seo_meta_description IS NULL OR version_seo_meta_description = '')`
              )
              changes.push(`metaDescription: "${metaDescription.slice(0, 50)}..."`)
            }
          }

          // Set ogImage from heroImage if missing (not localized)
          if (!ogImageId && heroImageId) {
            // Update main table
            await db.execute(
              sql`UPDATE tours SET seo_og_image_id = ${heroImageId}
                  WHERE id = ${tour.id} AND seo_og_image_id IS NULL`
            )
            // Update version table
            await db.execute(
              sql`UPDATE _tours_v SET version_seo_og_image_id = ${heroImageId}
                  WHERE parent_id = ${tour.id}
                  AND id = (SELECT id FROM _tours_v WHERE parent_id = ${tour.id} ORDER BY id DESC LIMIT 1)
                  AND version_seo_og_image_id IS NULL`
            )
            changes.push(`ogImage: heroImage #${heroImageId}`)
          }

          if (changes.length > 0) {
            results.push({ id: tour.id, locale, title: tour.title, changes })
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          errors.push({ id: tour.id, locale, title: tour.title, error: msg })
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      errors: errors.length,
      details: results,
      errorDetails: errors,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
