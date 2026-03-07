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
          `UPDATE tours_locales SET ${updates.join(', ')} WHERE id = ${row.id}`
        ))
        results.push(`tours_locales:${row.id}:${row._locale}:${updates.length} fields`)
      }
    }

    // 2. Fix tours_included locales
    try {
      const inclRows = await drizzle.execute(sql.raw(
        `SELECT id, text FROM tours_included_locales WHERE text IS NOT NULL`
      ))
      for (const row of inclRows.rows || inclRows) {
        if (typeof row.text === 'string' && !row.text.startsWith('{')) {
          await drizzle.execute(sql.raw(
            `UPDATE tours_included_locales SET text = '${textToLexical(row.text).replace(/'/g, "''")}' WHERE id = ${row.id}`
          ))
          results.push(`tours_included_locales:${row.id}`)
        }
      }
    } catch (e: any) {
      results.push(`tours_included_locales:SKIP:${e.message?.substring(0, 60)}`)
    }

    // 3. Fix tours_excluded locales
    try {
      const exclRows = await drizzle.execute(sql.raw(
        `SELECT id, text FROM tours_excluded_locales WHERE text IS NOT NULL`
      ))
      for (const row of exclRows.rows || exclRows) {
        if (typeof row.text === 'string' && !row.text.startsWith('{')) {
          await drizzle.execute(sql.raw(
            `UPDATE tours_excluded_locales SET text = '${textToLexical(row.text).replace(/'/g, "''")}' WHERE id = ${row.id}`
          ))
          results.push(`tours_excluded_locales:${row.id}`)
        }
      }
    } catch (e: any) {
      results.push(`tours_excluded_locales:SKIP:${e.message?.substring(0, 60)}`)
    }

    // 4. Fix tours_faq locales (answer field)
    try {
      const faqRows = await drizzle.execute(sql.raw(
        `SELECT id, answer FROM tours_faq_locales WHERE answer IS NOT NULL`
      ))
      for (const row of faqRows.rows || faqRows) {
        if (typeof row.answer === 'string' && !row.answer.startsWith('{')) {
          await drizzle.execute(sql.raw(
            `UPDATE tours_faq_locales SET answer = '${textToLexical(row.answer).replace(/'/g, "''")}' WHERE id = ${row.id}`
          ))
          results.push(`tours_faq_locales:${row.id}`)
        }
      }
    } catch (e: any) {
      results.push(`tours_faq_locales:SKIP:${e.message?.substring(0, 60)}`)
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
    for (const table of ['_tours_v_version_included_locales', '_tours_v_version_excluded_locales']) {
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
        `SELECT id, answer FROM _tours_v_version_faq_locales WHERE answer IS NOT NULL`
      ))
      for (const row of vFaqRows.rows || vFaqRows) {
        if (typeof row.answer === 'string' && !row.answer.startsWith('{')) {
          await drizzle.execute(sql.raw(
            `UPDATE _tours_v_version_faq_locales SET answer = '${textToLexical(row.answer).replace(/'/g, "''")}' WHERE id = ${row.id}`
          ))
          results.push(`_tours_v_version_faq_locales:${row.id}`)
        }
      }
    } catch (e: any) {
      results.push(`_tours_v_version_faq_locales:SKIP:${e.message?.substring(0, 60)}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
