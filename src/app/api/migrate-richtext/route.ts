import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

function textToLexical(text: string) {
  if (!text) return null
  return {
    root: {
      type: 'root',
      children: text
        .split('\n')
        .filter(Boolean)
        .map((paragraph) => ({
          type: 'paragraph',
          children: [{ type: 'text', text: paragraph, version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const results: string[] = []

    // Migrate Reviews: body + guideResponse
    const reviews = await payload.find({ collection: 'reviews', limit: 1000 })
    for (const review of reviews.docs) {
      const updates: Record<string, unknown> = {}
      if (typeof review.body === 'string') {
        updates.body = textToLexical(review.body)
      }
      if (typeof (review as any).guideResponse === 'string') {
        updates.guideResponse = textToLexical((review as any).guideResponse)
      }
      if (Object.keys(updates).length > 0) {
        await payload.update({ collection: 'reviews', id: review.id, data: updates })
        results.push(`review:${review.id}`)
      }
    }

    // Migrate Tours: excerpt, faq answers, included/excluded text, meeting point instructions
    for (const locale of ['en', 'ru'] as const) {
      const tours = await payload.find({ collection: 'tours', limit: 1000, locale })
      for (const tour of tours.docs) {
        const updates: Record<string, unknown> = {}
        if (typeof tour.excerpt === 'string') {
          updates.excerpt = textToLexical(tour.excerpt)
        }
        if (typeof tour.description === 'string') {
          updates.description = textToLexical(tour.description)
        }
        if (Array.isArray((tour as any).faq)) {
          const faq = (tour as any).faq.map((item: any) => ({
            ...item,
            answer: typeof item.answer === 'string' ? textToLexical(item.answer) : item.answer,
          }))
          if (faq.some((item: any, i: number) => item.answer !== (tour as any).faq[i].answer)) {
            updates.faq = faq
          }
        }
        if (Array.isArray((tour as any).included)) {
          const included = (tour as any).included.map((item: any) => ({
            ...item,
            text: typeof item.text === 'string' ? textToLexical(item.text) : item.text,
          }))
          if (included.some((item: any, i: number) => item.text !== (tour as any).included[i].text)) {
            updates.included = included
          }
        }
        if (Array.isArray((tour as any).excluded)) {
          const excluded = (tour as any).excluded.map((item: any) => ({
            ...item,
            text: typeof item.text === 'string' ? textToLexical(item.text) : item.text,
          }))
          if (excluded.some((item: any, i: number) => item.text !== (tour as any).excluded[i].text)) {
            updates.excluded = excluded
          }
        }
        if (typeof (tour as any).meetingPoint?.instructions === 'string') {
          updates.meetingPoint = {
            ...(tour as any).meetingPoint,
            instructions: textToLexical((tour as any).meetingPoint.instructions),
          }
        }
        if (Object.keys(updates).length > 0) {
          await payload.update({ collection: 'tours', id: tour.id, data: updates, locale })
          results.push(`tour:${tour.id}:${locale}`)
        }
      }
    }

    // Migrate BlogPosts: excerpt
    const blogs = await payload.find({ collection: 'blog-posts', limit: 1000 })
    for (const blog of blogs.docs) {
      if (typeof (blog as any).excerpt === 'string') {
        await payload.update({
          collection: 'blog-posts',
          id: blog.id,
          data: { excerpt: textToLexical((blog as any).excerpt) },
        })
        results.push(`blog:${blog.id}`)
      }
    }

    // Migrate globals: Homepage guideBio, AboutPage founderBio + teamDescription
    const homepage = await payload.findGlobal({ slug: 'homepage' })
    if (typeof (homepage as any).guideBio === 'string') {
      await payload.updateGlobal({
        slug: 'homepage',
        data: { guideBio: textToLexical((homepage as any).guideBio) },
      })
      results.push('global:homepage')
    }

    const aboutPage = await payload.findGlobal({ slug: 'about-page' })
    const aboutUpdates: Record<string, unknown> = {}
    if (typeof (aboutPage as any).founderBio === 'string') {
      aboutUpdates.founderBio = textToLexical((aboutPage as any).founderBio)
    }
    if (typeof (aboutPage as any).teamDescription === 'string') {
      aboutUpdates.teamDescription = textToLexical((aboutPage as any).teamDescription)
    }
    if (Object.keys(aboutUpdates).length > 0) {
      await payload.updateGlobal({ slug: 'about-page', data: aboutUpdates })
      results.push('global:about-page')
    }

    return NextResponse.json({ success: true, migrated: results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
