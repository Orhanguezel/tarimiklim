import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WeatherDashboard } from '@/components/WeatherDashboard';
import { CityProvinceLinks } from '@/components/city/CityProvinceLinks';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const baseMeta: Metadata = {
    title: t('title'),
    description: t('description'),
    robots: { index: true, follow: true },
  };
  const seo = await fetchPageSeo('don-uyarisi', locale);
  return mergePageMetadata(baseMeta, seo, locale, `/${locale}/don-uyarisi`);
}

export default async function PanelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <section className="panel-shell">
      <WeatherDashboard />
      <CityProvinceLinks variant="don-uyarisi" locale={locale} />
    </section>
  );
}
