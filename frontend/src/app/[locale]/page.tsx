import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AlertBar } from '@/components/sections/AlertBar';
import { SiteNav } from '@/components/sections/SiteNav';
import { HeroSection } from '@/components/sections/HeroSection';
import { Ticker } from '@/components/sections/Ticker';
import { DashboardSection } from '@/components/sections/DashboardSection';
import { PillarsSection } from '@/components/sections/PillarsSection';
import { ApiWidgetSection } from '@/components/sections/ApiWidgetSection';
import { StatsStrip } from '@/components/sections/StatsStrip';
import { EcosystemGrid } from '@/components/sections/EcosystemGrid';
import { FinalCta } from '@/components/sections/FinalCta';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { buildWeatherForecastJsonLd } from '@/lib/weather-jsonld';
import { buildCombinedJsonLd } from '@/lib/site-jsonld';
import { fetchSiteMedia } from '@/lib/site-settings';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3088';
  return {
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
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [weatherLd, siteLd, media] = await Promise.all([
    buildWeatherForecastJsonLd(),
    Promise.resolve(buildCombinedJsonLd(locale)),
    fetchSiteMedia(locale),
  ]);

  return (
    <>
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

      {/* FAZ 2 — Statik bölümler */}
      <AlertBar />
      <SiteNav locale={locale} logoUrl={media.logo} />

      <main id="top">
        {/* FAZ 3 — Etkileşimli bölümler */}
        <HeroSection />
        <Ticker />

        {/* Dashboard — dark band */}
        <section className="dashboard-band">
          <DashboardSection />
        </section>

        {/* FAZ 2 — Statik bölümler */}
        <PillarsSection />
        <ApiWidgetSection />

        {/* Stats — dark band */}
        <section className="stats-band">
          <StatsStrip />
        </section>

        <EcosystemGrid />
        <FinalCta />
      </main>

      <SiteFooter logoUrl={media.logo} />
    </>
  );
}
