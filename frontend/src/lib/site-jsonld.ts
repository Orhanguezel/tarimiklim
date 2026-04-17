const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tarimiklim.com';

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TarımİKlim',
    alternateName: 'Tarım İklim',
    url: SITE,
    logo: `${SITE}/brand/og-image.svg`,
    description:
      'Türkiye çiftçisi için 7 günlük hava tahmini, don riski erken uyarı ve sulama planlama servisi. Vista tarım teknolojisi ekosisteminin Katman 4 veri altyapısı.',
    email: 'destek@tarimiklim.com',
    foundingDate: '2026',
    areaServed: { '@type': 'Country', name: 'Türkiye' },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'Ankara',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Vista İnşaat Tarım Teknolojileri A.Ş.',
    },
    sameAs: [
      'https://github.com/Orhanguezel/tarimiklim',
      'https://bereketfide.com',
      'https://vistaseeds.com.tr',
    ],
  };
}

export function websiteJsonLd(locale: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TarımİKlim',
    url: `${SITE}/${locale}`,
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE}/${locale}/don-uyarisi?location={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: { '@type': 'Organization', name: 'TarımİKlim' },
  };
}

export function serviceJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'TarımİKlim API',
    serviceType: 'Weather forecasting API for agriculture',
    provider: { '@type': 'Organization', name: 'TarımİKlim' },
    areaServed: { '@type': 'Country', name: 'Türkiye' },
    offers: [
      {
        '@type': 'Offer',
        name: 'Developer',
        price: '0',
        priceCurrency: 'TRY',
        description: 'Ücretsiz tier: 100k istek/ay, tüm endpoint erişimi',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Endpoint kataloğu',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'GET /v1/weather' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'GET /v1/weather/frost-risk' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'GET /v1/weather/rain-forecast' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'GET /v1/weather/widget-data' } },
      ],
    },
  };
}

export function buildCombinedJsonLd(locale: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd(), websiteJsonLd(locale), serviceJsonLd()],
  };
}
