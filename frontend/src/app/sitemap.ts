import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tarimiklim.com';
const LOCALES = ['tr', 'en'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: `${SITE}/${locale}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: locale === 'tr' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}`])),
      },
    });
    entries.push({
      url: `${SITE}/${locale}/don-uyarisi`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    });
  }

  entries.push({
    url: `${SITE}/widget/bereketfide`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.4,
  });
  entries.push({
    url: `${SITE}/widget/vistaseed`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.4,
  });

  return entries;
}
