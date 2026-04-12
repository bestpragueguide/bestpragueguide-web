'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  heroImageUrl: string
  heroAlt: string
}

interface BlogGridProps {
  posts: BlogPost[]
  locale: string
}

export function BlogGrid({ posts, locale }: BlogGridProps) {
  const searchParams = useSearchParams()
  const tPages = useTranslations('pages')
  const category = searchParams.get('category')
  const query = (searchParams.get('q') || '').toLowerCase().trim()

  const filtered = posts.filter((post) => {
    if (category && category !== 'all' && post.category !== category) return false
    if (query) {
      const searchable = `${post.title} ${post.excerpt} ${post.slug}`.toLowerCase()
      const words = query.split(/\s+/)
      if (!words.every(w => searchable.includes(w))) return false
    }
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-gray">
        <p className="text-lg">
          {query
            ? tPages('blogNoResults')
            : category
              ? tPages('blogNoArticles')
              : tPages('blogComingSoon')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filtered.map((post) => (
        <Link
          key={post.id}
          href={`/${locale}/blog/${post.slug}`}
          className="group block bg-white rounded-xl overflow-hidden border border-gray-light/50 hover:shadow-lg transition-shadow duration-300"
        >
          {post.heroImageUrl && (
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={post.heroImageUrl}
                alt={post.heroAlt || post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-5">
            <h2 className="text-lg font-heading font-semibold text-navy group-hover:text-gold transition-colors">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-navy/70 line-clamp-3">
              {post.excerpt}
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-gold">
              {tPages('blogReadMore')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
