import Link from 'next/link';
import { Fragment } from 'react';
import { getTranslations } from 'next-intl/server';
import type { CityVariant } from '@/lib/city-pages';
import {
  CITY_VARIANTS,
  breadcrumbJsonLd,
  cityForecastJsonLd,
  cityPath,
  hubPath,
  variantCopy,
} from '@/lib/city-pages';
import { cityProse } from '@/lib/city-content';
import { getRegionName, getRegionPeers, type Province } from '@/lib/provinces';
import { fetchForecastSsr } from '@/lib/weather-ssr';
import { CityForecastTable } from '@/components/city/CityForecastTable';

function renderProse(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export async function CityWeatherView({
  variant,
  locale,
  province,
}: {
  variant: CityVariant;
  locale: string;
  province: Province;
}) {
  const t = await getTranslations({ locale, namespace: 'city' });
  const copy = variantCopy(variant, locale);
  const region = getRegionName(province.region);
  const data = await fetchForecastSsr(province.lat, province.lon);
  const prose = cityProse(variant, locale, province, data);
  const peers = getRegionPeers(province, 8);
  const otherVariants = CITY_VARIANTS.filter((v) => v !== variant);

  const tableLabels = {
    date: t('table.date'),
    min: t('table.min'),
    max: t('table.max'),
    rain: t('table.rain'),
    humidity: t('table.humidity'),
    wind: t('table.wind'),
    frost: t('table.frost'),
  };

  return (
    <article className="city-page container-wide">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(variant, locale, province)) }}
      />
      {data ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(cityForecastJsonLd(province, data.forecasts)) }}
        />
      ) : null}

      <nav className="city-breadcrumb" aria-label="Breadcrumb">
        <Link href={`/${locale}`}>{t('breadcrumbHome')}</Link>
        <span aria-hidden>/</span>
        <Link href={hubPath(variant, locale)}>{copy.hub}</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{province.name}</span>
      </nav>

      <header className="city-head">
        <p className="city-eyebrow">{region}</p>
        <h1 className="city-title">{copy.h1(province.name)}</h1>
        <p className="city-sub">{copy.description(province.name)}</p>
      </header>

      <section className="city-forecast">
        <h2 className="city-h2">{t('forecastTitle', { city: province.name })}</h2>
        {data ? (
          <>
            <CityForecastTable forecasts={data.forecasts} labels={tableLabels} locale={locale} />
            <p className="city-source">{t('source')}</p>
          </>
        ) : (
          <p className="city-nodata">{t('noData')}</p>
        )}
      </section>

      <section className="city-prose">
        {prose.map((p, i) => (
          <p key={i}>{renderProse(p)}</p>
        ))}
      </section>

      <div className="city-cta">
        <div>
          <h2 className="city-h2">{t('ctaTitle', { city: province.name })}</h2>
          <p>{t('ctaText')}</p>
        </div>
        <Link className="city-cta-btn" href={`/${locale}/don-uyarisi?location=${province.slug}`}>
          {t('ctaButton')}
        </Link>
      </div>

      <nav className="city-links" aria-label={t('relatedTitle', { city: province.name })}>
        <h2 className="city-h2">{t('relatedTitle', { city: province.name })}</h2>
        <ul className="city-link-pills">
          {otherVariants.map((v) => (
            <li key={v}>
              <Link href={cityPath(v, locale, province.slug)}>
                {variantCopy(v, locale).h1(province.name)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {peers.length > 0 ? (
        <nav className="city-links" aria-label={t('peersTitle', { region })}>
          <h2 className="city-h2">{t('peersTitle', { region })}</h2>
          <ul className="city-link-pills">
            {peers.map((p) => (
              <li key={p.slug}>
                <Link href={cityPath(variant, locale, p.slug)}>{copy.h1(p.name)}</Link>
              </li>
            ))}
          </ul>
          <p className="city-hub-link">
            <Link href={hubPath(variant, locale)}>{t('allProvinces')}</Link>
          </p>
        </nav>
      ) : null}
    </article>
  );
}
