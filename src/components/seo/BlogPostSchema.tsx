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
  const url = `https://bestpragueguide.com/${locale}/blog/${slug}`

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
      url: 'https://bestpragueguide.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bestpragueguide.com/favicon.svg',
      },
    },
  }

  if (image) {
    data.image = image
  }

  return <JsonLd data={data} />
}
