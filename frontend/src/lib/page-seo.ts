import type { Metadata } from 'next';
import { API_URL } from '@/lib/site-settings';
import { getPublicSiteUrl } from '@/lib/public-brand';
import { fetchPageSeoFromApi, mergePageMetadata as mergeSharedMetadata } from '@agro/shared-frontend/seo';

type SeoPayload = {
  title?: string;
  description?: string;
  og_image?: string;
  no_index?: boolean;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
};

export async function fetchPageSeo(pageKey: string, locale: string): Promise<SeoPayload | null> {
  return fetchPageSeoFromApi({ apiUrl: API_URL, pageKey, locale, revalidateSeconds: 60 }) as Promise<SeoPayload | null>;
}

function normalizePath(path: string, locale: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  const withoutLocale = withSlash.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';
  return withoutLocale === '/' ? '' : withoutLocale.replace(/\/+$/, '');
}

function buildAlternates(site: string, locale: string, path: string): NonNullable<Metadata['alternates']> {
  const cleanPath = normalizePath(path, locale);
  return {
    canonical: `${site}/${locale}${cleanPath}`,
    languages: {
      tr: `${site}/tr${cleanPath}`,
      en: `${site}/en${cleanPath}`,
      'x-default': `${site}/tr${cleanPath}`,
    },
  };
}

export function mergePageMetadata(base: Metadata, seo: SeoPayload | null, locale: string, path = `/${locale}`): Metadata {
  const site = getPublicSiteUrl();
  const alternates = buildAlternates(site, locale, path);
  const pageUrl = String(alternates.canonical);
  if (!seo) {
    return {
      ...base,
      alternates: {
        ...base.alternates,
        ...alternates,
      },
      openGraph: {
        ...base.openGraph,
        url: pageUrl,
        locale,
      },
    };
  }

  const robots =
    seo.robots ??
    (typeof seo.no_index === 'boolean'
      ? { index: !seo.no_index, follow: !seo.no_index }
      : base.robots);

  // shared-frontend merge handles title/description + OG/Twitter; we layer og_image if present.
  const merged = mergeSharedMetadata(
    { ...base, robots },
    { title: seo.title, description: seo.description },
    locale,
    site, // siteUrl param expects site origin
  );

  const ogImage = seo.og_image?.trim().replace(/\/brand\/og-image\.svg$/, '/brand/og-image.png');
  const withCanonical: Metadata = {
    ...merged,
    alternates: {
      ...merged.alternates,
      ...alternates,
    },
    openGraph: {
      ...merged.openGraph,
      url: pageUrl,
      locale,
    },
  };

  return ogImage
    ? {
        ...withCanonical,
        openGraph: {
          ...withCanonical.openGraph,
          images: [{ url: ogImage, width: 1200, height: 630 }],
        },
        twitter: {
          ...withCanonical.twitter,
          images: [ogImage],
        },
      }
    : withCanonical;
}
