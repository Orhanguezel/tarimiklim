import type { Metadata } from 'next';
import { buildHubMetadata } from '@/lib/city-pages';
import { CityHubView } from '@/components/city/CityHubView';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildHubMetadata('7-gunluk-tahmin', locale);
}

export default async function YediGunlukHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <section className="panel-shell">
      <CityHubView variant="7-gunluk-tahmin" locale={locale} />
    </section>
  );
}
