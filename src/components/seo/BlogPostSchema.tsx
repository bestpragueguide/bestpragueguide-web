import { JsonLd } from './JsonLd'

interface BlogPostSchemaProps {
  title: string
  description: string
  image?: string
  datePublished: string
  dateModified?: string
  author: string
  locale: string
  slug: string
  category?: string
}

export function BlogPostSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author,
  locale,
  slug,
  category,
}: BlogPostSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
  const url = `${baseUrl}/${locale}/blog/${slug}`

  // Truncate headline to 110 chars (Google's limit)
  const headline = title.length > 110 ? title.substring(0, 107) + '...' : title

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    inLanguage: locale === 'ru' ? 'ru' : 'en',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@id': `${baseUrl}/#person-uliana`,
    },
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  }

  if (image) data.image = image
  if (category) data.articleSection = category

  return <JsonLd data={data} />
}
