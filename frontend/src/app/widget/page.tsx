import type { Metadata } from 'next';
import { WeatherWidget } from '@/components/widget/WeatherWidget';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';

interface Props {
  searchParams: Promise<{ location?: string; api?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const baseMeta: Metadata = {
    title: 'Tarim Iklim Hava Widget | Tarim Iklim',
    description: 'Her web sitesine gomulebilir hava durumu ve don riski widgeti.',
    robots: { index: false, follow: false },
  };
  const seo = await fetchPageSeo('widget', 'tr');
  return mergePageMetadata(baseMeta, seo, 'tr', '/widget');
}

export default async function WidgetPage({ searchParams }: Props) {
  const { location = 'auto', api } = await searchParams;

  return (
    <main style={{ padding: '0.5rem', background: 'transparent' }}>
      <WeatherWidget
        location={location}
        brand="tarimiklim"
        apiBase={api}
      />
    </main>
  );
}
