import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '@/lib/markdown-to-lexical'

/**
 * Append H2 sections to existing blog articles.
 * POST /api/append-h2
 * Header: x-init-secret = PAYLOAD_SECRET
 * Body: { additions: [{ slug, content }], locale?: "en"|"ru" }
 *
 * For each addition:
 * 1. Fetches the existing article's Lexical content
 * 2. Converts the new H2 markdown to Lexical nodes
 * 3. Inserts new nodes before FAQ/CTA/You May Also Like sections
 * 4. Updates the article
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { additions, locale = 'en' } = body as {
      additions: Array<{ slug: string; content: string }>
      locale?: 'en' | 'ru'
    }

    if (!additions?.length) {
      return NextResponse.json({ error: 'No additions provided' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const results: Array<{ slug: string; status: string; id?: number; error?: string }> = []

    for (const addition of additions) {
      try {
        // Find existing article
        const existing = await payload.find({
          collection: 'blog-posts',
          where: { slug: { equals: addition.slug } },
          limit: 1,
          locale,
        })

        if (!existing.docs.length) {
          results.push({ slug: addition.slug, status: 'error', error: 'Article not found' })
          continue
        }

        const doc = existing.docs[0]
        const existingContent = doc.content as any

        if (!existingContent?.root?.children) {
          results.push({ slug: addition.slug, status: 'error', error: 'No existing content' })
          continue
        }

        // Convert new H2 markdown to Lexical
        const newLexical = markdownToLexical(addition.content)
        const newNodes = (newLexical as any)?.root?.children || []

        if (!newNodes.length) {
          results.push({ slug: addition.slug, status: 'error', error: 'Empty H2 content' })
          continue
        }

        // Find insertion point — before FAQ, Experience It, or You May Also Like
        const children = existingContent.root.children
        let insertIndex = children.length

        for (let i = 0; i < children.length; i++) {
          const node = children[i]
          if (node.type === 'heading') {
            const headingText = extractText(node).toLowerCase()
            if (
              headingText.includes('frequently asked') ||
              headingText.includes('faq') ||
              headingText.includes('experience it with') ||
              headingText.includes('you may also like')
            ) {
              insertIndex = i
              break
            }
          }
        }

        // Insert new nodes at the insertion point
        const updatedChildren = [
          ...children.slice(0, insertIndex),
          ...newNodes,
          ...children.slice(insertIndex),
        ]

        const updatedContent = {
          ...existingContent,
          root: {
            ...existingContent.root,
            children: updatedChildren,
          },
        }

        // Update the article
        await payload.update({
          collection: 'blog-posts',
          id: doc.id,
          locale,
          data: {
            content: updatedContent as any,
          } as any,
        })

        results.push({ slug: addition.slug, status: 'updated', id: doc.id as number })
      } catch (err: any) {
        results.push({ slug: addition.slug, status: 'error', error: err.message?.substring(0, 200) })
      }
    }

    const updated = results.filter(r => r.status === 'updated').length
    const errors = results.filter(r => r.status === 'error').length

    return NextResponse.json({ success: true, updated, errors, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function extractText(node: any): string {
  if (!node) return ''
  if (node.text) return node.text
  let text = ''
  for (const child of node.children || []) {
    text += extractText(child)
  }
  return text
}
