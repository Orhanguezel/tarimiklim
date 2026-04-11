import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { WeatherDashboard } from '@/components/WeatherDashboard';
import { buildWeatherForecastJsonLd } from '@/lib/weather-jsonld';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const jsonLd = await buildWeatherForecastJsonLd();

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
        {t('title')}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        {t('description')}
      </p>
      <WeatherDashboard />
    </main>
  );
}
