import type { Metadata } from 'next';
import Link from 'next/link';
import { WeatherDashboard } from '@/components/WeatherDashboard';
import { CityProvinceLinks } from '@/components/city/CityProvinceLinks';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const baseMeta: Metadata = {
    title: isEn ? 'Frost Alert and Agricultural Frost Risk | Tarım İklim' : 'Don Uyarısı ve Zirai Don Riski | Tarım İklim',
    description: isEn
      ? 'Track agricultural frost-risk scores, overnight minimum temperatures and 7-day forecasts by city or location.'
      : 'Şehir veya konum bazlı zirai don riski skoru, gece minimum sıcaklıkları ve 7 günlük hava tahminini takip edin.',
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
  const updatedLabel =
    locale === 'en'
      ? `Last updated: ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'Europe/Istanbul' }).format(new Date())}`
      : `Son güncelleme: ${new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long', timeZone: 'Europe/Istanbul' }).format(new Date())}`;
  return (
    <section className="panel-shell">
      <header className="panel-intro">
        <p className="section-label"><span>DON UYARISI</span></p>
        <h1 className="section-title">Zirai don riski ve 7 günlük hava tahmini</h1>
        <p className="section-lead">
          Şehir veya konum seçerek minimum sıcaklık, nem, rüzgar, yağış ve zirai don riskini tek ekranda takip edin.
          Skorlar karar destek amacıyla üretilir ve kritik tarımsal hazırlıklar için erken sinyal sağlar.
        </p>
        <p className="city-updated">{updatedLabel} · OpenWeatherMap / Open-Meteo veri hattı</p>
      </header>
      <WeatherDashboard />
      <p className="forecast-disclaimer">
        Don riski skorları karar destek amacıyla sunulur; tahminler kesinlik taşımaz. Kritik tarımsal kararlar öncesinde MGM, yerel gözlem ve uzman değerlendirmesi dikkate alınmalıdır.
        {' '}
        <Link href={`/${locale}/zirai-don-riski-nasil-hesaplanir`}>Hesaplama metodolojisini okuyun.</Link>
      </p>
      <CityProvinceLinks variant="don-uyarisi" locale={locale} />
    </section>
  );
}
