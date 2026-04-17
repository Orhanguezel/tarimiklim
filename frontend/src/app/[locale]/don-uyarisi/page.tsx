import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WeatherDashboard } from '@/components/WeatherDashboard';
import { AlertBar } from '@/components/sections/AlertBar';
import { SiteNav } from '@/components/sections/SiteNav';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { fetchSiteMedia } from '@/lib/site-settings';

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
  const media = await fetchSiteMedia(locale);
  return (
    <main className="premium-shell">
      <AlertBar />
      <SiteNav locale={locale} logoUrl={media.logo} />
      <section className="panel-shell">
        <WeatherDashboard />
      </section>
      <SiteFooter logoUrl={media.logo} />
    </main>
  );
}
