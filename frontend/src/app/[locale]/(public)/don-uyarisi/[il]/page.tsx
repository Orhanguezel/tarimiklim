import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildCityMetadata } from '@/lib/city-pages';
import { getProvince, PRIORITY_PROVINCE_SLUGS } from '@/lib/provinces';
import { CityWeatherView } from '@/components/city/CityWeatherView';

export const revalidate = 1800;
export const dynamicParams = true;

const LOCALES = ['tr', 'en'] as const;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PRIORITY_PROVINCE_SLUGS.map((il) => ({ locale, il })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; il: string }>;
}): Promise<Metadata> {
  const { locale, il } = await params;
  const province = getProvince(il);
  if (!province) return {};
  return buildCityMetadata('don-uyarisi', locale, province);
}

export default async function DonUyarisiCityPage({
  params,
}: {
  params: Promise<{ locale: string; il: string }>;
}) {
  const { locale, il } = await params;
  const province = getProvince(il);
  if (!province) notFound();
  return (
    <section className="panel-shell">
      <CityWeatherView variant="don-uyarisi" locale={locale} province={province} />
    </section>
  );
}
