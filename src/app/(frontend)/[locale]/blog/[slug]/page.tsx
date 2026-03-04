export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { BlogPostSchema } from '@/components/seo/BlogPostSchema'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

const categoryLabels: Record<string, Record<string, string>> = {
  en: {
    'prague-guide': 'Prague Guide',
    'food-and-drink': 'Food & Drink',
    'day-trips': 'Day Trips',
    'tips': 'Tips',
    'history': 'History',
  },
  ru: {
    'prague-guide': 'Гид по Праге',
    'food-and-drink': 'Еда и напитки',
    'day-trips': 'Поездки из Праги',
    'tips': 'Советы',
    'history': 'История',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: slug } },
      limit: 1,
      locale: locale as 'en' | 'ru',
    })
    const post = result.docs[0]
    if (!post) return { title: 'Not Found' }

    const seo = post.seo as any
    const heroImage = typeof post.heroImage === 'object' ? post.heroImage : null
    const ogImageUrl = seo?.ogImage?.url || heroImage?.sizes?.og?.url || heroImage?.url || ''

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
    const otherLocale = locale === 'en' ? 'ru' : 'en'

    // Fetch slug in other locale
    let otherSlug = slug
    try {
      const altResult = await payload.find({
        collection: 'blog-posts',
        where: { id: { equals: post.id } },
        limit: 1,
        locale: otherLocale as 'en' | 'ru',
      })
      if (altResult.docs[0]?.slug) {
        otherSlug = altResult.docs[0].slug as string
      }
    } catch {
      // Use same slug as fallback
    }

    const enSlug = locale === 'en' ? slug : otherSlug
    const ruSlug = locale === 'ru' ? slug : otherSlug

    const fullOgImage = ogImageUrl
      ? (ogImageUrl.startsWith('http') ? ogImageUrl : `${baseUrl}${ogImageUrl}`)
      : `${baseUrl}/og-default.jpg`

    return {
      title: seo?.metaTitle || `${post.title} — Best Prague Guide`,
      description: seo?.metaDescription || post.excerpt,
      alternates: {
        canonical: `${baseUrl}/${locale}/blog/${slug}`,
        languages: {
          en: `${baseUrl}/en/blog/${enSlug}`,
          ru: `${baseUrl}/ru/blog/${ruSlug}`,
        },
      },
      openGraph: {
        title: seo?.metaTitle || post.title,
        description: seo?.metaDescription || post.excerpt,
        images: [{ url: fullOgImage, width: 1200, height: 630 }],
        type: 'article',
        publishedTime: post.publishedAt as string,
        siteName: 'Best Prague Guide',
        locale: locale === 'ru' ? 'ru_RU' : 'en_US',
        alternateLocale: locale === 'ru' ? ['en_US'] : ['ru_RU'],
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.metaTitle || (post.title as string),
        description: seo?.metaDescription || (post.excerpt as string),
        images: [fullOgImage],
      },
    }
  } catch {
    return { title: 'Blog — Best Prague Guide' }
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    locale: locale as 'en' | 'ru',
  })

  const post = result.docs[0]
  if (!post) notFound()

  const heroImage = typeof post.heroImage === 'object' ? post.heroImage : null
  const heroUrl = heroImage?.sizes?.hero?.url || heroImage?.url || ''
  const fullHeroUrl = heroUrl.startsWith('http') ? heroUrl : `${SERVER_URL}${heroUrl}`

  // Fetch related posts in same category
  let relatedPosts: any[] = []
  try {
    const related = await payload.find({
      collection: 'blog-posts',
      where: {
        status: { equals: 'published' },
        publishedLocales: { in: [locale] },
        category: { equals: post.category },
        id: { not_equals: post.id },
      },
      limit: 3,
      locale: locale as 'en' | 'ru',
      sort: '-publishedAt',
    })
    relatedPosts = related.docs
  } catch {
    // No related posts
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: locale === 'ru' ? 'Блог' : 'Blog', href: `/${locale}/blog` },
          { label: post.title as string },
        ]}
        locale={locale}
      />

      <article>
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 bg-gold/10 text-gold text-xs font-medium rounded">
              {categoryLabels[locale]?.[post.category as string] || post.category}
            </span>
            <time className="text-sm text-gray">
              {new Date(post.publishedAt as string).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy leading-tight">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-3 text-navy/60">
              {locale === 'ru' ? 'Автор:' : 'By'} {post.author}
            </p>
          )}
        </header>

        {/* Hero image */}
        {heroUrl && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10">
            <Image
              src={fullHeroUrl}
              alt={post.title as string}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-navy prose-p:text-navy/80">
          {post.content && (
            <RichText data={post.content} />
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 bg-gold/5 border border-gold/20 rounded-xl text-center">
          <p className="text-lg font-heading font-semibold text-navy mb-3">
            {locale === 'ru'
              ? 'Хотите увидеть Прагу своими глазами?'
              : 'Want to see Prague for yourself?'}
          </p>
          <Link
            href={`/${locale}/tours`}
            className="inline-flex items-center px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
          >
            {locale === 'ru' ? 'Смотреть экскурсии' : 'Explore Our Tours'}
          </Link>
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-8 border-t border-gray-light/50">
          <h2 className="text-2xl font-heading font-bold text-navy mb-6">
            {locale === 'ru' ? 'Читайте также' : 'You May Also Like'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((related: any) => {
              const relImg = typeof related.heroImage === 'object' ? related.heroImage : null
              const relImgUrl = relImg?.sizes?.card?.url || relImg?.url || ''
              const fullRelImgUrl = relImgUrl.startsWith('http') ? relImgUrl : `${SERVER_URL}${relImgUrl}`
              return (
                <Link
                  key={related.id}
                  href={`/${locale}/blog/${related.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
                    {relImgUrl ? (
                      <Image
                        src={fullRelImgUrl}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-light" />
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-navy group-hover:text-gold transition-colors">
                    {related.title}
                  </h3>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Schema.org JSON-LD */}
      <BlogPostSchema
        title={post.title as string}
        description={post.excerpt as string}
        image={heroUrl ? fullHeroUrl : undefined}
        datePublished={post.publishedAt as string}
        dateModified={post.updatedAt as string}
        author={post.author as string || 'Uliana Formina'}
        locale={locale}
        slug={slug}
      />
    </div>
  )
}
