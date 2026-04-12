export const dynamic = 'force-dynamic'
export const revalidate = 3600

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { BlogCategoryFilter } from '@/components/blog/BlogCategoryFilter'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { extractPlainText } from '@/components/shared/SafeRichText'
import { ItemListSchema } from '@/components/seo/ItemListSchema'

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
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
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
      limit: 0,
      locale: locale as 'en' | 'ru',
      sort: '-publishedAt',
    })
    allPosts = result.docs
  } catch {
    // No posts yet
  }

  // Extract available categories
  const availableCategories = [...new Set(allPosts.map((p: any) => p.category as string))].filter(Boolean)

  // Sort: posts with hero images first
  const sorted = [...allPosts].sort((a: any, b: any) => {
    const aHasImage = typeof a.heroImage === 'object' && a.heroImage?.url ? 1 : 0
    const bHasImage = typeof b.heroImage === 'object' && b.heroImage?.url ? 1 : 0
    return bHasImage - aHasImage
  })

  // Serialize posts for client component
  const posts = sorted.map((post: any) => {
    const heroImage = typeof post.heroImage === 'object' ? post.heroImage : null
    const imageUrl = heroImage?.sizes?.card?.url || heroImage?.url || ''
    const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${SERVER_URL}${imageUrl}`) : ''
    return {
      id: post.id as number,
      title: post.title as string,
      slug: post.slug as string,
      excerpt: extractPlainText(post.excerpt),
      category: post.category as string,
      heroImageUrl: fullImageUrl,
      heroAlt: (heroImage?.alt || post.title || '') as string,
    }
  })

  const blogItemList = posts.map((p) => ({ url: `/${locale}/blog/${p.slug}`, name: p.title }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ItemListSchema items={blogItemList} />
      <Breadcrumbs
        items={[{ label: tPages('blogBreadcrumb') }]}
        locale={locale}
      />

      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-8">
        {tPages('blogHeading')}
      </h1>

      <Suspense fallback={null}>
        {availableCategories.length > 1 && (
          <BlogCategoryFilter
            availableCategories={availableCategories}
            locale={locale}
          />
        )}
        <BlogGrid posts={posts} locale={locale} />
      </Suspense>
    </div>
  )
}
