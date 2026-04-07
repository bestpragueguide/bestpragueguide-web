import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '@/lib/markdown-to-lexical'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { updates } = body as {
      updates: Array<{
        id: number
        markdown: string
        position?: 'before-faq' | 'end'
      }>
    }

    if (!updates?.length) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const results: Array<{ id: number; status: string; error?: string }> = []

    for (const update of updates) {
      try {
        // Get existing content
        const doc = await payload.findByID({
          collection: 'blog-posts',
          id: update.id,
          locale: 'en',
        })

        const existingContent = (doc.content as any) || { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } }

        // Convert new markdown to Lexical nodes
        const newContent = markdownToLexical(update.markdown) as any
        const newNodes = newContent.root.children || []

        if (newNodes.length === 0) {
          results.push({ id: update.id, status: 'skipped', error: 'No new content' })
          continue
        }

        // Find insertion point
        const children = [...(existingContent.root?.children || [])]
        let insertIndex = children.length

        if (update.position === 'before-faq') {
          // Find "Frequently Asked Questions" or "FAQ" or "Experience It With a Private Guide" heading
          for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (child.type === 'heading') {
              const headingText = child.children?.map((c: any) => c.text || '').join('') || ''
              if (headingText.includes('Frequently Asked') || headingText.includes('FAQ') || headingText.includes('Experience It With')) {
                insertIndex = i
                break
              }
            }
          }
        }

        // Insert new nodes
        children.splice(insertIndex, 0, ...newNodes)

        // Update the article
        await payload.update({
          collection: 'blog-posts',
          id: update.id,
          locale: 'en',
          data: {
            content: {
              ...existingContent,
              root: {
                ...existingContent.root,
                children,
              },
            },
          } as any,
        })

        results.push({ id: update.id, status: 'updated' })
      } catch (err: any) {
        results.push({ id: update.id, status: 'error', error: err.message?.substring(0, 200) })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
