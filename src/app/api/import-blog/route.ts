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
    const { articles, defaultHeroImageId, mode } = body as {
      articles: Array<{
        slug: string
        title: string
        content: string
        metaTitle: string
        metaDescription: string
        excerpt: string
        category?: string
        faqItems?: Array<{ question: string; answer: string }>
        publishedAt?: string
      }>
      defaultHeroImageId?: number
      mode?: 'create' | 'update'
      locale?: 'en' | 'ru'
    }

    if (!articles?.length) {
      return NextResponse.json({ error: 'No articles provided' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const results: Array<{ slug: string; status: string; id?: number; error?: string }> = []
    const articleLocale = body.locale || 'en'

    for (const article of articles) {
      try {
        // Check if slug already exists
        const existing = await payload.find({
          collection: 'blog-posts',
          where: { slug: { equals: article.slug } },
          limit: 1,
          locale: articleLocale,
        })

        // Convert markdown to Lexical JSON (skip H1 — title is separate)
        const contentClean = article.content.replace(/^# .+\n+/, '')
        const contentLexical = markdownToLexical(contentClean)
        const excerptLexical = markdownToLexical(article.excerpt)

        if (existing.docs.length > 0 && mode === 'update') {
          // Update existing article content
          const existingDoc = existing.docs[0]
          await payload.update({
            collection: 'blog-posts',
            id: existingDoc.id,
            locale: articleLocale,
            data: {
              content: contentLexical as any,
              excerpt: excerptLexical as any,
              seo: {
                metaTitle: article.metaTitle,
                metaDescription: article.metaDescription,
              },
            } as any,
          })
          results.push({ slug: article.slug, status: 'updated', id: existingDoc.id as number })
          continue
        } else if (existing.docs.length > 0) {
          results.push({ slug: article.slug, status: 'skipped', id: existing.docs[0].id as number })
          continue
        }

        const doc = await payload.create({
          collection: 'blog-posts',
          locale: articleLocale,
          data: {
            slug: article.slug,
            title: article.title,
            content: contentLexical as any,
            excerpt: excerptLexical as any,
            category: article.category || 'prague-guide',
            heroImage: defaultHeroImageId || undefined,
            publishedLocales: [articleLocale],
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
