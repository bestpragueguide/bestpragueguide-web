import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

function textToLexical(text: string) {
  return JSON.stringify({
    root: {
      type: 'root',
      children: text
        .split('\n')
        .filter(Boolean)
        .map((paragraph) => ({
          type: 'paragraph',
          children: [{ type: 'text', text: paragraph, version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  })
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

    // Find all plain text values in richText columns and convert them
    // Tables to check: tours_locales (excerpt, description, meeting_point_instructions)
    // tours_included, tours_excluded, tours_faq (localized arrays)

    // 1. Fix tours_locales: excerpt, description, meeting_point_instructions
    const localeRows = await drizzle.execute(sql.raw(
      `SELECT id, _parent_id, _locale, excerpt, description, meeting_point_instructions
       FROM tours_locales`
    ))
    for (const row of localeRows.rows || localeRows) {
      let changed = false
      if (typeof row.excerpt === 'string' && !row.excerpt.startsWith('{')) {
        await drizzle.execute(sql`UPDATE tours_locales SET excerpt = ${textToLexical(row.excerpt)} WHERE id = ${row.id}`)
        changed = true
      }
      if (typeof row.description === 'string' && !row.description.startsWith('{')) {
        await drizzle.execute(sql`UPDATE tours_locales SET description = ${textToLexical(row.description)} WHERE id = ${row.id}`)
        changed = true
      }
      if (typeof row.meeting_point_instructions === 'string' && !row.meeting_point_instructions.startsWith('{')) {
        await drizzle.execute(sql`UPDATE tours_locales SET meeting_point_instructions = ${textToLexical(row.meeting_point_instructions)} WHERE id = ${row.id}`)
        changed = true
      }
      if (changed) {
        results.push(`tours_locales:${row.id}:${row._locale}`)
      }
    }

    // 2. Fix tours_included and tours_excluded (text field)
    for (const table of ['tours_included', 'tours_excluded']) {
      try {
        const rows = await drizzle.execute(sql.raw(
          `SELECT id, text FROM ${table} WHERE text IS NOT NULL`
        ))
        for (const row of rows.rows || rows) {
          if (typeof row.text === 'string' && !row.text.startsWith('{')) {
            const lexical = textToLexical(row.text)
            if (table === 'tours_included') {
              await drizzle.execute(sql`UPDATE tours_included SET text = ${lexical} WHERE id = ${row.id}`)
            } else {
              await drizzle.execute(sql`UPDATE tours_excluded SET text = ${lexical} WHERE id = ${row.id}`)
            }
            results.push(`${table}:${row.id}`)
          }
        }
      } catch (e: any) {
        results.push(`${table}:SKIP:${e.message?.substring(0, 80)}`)
      }
    }

    // 3. Fix tours_faq (answer field)
    try {
      const faqRows = await drizzle.execute(sql.raw(
        `SELECT id, answer FROM tours_faq WHERE answer IS NOT NULL`
      ))
      for (const row of faqRows.rows || faqRows) {
        if (typeof row.answer === 'string' && !row.answer.startsWith('{')) {
          const lexical = textToLexical(row.answer)
          await drizzle.execute(sql`UPDATE tours_faq SET answer = ${lexical} WHERE id = ${row.id}`)
          results.push(`tours_faq:${row.id}`)
        }
      }
    } catch (e: any) {
      results.push(`tours_faq:SKIP:${e.message?.substring(0, 80)}`)
    }

    // 5. Fix version tables too
    try {
      const vLocaleRows = await drizzle.execute(sql.raw(
        `SELECT id, excerpt, description, meeting_point_instructions
         FROM _tours_v_version_locales`
      ))
      for (const row of vLocaleRows.rows || vLocaleRows) {
        const updates: string[] = []
        if (typeof row.excerpt === 'string' && !row.excerpt.startsWith('{')) {
          updates.push(`excerpt = '${textToLexical(row.excerpt).replace(/'/g, "''")}'`)
        }
        if (typeof row.description === 'string' && !row.description.startsWith('{')) {
          updates.push(`description = '${textToLexical(row.description).replace(/'/g, "''")}'`)
        }
        if (typeof row.meeting_point_instructions === 'string' && !row.meeting_point_instructions.startsWith('{')) {
          updates.push(`meeting_point_instructions = '${textToLexical(row.meeting_point_instructions).replace(/'/g, "''")}'`)
        }
        if (updates.length > 0) {
          await drizzle.execute(sql.raw(
            `UPDATE _tours_v_version_locales SET ${updates.join(', ')} WHERE id = ${row.id}`
          ))
          results.push(`_tours_v_version_locales:${row.id}`)
        }
      }
    } catch (e: any) {
      results.push(`_tours_v_version_locales:SKIP:${e.message?.substring(0, 60)}`)
    }

    // 6. Fix version included/excluded/faq
    for (const table of ['_tours_v_version_included', '_tours_v_version_excluded']) {
      try {
        const rows = await drizzle.execute(sql.raw(
          `SELECT id, text FROM ${table} WHERE text IS NOT NULL`
        ))
        for (const row of rows.rows || rows) {
          if (typeof row.text === 'string' && !row.text.startsWith('{')) {
            await drizzle.execute(sql.raw(
              `UPDATE ${table} SET text = '${textToLexical(row.text).replace(/'/g, "''")}' WHERE id = ${row.id}`
            ))
            results.push(`${table}:${row.id}`)
          }
        }
      } catch (e: any) {
        results.push(`${table}:SKIP:${e.message?.substring(0, 60)}`)
      }
    }

    try {
      const vFaqRows = await drizzle.execute(sql.raw(
        `SELECT id, answer FROM _tours_v_version_faq WHERE answer IS NOT NULL`
      ))
      for (const row of vFaqRows.rows || vFaqRows) {
        if (typeof row.answer === 'string' && !row.answer.startsWith('{')) {
          await drizzle.execute(sql.raw(
            `UPDATE _tours_v_version_faq SET answer = '${textToLexical(row.answer).replace(/'/g, "''")}' WHERE id = ${row.id}`
          ))
          results.push(`_tours_v_version_faq:${row.id}`)
        }
      }
    } catch (e: any) {
      results.push(`_tours_v_version_faq:SKIP:${e.message?.substring(0, 60)}`)
    }

    // 7. Fix guest category labels — check for missing locale labels and copy from other locale
    try {
      const gcLocRows = await drizzle.execute(sql.raw(
        `SELECT id, _parent_id, _locale, label
         FROM tours_pricing_guest_categories_locales
         ORDER BY _parent_id, _locale`
      ))
      const rows = gcLocRows.rows || gcLocRows
      results.push(`guest_cat_locales: ${JSON.stringify(rows)}`)

      // Group by parent_id
      const byParent: Record<string, any[]> = {}
      for (const row of rows) {
        const key = String(row._parent_id)
        if (!byParent[key]) byParent[key] = []
        byParent[key].push(row)
      }

      // For each parent, if one locale is missing or has null label, copy from the other
      for (const [parentId, localeRows] of Object.entries(byParent)) {
        const enRow = localeRows.find((r: any) => r._locale === 'en')
        const ruRow = localeRows.find((r: any) => r._locale === 'ru')

        if (enRow?.label && (!ruRow || !ruRow.label)) {
          if (ruRow) {
            await drizzle.execute(sql`UPDATE tours_pricing_guest_categories_locales SET label = ${enRow.label} WHERE id = ${ruRow.id}`)
          } else {
            await drizzle.execute(sql`INSERT INTO tours_pricing_guest_categories_locales (_parent_id, _locale, label) VALUES (${parentId}, ${'ru'}, ${enRow.label})`)
          }
          results.push(`guest_cat:${parentId}:copied en→ru`)
        }
        if (ruRow?.label && (!enRow || !enRow.label)) {
          if (enRow) {
            await drizzle.execute(sql`UPDATE tours_pricing_guest_categories_locales SET label = ${ruRow.label} WHERE id = ${enRow.id}`)
          } else {
            await drizzle.execute(sql`INSERT INTO tours_pricing_guest_categories_locales (_parent_id, _locale, label) VALUES (${parentId}, ${'en'}, ${ruRow.label})`)
          }
          results.push(`guest_cat:${parentId}:copied ru→en`)
        }
      }
    } catch (e: any) {
      results.push(`guest_categories:SKIP:${e.message?.substring(0, 80)}`)
    }

    // 8. List relevant tables for diagnostics
    try {
      const tables = await drizzle.execute(sql.raw(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'tours%' ORDER BY tablename`
      ))
      results.push(`tables: ${(tables.rows || tables).map((r: any) => r.tablename).join(', ')}`)
    } catch (e: any) {
      results.push(`tables:SKIP`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
