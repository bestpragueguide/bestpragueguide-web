import { JsonLd } from './JsonLd'

interface WebSiteSchemaProps {
  locale: string
}

export function WebSiteSchema({ locale }: WebSiteSchemaProps) {
  const name = locale === 'ru'
    ? 'Best Prague Guide — Частные экскурсии по Праге'
    : 'Best Prague Guide — Private Tours in Prague'
  const description = locale === 'ru'
    ? 'Индивидуальные экскурсии по Праге с лицензированным гидом высшей категории.'
    : 'Private tours in Prague with a highest-category licensed guide.'

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: 'https://bestpragueguide.com',
    description,
    inLanguage: ['en', 'ru'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://bestpragueguide.com/${locale}/${locale === 'ru' ? 'ekskursii' : 'tours'}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return <JsonLd data={data} />
}
