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
}: BlogPostSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
  const url = `${baseUrl}/${locale}/blog/${slug}`

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    inLanguage: locale === 'ru' ? 'ru-RU' : 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Best Prague Guide',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/favicon.svg`,
      },
    },
  }

  if (image) {
    data.image = image
  }

  return <JsonLd data={data} />
}
