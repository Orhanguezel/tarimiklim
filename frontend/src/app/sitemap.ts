import type { MetadataRoute } from 'next';
import { PROVINCES } from '@/lib/provinces';
import { CITY_VARIANTS } from '@/lib/city-pages';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tarimiklim.com';
const LOCALES = ['tr', 'en'] as const;

function localizedAlternates(path = '') {
  return {
    languages: {
      ...Object.fromEntries(LOCALES.map((locale) => [locale, `${SITE}/${locale}${path}`])),
      'x-default': `${SITE}/tr${path}`,
    },
  };
}

// Locale-bağımsız statik içerik sayfaları (hreflang ile birlikte)
const STATIC_PATHS: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '', priority: 1, freq: 'hourly' },
  { path: '/don-uyarisi', priority: 0.9, freq: 'hourly' },
  { path: '/hava-durumu', priority: 0.8, freq: 'daily' },
  { path: '/7-gunluk-tahmin', priority: 0.8, freq: 'daily' },
  { path: '/hakkimizda', priority: 0.4, freq: 'monthly' },
  { path: '/iletisim', priority: 0.4, freq: 'monthly' },
  { path: '/api-docs', priority: 0.5, freq: 'monthly' },
  { path: '/zirai-don-riski-nasil-hesaplanir', priority: 0.7, freq: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const { path, priority, freq } of STATIC_PATHS) {
      entries.push({
        url: `${SITE}/${locale}${path}`,
        changeFrequency: freq,
        priority: locale === 'tr' ? priority : Math.max(0.3, priority - 0.2),
        alternates: localizedAlternates(path),
      });
    }

    // Programatik şehir sayfaları: 81 il × 3 sayfa türü
    for (const variant of CITY_VARIANTS) {
      for (const province of PROVINCES) {
        const path = `/${variant}/${province.slug}`;
        entries.push({
          url: `${SITE}/${locale}${path}`,
          changeFrequency: 'daily',
          priority: locale === 'tr' ? 0.7 : 0.5,
          alternates: localizedAlternates(path),
        });
      }
    }
  }

  return entries;
}
