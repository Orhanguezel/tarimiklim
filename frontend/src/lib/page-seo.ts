import type { Metadata } from 'next';
import { API_URL } from '@/lib/site-settings';
import { getPublicSiteUrl } from '@/lib/public-brand';

type SeoPayload = {
  title?: string;
  description?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
};

export async function fetchPageSeo(pageKey: string, locale: string): Promise<SeoPayload | null> {
  try {
    const qs = new URLSearchParams({ locale });
    const res = await fetch(`${API_URL}/site_settings/page-seo/${encodeURIComponent(pageKey)}?${qs}`, {
      next: { revalidate: 60, tags: ['page-seo', `page-seo:${pageKey}`] },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SeoPayload;
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

export function mergePageMetadata(base: Metadata, seo: SeoPayload | null, locale: string): Metadata {
  if (!seo) return base;
  const site = getPublicSiteUrl();
  const title = seo.title?.trim() || base.title;
  const description = seo.description?.trim() || base.description;

  return {
    ...base,
    title,
    description,
    robots: seo.robots ?? base.robots,
    openGraph: {
      ...base.openGraph,
      title: typeof title === 'string' ? title : undefined,
      description: typeof description === 'string' ? description : undefined,
      locale,
      url: `${site}/${locale}`,
    },
    twitter: {
      ...base.twitter,
      title: typeof title === 'string' ? title : undefined,
      description: typeof description === 'string' ? description : undefined,
    },
  };
}
