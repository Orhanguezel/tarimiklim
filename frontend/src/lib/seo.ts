import type { Metadata } from 'next';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';

type Options = Metadata & {
  locale: string;
  pathname?: string;
};

export async function getPageMetadata(pageKey: string, options: Options): Promise<Metadata> {
  const { locale, pathname, ...base } = options;
  const seo = await fetchPageSeo(pageKey, locale);
  return mergePageMetadata(base, seo, locale, pathname ? `/${locale}${pathname}` : `/${locale}`);
}
