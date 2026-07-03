import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DynamicHomeSections } from '@/components/sections/DynamicHomeSections';
import { buildWeatherForecastJsonLd } from '@/lib/weather-jsonld';
import { buildCombinedJsonLd } from '@/lib/site-jsonld';
import { fetchSiteMedia } from '@/lib/site-settings';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';
import { getPublicSiteUrl } from '@/lib/public-brand';
import { SectionScroll } from '@/components/SectionScroll';
import { fetchHomeSections } from '@/lib/home-sections';
import { fetchNavigation } from '@/lib/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const base = getPublicSiteUrl();
  const description =
    locale === 'en'
      ? 'Tarım İklim provides 7-day agricultural weather forecasts, frost-risk scores and location-based alerts for growers across all 81 provinces of Türkiye.'
      : 'Tarım İklim; 81 il için 7 günlük tarımsal hava tahmini, zirai don riski skoru ve konum bazlı üretici uyarıları sunar.';
  const baseMeta: Metadata = {
    title: t('title'),
    description,
    openGraph: {
      title: t('title'),
      description,
      locale,
      type: 'website',
      url: `${base}/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description,
      images: [`${base}/brand/og-image.png`],
    },
  };
  const seo = await fetchPageSeo('home', locale);
  return mergePageMetadata(baseMeta, seo, locale, `/${locale}`);
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [weatherLd, siteLd, media, homeSections, navigation] = await Promise.all([
    buildWeatherForecastJsonLd(),
    Promise.resolve(buildCombinedJsonLd(locale)),
    fetchSiteMedia(locale),
    fetchHomeSections(),
    fetchNavigation(locale),
  ]);

  return (
    <>
      <SectionScroll />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
      />
      {weatherLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(weatherLd) }}
        />
      ) : null}

      <main id="top">
        <DynamicHomeSections sections={homeSections} locale={locale} />
      </main>
    </>
  );
}
