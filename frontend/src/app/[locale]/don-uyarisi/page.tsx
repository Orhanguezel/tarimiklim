import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WeatherDashboard } from '@/components/WeatherDashboard';
import { AlertBar } from '@/components/sections/AlertBar';
import { SiteNav } from '@/components/sections/SiteNav';
import { SiteFooter } from '@/components/sections/SiteFooter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: true, follow: true },
  };
}

export default async function PanelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <main className="premium-shell">
      <AlertBar />
      <SiteNav locale={locale} />
      <section className="container-wide container-section">
        <WeatherDashboard />
      </section>
      <SiteFooter />
    </main>
  );
}
