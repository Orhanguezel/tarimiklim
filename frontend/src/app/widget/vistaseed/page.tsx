import type { Metadata } from 'next';
import { WeatherWidget } from '@/components/widget/WeatherWidget';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';

interface Props {
  searchParams: Promise<{ location?: string; api?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const baseMeta: Metadata = {
    title: 'VistaSeed Hava Widget | Tarim Iklim',
    description: 'VistaSeed web siteleri icin gomulebilir hava durumu ve don riski widgeti.',
    robots: { index: false, follow: false },
  };
  const seo = await fetchPageSeo('widget-vistaseed', 'tr');
  return mergePageMetadata(baseMeta, seo, 'tr', '/widget/vistaseed');
}

export default async function VistaseedWidgetPage({ searchParams }: Props) {
  const { location = 'auto', api } = await searchParams;

  return (
    <main style={{ padding: '0.5rem', background: 'transparent' }}>
      <WeatherWidget
        location={location}
        brand="vistaseed"
        apiBase={api}
      />
    </main>
  );
}
