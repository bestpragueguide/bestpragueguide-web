import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  locale: string
}

function BreadcrumbSchema({ items, locale }: BreadcrumbsProps) {
  const fullItems = [
    { label: locale === 'ru' ? 'Главная' : 'Home', href: `/${locale}` },
    ...items,
  ]

  // All data is from server-side props, not user input — safe for JSON-LD
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fullItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `https://bestpragueguide.com${item.href}` }
        : {}),
    })),
  })

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
}

export function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  const fullItems = [
    { label: locale === 'ru' ? 'Главная' : 'Home', href: `/${locale}` },
    ...items,
  ]

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray">
        {fullItems.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            {item.href && index < fullItems.length - 1 ? (
              <Link href={item.href} className="hover:text-navy transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-navy font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
      <BreadcrumbSchema items={items} locale={locale} />
    </nav>
  )
}
