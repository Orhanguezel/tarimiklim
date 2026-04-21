import { WeatherWidget } from '@/components/widget/WeatherWidget';

interface Props {
  searchParams: Promise<{ location?: string; api?: string }>;
}

export default async function BereketfideWidgetPage({ searchParams }: Props) {
  const { location = 'auto', api } = await searchParams;

  return (
    <main style={{ padding: '0.5rem', background: 'transparent' }}>
      <WeatherWidget
        location={location}
        brand="bereketfide"
        apiBase={api}
      />
    </main>
  );
}
