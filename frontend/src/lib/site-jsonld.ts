import { getOrganizationDefaults, getPublicAppName, getPublicSiteUrl, getServiceDefaults } from '@/lib/public-brand';

const SITE = () => getPublicSiteUrl();

function optionalParentOrg(name: string | undefined) {
  const n = String(name || '').trim();
  if (!n) return undefined;
  return { '@type': 'Organization' as const, name: n };
}

export function organizationJsonLd(): Record<string, unknown> {
  const app = getPublicAppName();
  const org = getOrganizationDefaults();
  const base = SITE();
  const logoPath = String(org.logoPath || '/brand/og-image.svg').replace(/^\//, '');
  const sameAs = Array.isArray(org.sameAs) ? org.sameAs.filter((u) => String(u).trim()) : [];
  const parent = optionalParentOrg(org.parentOrganizationName);

  const out: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: app,
    url: base,
    logo: `${base}/${logoPath}`,
    description: org.description || undefined,
    areaServed: { '@type': 'Country', name: 'Türkiye' },
    address: {
      '@type': 'PostalAddress',
      addressCountry: org.addressCountry || 'TR',
      ...(org.addressLocality ? { addressLocality: org.addressLocality } : {}),
    },
  };

  const email = String(org.email || '').trim();
  if (email) out.email = email;
  const fd = String(org.foundingDate || '').trim();
  if (fd) out.foundingDate = fd;
  if (sameAs.length) out.sameAs = sameAs;
  if (parent) out.parentOrganization = parent;

  return out;
}

export function websiteJsonLd(locale: string): Record<string, unknown> {
  const app = getPublicAppName();
  const base = SITE();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: app,
    url: `${base}/${locale}`,
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${base}/${locale}/don-uyarisi?location={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: { '@type': 'Organization', name: app },
  };
}

export function serviceJsonLd(): Record<string, unknown> {
  const app = getPublicAppName();
  const svc = getServiceDefaults();
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: svc.apiPublicName || `${app} API`,
    serviceType: svc.serviceTypeEn || 'Weather API',
    provider: { '@type': 'Organization', name: app },
    areaServed: { '@type': 'Country', name: 'Türkiye' },
    offers: [
      {
        '@type': 'Offer',
        name: 'Developer',
        price: '0',
        priceCurrency: 'TRY',
        description: svc.developerOfferDescription || '',
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
