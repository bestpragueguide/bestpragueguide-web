import { JsonLd } from './JsonLd'

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Best Prague Guide',
    url: 'https://bestpragueguide.com',
    description:
      'Private tours in Prague from a guide with 17 years of experience.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Prague',
      addressCountry: 'CZ',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+420-776-306-858',
      contactType: 'customer service',
      availableLanguage: ['English', 'Russian'],
    },
    email: 'info@bestpragueguide.com',
    sameAs: [
      'https://wa.me/420776306858',
      'https://t.me/bestpragueguide',
    ],
  }

  return <JsonLd data={data} />
}
