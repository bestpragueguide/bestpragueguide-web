'use client'

import { useState } from 'react'
import { BlogCategoryFilter } from './BlogCategoryFilter'
import { BlogGrid } from './BlogGrid'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  heroImageUrl: string
  heroAlt: string
}

interface BlogCatalogProps {
  posts: BlogPost[]
  locale: string
  availableCategories: string[]
}

export function BlogCatalog({ posts, locale, availableCategories }: BlogCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      {availableCategories.length > 1 && (
        <BlogCategoryFilter
          availableCategories={availableCategories}
          locale={locale}
          onSearch={setSearchQuery}
        />
      )}
      <BlogGrid posts={posts} locale={locale} searchQuery={searchQuery} />
    </>
  )
}
