import { JsonLd } from './JsonLd'

interface ItemListSchemaProps {
  items: Array<{ url: string; name: string }>
  baseUrl?: string
}

export function ItemListSchema({ items, baseUrl = 'https://bestpragueguide.com' }: ItemListSchemaProps) {
  if (!items.length) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
      name: item.name,
    })),
  }

  return <JsonLd data={data} />
}
