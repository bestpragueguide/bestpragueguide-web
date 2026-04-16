import { JsonLd } from './JsonLd'

const BASE_URL = 'https://bestpragueguide.com'

export function OrganizationSchema() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Best Prague Guide',
        alternateName: 'Best Prague Guide — Private Tours',
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/favicon.svg`,
        },
        description: 'Private tours in Prague and the Czech Republic with a licensed top-category guide.',
        founder: { '@id': `${BASE_URL}/#person-uliana` },
        contactPoint: [{
          '@type': 'ContactPoint',
          telephone: '+420776306858',
          contactType: 'customer service',
          email: 'info@bestpragueguide.com',
          availableLanguage: ['English', 'Russian'],
          areaServed: ['Worldwide'],
        }],
        memberOf: [
          { '@type': 'Organization', name: 'Czech Guides Association' },
          { '@type': 'Organization', name: 'Union of Tourist Business' },
          { '@type': 'Organization', name: 'World Federation of Tourist Guide Associations', alternateName: 'WFTGA' },
        ],
        sameAs: [
          'https://www.instagram.com/ulianaisme/',
          'https://wa.me/420776306858',
        ],
        knowsLanguage: ['English', 'Russian', 'Czech'],
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        '@id': `${BASE_URL}/#travelagency`,
        name: 'Best Prague Guide',
        description: 'Private tours in Prague and across the Czech Republic with a licensed top-category guide.',
        url: BASE_URL,
        image: `${BASE_URL}/og-default.jpg`,
        logo: `${BASE_URL}/favicon.svg`,
        telephone: '+420776306858',
        email: 'info@bestpragueguide.com',
        priceRange: '€€',
        currenciesAccepted: 'EUR, CZK, USD',
        paymentAccepted: 'Cash, Credit Card',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Prague',
          addressRegion: 'Prague',
          addressCountry: 'CZ',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 50.0755,
          longitude: 14.4378,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '09:00',
          closes: '20:00',
        },
        areaServed: [
          { '@type': 'City', name: 'Prague', containedInPlace: { '@type': 'Country', name: 'Czech Republic' } },
          { '@type': 'Country', name: 'Czech Republic' },
        ],
        serviceType: ['Private walking tours', 'Private day trips', 'Licensed tour guide services', 'Custom tour planning'],
        knowsLanguage: ['English', 'Russian'],
        founder: { '@id': `${BASE_URL}/#person-uliana` },
        parentOrganization: { '@id': `${BASE_URL}/#organization` },
      }} />
    </>
  )
}
