import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

/**
 * Walk a Lexical JSON tree and set newTab: true on all link nodes.
 * Returns true if any changes were made.
 */
function setNewTabOnLinks(node: any): boolean {
  if (!node || typeof node !== 'object') return false

  let changed = false

  if (node.type === 'link' && node.fields && !node.fields.newTab) {
    node.fields.newTab = true
    changed = true
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (setNewTabOnLinks(child)) changed = true
    }
  }

  return changed
}

function processRichText(value: unknown): { changed: boolean; result: string | null } {
  if (!value || typeof value !== 'string') return { changed: false, result: null }

  let parsed: any
  try {
    parsed = JSON.parse(value)
  } catch {
    return { changed: false, result: null }
  }

  if (!parsed?.root) return { changed: false, result: null }

  const changed = setNewTabOnLinks(parsed.root)
  return { changed, result: changed ? JSON.stringify(parsed) : null }
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle
    const results: string[] = []

    // Tables and their richText columns to process
    const tablesToFix: Array<{ table: string; columns: string[] }> = [
      // Blog posts
      { table: 'blog_posts_locales', columns: ['excerpt', 'content'] },
      { table: '_blog_posts_v_version_locales', columns: ['excerpt', 'content'] },
      // Tours
      { table: 'tours_locales', columns: ['excerpt', 'description', 'meeting_point_instructions'] },
      { table: '_tours_v_version_locales', columns: ['excerpt', 'description', 'meeting_point_instructions'] },
      // Tour arrays (localized sub-tables)
      { table: 'tours_included_locales', columns: ['text'] },
      { table: 'tours_excluded_locales', columns: ['text'] },
      { table: 'tours_faq_locales', columns: ['answer'] },
      { table: '_tours_v_version_included_locales', columns: ['text'] },
      { table: '_tours_v_version_excluded_locales', columns: ['text'] },
      { table: '_tours_v_version_faq_locales', columns: ['answer'] },
      // Non-localized array tables
      { table: 'tours_included', columns: ['text'] },
      { table: 'tours_excluded', columns: ['text'] },
      { table: 'tours_faq', columns: ['answer'] },
      { table: '_tours_v_version_included', columns: ['text'] },
      { table: '_tours_v_version_excluded', columns: ['text'] },
      { table: '_tours_v_version_faq', columns: ['answer'] },
      // Pages
      { table: 'pages_locales', columns: ['content'] },
      { table: '_pages_v_version_locales', columns: ['content'] },
      // FAQs
      { table: 'faqs_locales', columns: ['answer'] },
      // About page
      { table: 'about_page_locales', columns: ['founder_bio', 'team_description'] },
    ]

    for (const { table, columns } of tablesToFix) {
      try {
        const selectCols = ['id', ...columns].join(', ')
        const rows = await drizzle.execute(sql.raw(
          `SELECT ${selectCols} FROM ${table}`
        ))
        let tableFixed = 0
        for (const row of rows.rows || rows) {
          for (const col of columns) {
            const { changed, result } = processRichText(row[col])
            if (changed && result) {
              await drizzle.execute(sql.raw(
                `UPDATE ${table} SET ${col} = '${result.replace(/'/g, "''")}' WHERE id = ${typeof row.id === 'string' ? `'${row.id}'` : row.id}`
              ))
              tableFixed++
            }
          }
        }
        if (tableFixed > 0) {
          results.push(`${table}: fixed ${tableFixed} link(s)`)
        } else {
          results.push(`${table}: no links to fix`)
        }
      } catch (e: any) {
        const msg = e.message?.substring(0, 80) || 'unknown'
        if (msg.includes('does not exist')) {
          results.push(`${table}: table not found (skip)`)
        } else {
          results.push(`${table}: ERROR: ${msg}`)
        }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
