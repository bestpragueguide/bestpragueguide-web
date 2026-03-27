import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getTranslations } from 'next-intl/server'
import { extractPlainText } from '@/components/shared/SafeRichText'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { ShareButtons } from '@/components/shared/ShareButtons'
import { BlogPostSchema } from '@/components/seo/BlogPostSchema'
import { categoryLabels, allCategories } from '@/lib/blog'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

export const revalidate = 3600

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
    const publishedLocales = (post as any).publishedLocales || []
    const hasOtherLocale = publishedLocales.includes(otherLocale)

    // Fetch slug in other locale only if post is published there
    let otherSlug = slug
    if (hasOtherLocale) {
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
    }

    const enSlug = locale === 'en' ? slug : otherSlug
    const ruSlug = locale === 'ru' ? slug : otherSlug

    // Only include hreflang alternate if post is published in the other locale
    const languages: Record<string, string> = {
      [locale]: `${baseUrl}/${locale}/blog/${slug}`,
    }
    if (hasOtherLocale) {
      languages.en = `${baseUrl}/en/blog/${enSlug}`
      languages.ru = `${baseUrl}/ru/blog/${ruSlug}`
    }

    const fullOgImage = ogImageUrl
      ? (ogImageUrl.startsWith('http') ? ogImageUrl : `${baseUrl}${ogImageUrl}`)
      : `${baseUrl}/og-default.jpg`

    return {
      title: seo?.metaTitle || `${post.title} — Best Prague Guide`,
      description: seo?.metaDescription || extractPlainText(post.excerpt),
      alternates: {
        canonical: `${baseUrl}/${locale}/blog/${slug}`,
        languages,
      },
      openGraph: {
        title: seo?.metaTitle || post.title,
        description: seo?.metaDescription || extractPlainText(post.excerpt),
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
        description: seo?.metaDescription || extractPlainText(post.excerpt),
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
  const tPages = await getTranslations({ locale, namespace: 'pages' })

  const heroImage = typeof post.heroImage === 'object' ? post.heroImage : null
  const heroUrl = heroImage?.sizes?.hero?.url || heroImage?.url || ''
  const fullHeroUrl = heroUrl.startsWith('http') ? heroUrl : `${SERVER_URL}${heroUrl}`

  // Fetch all published posts for sidebar (categories + popular)
  let allPosts: any[] = []
  try {
    const allResult = await payload.find({
      collection: 'blog-posts',
      where: {
        status: { equals: 'published' },
        publishedLocales: { in: [locale] },
      },
      limit: 50,
      locale: locale as 'en' | 'ru',
      sort: '-publishedAt',
    })
    allPosts = allResult.docs
  } catch {
    // Sidebar data unavailable
  }

  // Category counts
  const categoryCounts: Record<string, number> = {}
  for (const p of allPosts) {
    const cat = p.category as string
    if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  }

  // Popular articles: 3 most recent excluding current
  const popularPosts = allPosts.filter((p: any) => p.id !== post.id).slice(0, 3)

  // Related posts in same category (for bottom section)
  const relatedPosts = allPosts
    .filter((p: any) => p.id !== post.id && p.category === post.category)
    .slice(0, 3)

  const labels = categoryLabels[locale] || categoryLabels.en

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: tPages('blogBreadcrumb'), href: `/${locale}/blog` },
          { label: post.title as string },
        ]}
        locale={locale}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        {/* Main content */}
        <div>
          <article>
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-gold/10 text-gold text-xs font-medium rounded">
                  {labels[post.category as string] || post.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy leading-tight">
                {post.title}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs text-navy/40">{tPages('share')}:</span>
                <ShareButtons
                  url={`${process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'}/${locale}/blog/${slug}`}
                  title={post.title as string}
                  locale={locale}
                />
              </div>
            </header>

            {/* Hero image */}
            {heroUrl && (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10">
                <Image
                  src={fullHeroUrl}
                  alt={post.title as string}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 700px"
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

            {/* CTA (mobile — shown below content, hidden on lg where sidebar has CTA) */}
            <div className="mt-12 p-6 bg-gold/5 border border-gold/20 rounded-xl text-center lg:hidden">
              <p className="text-lg font-heading font-semibold text-navy mb-3">
                {tPages('blogCtaHeading')}
              </p>
              <Link
                href={`/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}`}
                className="inline-flex items-center px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
              >
                {tPages('blogCtaButton')}
              </Link>
            </div>
          </article>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-16 pt-8 border-t border-gray-light/50">
              <h2 className="text-2xl font-heading font-bold text-navy mb-6">
                {tPages('blogRelated')}
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
                            loading="lazy"
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
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-light/50 p-5">
              <h3 className="font-heading font-bold text-navy mb-4">
                {tPages('blogCategories')}
              </h3>
              <ul className="space-y-2">
                {allCategories
                  .filter((cat) => categoryCounts[cat])
                  .map((cat) => (
                    <li key={cat}>
                      <Link
                        href={`/${locale}/blog?category=${cat}`}
                        className="flex items-center justify-between text-sm text-navy/80 hover:text-gold transition-colors"
                      >
                        <span>{labels[cat] || cat}</span>
                        <span className="text-xs text-navy/40">{categoryCounts[cat]}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Popular Articles */}
            {popularPosts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-light/50 p-5">
                <h3 className="font-heading font-bold text-navy mb-4">
                  {tPages('blogPopular')}
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((p: any) => {
                    const img = typeof p.heroImage === 'object' ? p.heroImage : null
                    const imgUrl = img?.sizes?.card?.url || img?.url || ''
                    const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${SERVER_URL}${imgUrl}`
                    return (
                      <Link
                        key={p.id}
                        href={`/${locale}/blog/${p.slug}`}
                        className="group flex gap-3"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          {imgUrl ? (
                            <Image
                              src={fullImgUrl}
                              alt={p.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-light" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-navy group-hover:text-gold transition-colors line-clamp-3">
                          {p.title}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Choose a Tour CTA */}
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-5 text-center">
              <p className="font-heading font-semibold text-navy mb-3">
                {tPages('blogCtaHeading')}
              </p>
              <Link
                href={`/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}`}
                className="inline-flex items-center px-5 py-2.5 bg-gold text-white text-sm font-medium rounded-lg hover:bg-gold-dark transition-colors"
              >
                {tPages('blogCtaButton')}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Schema.org JSON-LD */}
      <BlogPostSchema
        title={post.title as string}
        description={extractPlainText(post.excerpt)}
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
