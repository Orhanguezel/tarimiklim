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
  const baseMeta: Metadata = {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale,
      type: 'website',
      url: `${base}/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
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
