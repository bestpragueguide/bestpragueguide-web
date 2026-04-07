export const dynamic = 'force-dynamic'
export const revalidate = 3600

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { BlogCategoryFilter } from '@/components/blog/BlogCategoryFilter'
import { extractPlainText } from '@/components/shared/SafeRichText'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('blogTitle')
  const description = t('blogDesc')

  return {
    title,
    description,
    ...buildPageMetadata(locale, 'blog', { title, description }),
  }
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category: selectedCategory } = await searchParams
  const tPages = await getTranslations({ locale, namespace: 'pages' })

  let allPosts: any[] = []
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        status: { equals: 'published' },
        publishedLocales: { in: [locale] },
      },
      limit: 200,
      locale: locale as 'en' | 'ru',
      sort: '-publishedAt',
    })
    allPosts = result.docs
  } catch {
    // No posts yet
  }

  // Extract available categories from all posts
  const availableCategories = [...new Set(allPosts.map((p: any) => p.category as string))].filter(Boolean)

  // Filter posts by selected category (server-side)
  const posts = selectedCategory
    ? allPosts.filter((p: any) => p.category === selectedCategory)
    : allPosts

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: tPages('blogBreadcrumb') }]}
        locale={locale}
      />

      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-8">
        {tPages('blogHeading')}
      </h1>

      {availableCategories.length > 1 && (
        <BlogCategoryFilter
          availableCategories={availableCategories}
          locale={locale}
        />
      )}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => {
            const heroImage = typeof post.heroImage === 'object' ? post.heroImage : null
            const imageUrl = heroImage?.sizes?.card?.url || heroImage?.url || ''
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SERVER_URL}${imageUrl}`

            return (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="group block bg-white rounded-xl overflow-hidden border border-gray-light/50 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={fullImageUrl}
                      alt={heroImage?.alt || post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-light" />
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-heading font-semibold text-navy group-hover:text-gold transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-navy/70 line-clamp-3">
                    {extractPlainText(post.excerpt)}
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-gold">
                    {tPages('blogReadMore')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray">
          <p className="text-lg">
            {selectedCategory ? tPages('blogNoArticles') : tPages('blogComingSoon')}
          </p>
        </div>
      )}
    </div>
  )
}
