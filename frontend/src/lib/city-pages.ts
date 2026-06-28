import type { Metadata } from 'next';
import { getPublicAppName, getPublicSiteUrl } from '@/lib/public-brand';
import type { Province } from '@/lib/provinces';
import { getRegionName } from '@/lib/provinces';
import type { ForecastDay } from '@/types/weather';

export type CityVariant = 'hava-durumu' | 'don-uyarisi' | '7-gunluk-tahmin';

export const CITY_VARIANTS: CityVariant[] = ['hava-durumu', 'don-uyarisi', '7-gunluk-tahmin'];

type VariantCopy = {
  hub: string;
  title: (city: string) => string;
  description: (city: string) => string;
  h1: (city: string) => string;
};

const COPY: Record<CityVariant, Record<'tr' | 'en', VariantCopy>> = {
  'hava-durumu': {
    tr: {
      hub: 'Hava Durumu',
      title: (c) => `${c} Hava Durumu — 7 Günlük Tahmin & Don Uyarısı`,
      description: (c) =>
        `${c} için güncel hava durumu, 7 günlük sıcaklık tahmini, yağış ve zirai don riski. Çiftçiler için saatlik don ve ilaçlama uyarıları.`,
      h1: (c) => `${c} Hava Durumu`,
    },
    en: {
      hub: 'Weather',
      title: (c) => `${c} Weather — 7-Day Forecast & Frost Alerts`,
      description: (c) =>
        `Current weather for ${c}, 7-day temperature forecast, precipitation and agricultural frost risk. Hourly frost and spraying alerts for farmers.`,
      h1: (c) => `${c} Weather`,
    },
  },
  'don-uyarisi': {
    tr: {
      hub: 'Don Uyarısı',
      title: (c) => `${c} Don Uyarısı — Zirai Don Riski & Gece Sıcaklıkları`,
      description: (c) =>
        `${c} için zirai don riski skoru, gece minimum sıcaklıkları ve 7 günlük don tahmini. Hassas bitkilerinizi korumak için erken don uyarısı alın.`,
      h1: (c) => `${c} Don Uyarısı ve Zirai Don Riski`,
    },
    en: {
      hub: 'Frost Alert',
      title: (c) => `${c} Frost Alert — Agricultural Frost Risk & Night Temperatures`,
      description: (c) =>
        `Agricultural frost risk score for ${c}, overnight minimum temperatures and 7-day frost outlook. Get early frost alerts to protect sensitive crops.`,
      h1: (c) => `${c} Frost Alert & Agricultural Frost Risk`,
    },
  },
  '7-gunluk-tahmin': {
    tr: {
      hub: '7 Günlük Tahmin',
      title: (c) => `${c} 7 Günlük Hava Tahmini — Sıcaklık, Yağış, Don`,
      description: (c) =>
        `${c} için 7 günlük detaylı hava tahmini: günlük min/maks sıcaklık, yağış olasılığı, nem, rüzgâr ve zirai don riski.`,
      h1: (c) => `${c} 7 Günlük Hava Tahmini`,
    },
    en: {
      hub: '7-Day Forecast',
      title: (c) => `${c} 7-Day Weather Forecast — Temperature, Rain, Frost`,
      description: (c) =>
        `Detailed 7-day forecast for ${c}: daily min/max temperature, precipitation chance, humidity, wind and agricultural frost risk.`,
      h1: (c) => `${c} 7-Day Weather Forecast`,
    },
  },
};

export function variantCopy(variant: CityVariant, locale: string): VariantCopy {
  const loc = locale === 'en' ? 'en' : 'tr';
  return COPY[variant][loc];
}

export function cityPath(variant: CityVariant, locale: string, slug: string): string {
  return `/${locale}/${variant}/${slug}`;
}

export function hubPath(variant: CityVariant, locale: string): string {
  return `/${locale}/${variant}`;
}

function buildAlternates(path: string): NonNullable<Metadata['alternates']> {
  const site = getPublicSiteUrl();
  const clean = path.replace(/^\/(tr|en)/, '');
  return {
    canonical: `${site}${path}`,
    languages: {
      tr: `${site}/tr${clean}`,
      en: `${site}/en${clean}`,
      'x-default': `${site}/tr${clean}`,
    },
  };
}

export function buildCityMetadata(variant: CityVariant, locale: string, province: Province): Metadata {
  const copy = variantCopy(variant, locale);
  const title = copy.title(province.name);
  const description = copy.description(province.name);
  const path = cityPath(variant, locale, province.slug);
  const url = `${getPublicSiteUrl()}${path}`;
  return {
    title,
    description,
    alternates: buildAlternates(path),
    robots: { index: true, follow: true },
    openGraph: { title, description, url, type: 'website', locale, siteName: getPublicAppName() },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function buildHubMetadata(variant: CityVariant, locale: string): Metadata {
  const app = getPublicAppName();
  const copy = variantCopy(variant, locale);
  const isTr = locale !== 'en';
  const title = isTr
    ? `İl İl ${copy.hub} — 81 İl | ${app}`
    : `${copy.hub} by Province — 81 Provinces | ${app}`;
  const description = isTr
    ? `Türkiye'nin 81 ili için ${copy.hub.toLowerCase()}. İlinizi seçin, güncel tahmini ve zirai don riskini görün.`
    : `${copy.hub} for all 81 provinces of Türkiye. Pick your province for the latest forecast and frost risk.`;
  const path = hubPath(variant, locale);
  return {
    title,
    description,
    alternates: buildAlternates(path),
    robots: { index: true, follow: true },
    openGraph: { title, description, url: `${getPublicSiteUrl()}${path}`, type: 'website', locale, siteName: app },
  };
}

export function breadcrumbJsonLd(
  variant: CityVariant,
  locale: string,
  province: Province,
): Record<string, unknown> {
  const site = getPublicSiteUrl();
  const copy = variantCopy(variant, locale);
  const items = [
    { name: getPublicAppName(), url: `${site}/${locale}` },
    { name: copy.hub, url: `${site}${hubPath(variant, locale)}` },
    { name: province.name, url: `${site}${cityPath(variant, locale, province.slug)}` },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function cityForecastJsonLd(province: Province, forecasts: ForecastDay[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WeatherForecast',
    name: `${province.name} — ${getRegionName(province.region)}`,
    validFrom: forecasts[0]?.date ?? '',
    dayForecast: forecasts.slice(0, 7).map((f) => ({
      '@type': 'ForecastWeatherDay',
      validDate: f.date,
      lowTemperature: { '@type': 'QuantitativeValue', value: f.tempMin, unitCode: 'CEL' },
      highTemperature: { '@type': 'QuantitativeValue', value: f.tempMax, unitCode: 'CEL' },
    })),
  };
}
