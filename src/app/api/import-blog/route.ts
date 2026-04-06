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
    const { articles } = body as {
      articles: Array<{
        slug: string
        title: string
        content: string
        metaTitle: string
        metaDescription: string
        excerpt: string
        faqItems?: Array<{ question: string; answer: string }>
        publishedAt?: string
      }>
    }

    if (!articles?.length) {
      return NextResponse.json({ error: 'No articles provided' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const results: Array<{ slug: string; status: string; id?: number; error?: string }> = []

    for (const article of articles) {
      try {
        // Check if slug already exists
        const existing = await payload.find({
          collection: 'blog-posts',
          where: { slug: { equals: article.slug } },
          limit: 1,
          locale: 'en',
        })

        if (existing.docs.length > 0) {
          results.push({ slug: article.slug, status: 'skipped', id: existing.docs[0].id as number })
          continue
        }

        // Convert markdown to Lexical JSON (skip H1 — title is separate)
        const contentWithoutH1 = article.content.replace(/^# .+\n+/, '')
        const contentLexical = markdownToLexical(contentWithoutH1)
        const excerptLexical = markdownToLexical(article.excerpt)

        const doc = await payload.create({
          collection: 'blog-posts',
          locale: 'en',
          data: {
            slug: article.slug,
            title: article.title,
            content: contentLexical as any,
            excerpt: excerptLexical as any,
            publishedLocales: ['en'],
            publishedAt: article.publishedAt || new Date().toISOString(),
            _status: 'published',
            seo: {
              metaTitle: article.metaTitle,
              metaDescription: article.metaDescription,
            },
          } as any,
        })

        results.push({ slug: article.slug, status: 'created', id: doc.id as number })
      } catch (err: any) {
        results.push({ slug: article.slug, status: 'error', error: err.message?.substring(0, 200) })
      }
    }

    const created = results.filter(r => r.status === 'created').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const errors = results.filter(r => r.status === 'error').length

    return NextResponse.json({ success: true, created, skipped, errors, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
