import type { Metadata } from 'next';
import { WeatherWidget } from '@/components/widget/WeatherWidget';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';

interface Props {
  searchParams: Promise<{ location?: string; api?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const baseMeta: Metadata = {
    title: 'Haldefiyat Hava Widget | Tarim Iklim',
    description: 'Haldefiyat entegrasyonlari icin gomulebilir hava durumu ve don riski widgeti.',
    robots: { index: false, follow: false },
  };
  const seo = await fetchPageSeo('widget-haldefiyat', 'tr');
  return mergePageMetadata(baseMeta, seo, 'tr', '/widget/haldefiyat');
}

export default async function HaldefiyatWidgetPage({ searchParams }: Props) {
  const { location = 'auto', api } = await searchParams;

  return (
    <main style={{ padding: '0.5rem', background: 'transparent' }}>
      <WeatherWidget
        location={location}
        brand="haldefiyat"
        apiBase={api}
      />
    </main>
  );
}
