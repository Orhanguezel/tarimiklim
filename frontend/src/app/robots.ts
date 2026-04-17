import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tarimiklim.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/widget/*/raw'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
