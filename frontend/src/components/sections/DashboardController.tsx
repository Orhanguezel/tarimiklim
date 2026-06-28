'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { fetchCurrentWeather, fetchHourlyForecast, fetchWeather } from '@/lib/api';

const TABS = ['now', '6h', '24h', '7d'] as const;
type Tab = (typeof TABS)[number];

type CityKey =
  | 'konya'
  | 'kayseri'
  | 'antalya'
  | 'bursa'
  | 'erzurum'
  | 'izmir'
  | 'ankara'
  | 'sanliurfa';

interface CitySpec {
  key: CityKey;
  lat: number;
  lon: number;
}

const CITIES: CitySpec[] = [
  { key: 'konya', lat: 37.8713, lon: 32.4846 },
  { key: 'kayseri', lat: 38.7225, lon: 35.4875 },
  { key: 'antalya', lat: 36.8968, lon: 30.7133 },
  { key: 'bursa', lat: 40.1826, lon: 29.0663 },
  { key: 'erzurum', lat: 39.9054, lon: 41.2611 },
  { key: 'izmir', lat: 38.4189, lon: 27.1287 },
  { key: 'ankara', lat: 39.9207, lon: 32.8540 },
  { key: 'sanliurfa', lat: 37.1671, lon: 38.7939 },
];

interface LiveCity {
  key: CityKey;
  temp?: number;
  frostScore?: number;
  condition?: string;
}

function riskTone(score?: number): 'critical' | 'alert' | 'warn' | 'ok' {
  if (score == null) return 'ok';
  if (score >= 70) return 'critical';
  if (score >= 40) return 'alert';
  if (score >= 15) return 'warn';
  return 'ok';
}

function tabSlots(tab: Tab): number {
  if (tab === 'now') return 4;
  if (tab === '6h') return 2; // 2 * 3h slots
  if (tab === '24h') return 8; // 8 * 3h slots
  return 0;
}

export function DashboardController() {
  const t = useTranslations('premium.dashboard');
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('now');
  const [liveData, setLiveData] = useState<Map<CityKey, LiveCity>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const slots = tabSlots(activeTab);
      const results = await Promise.all(
        CITIES.map(async (spec): Promise<LiveCity> => {
          if (activeTab === '7d') {
            const [forecast, current] = await Promise.allSettled([
              fetchWeather(spec.lat, spec.lon, 7),
              fetchCurrentWeather(spec.lat, spec.lon),
            ]);
            const days = forecast.status === 'fulfilled' ? (forecast.value?.forecasts ?? []) : [];
            const max = days.length ? Math.max(...days.map((d) => Number(d.frostRisk ?? 0))) : undefined;
            return {
              key: spec.key,
              temp: current.status === 'fulfilled' ? current.value.temp : undefined,
              condition: current.status === 'fulfilled' ? current.value.condition : undefined,
              frostScore: typeof max === 'number' && Number.isFinite(max) ? max : undefined,
            };
          }

          // now/6h/24h: use backend's computed hourly frost scores (3-hour slots).
          const [hourly, current] = await Promise.allSettled([
            fetchHourlyForecast(spec.lat, spec.lon, Math.max(4, slots)),
            fetchCurrentWeather(spec.lat, spec.lon),
          ]);
          const h = hourly.status === 'fulfilled' ? (hourly.value?.hourly ?? []) : [];
          const max = h.length ? Math.max(...h.map((s) => Number(s.frostScore ?? 0))) : undefined;
          const first = h[0];
          return {
            key: spec.key,
            temp: current.status === 'fulfilled' ? current.value.temp : first?.temp,
            condition: current.status === 'fulfilled' ? current.value.condition : first?.condition,
            frostScore: typeof max === 'number' && Number.isFinite(max) ? max : undefined,
          };
        }),
      );

      if (!cancelled) setLiveData(new Map(results.map((r) => [r.key, r])));
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const panelHref = (spec: CitySpec, name: string) =>
    `/${locale}/don-uyarisi?lat=${spec.lat}&lon=${spec.lon}&name=${encodeURIComponent(name)}`;

  return (
    <>
      <div className="dashboard-head">
        <div>
          <h2 className="section-title">
            {t('title.prefix')} <em>{t('title.emphasis')}</em>
          </h2>
          <p className="section-lead">{t('lead')}</p>
        </div>
        <div className="dashboard-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`dashboard-tab${activeTab === tab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
              aria-selected={activeTab === tab}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="city-grid">
        {CITIES.map((spec) => {
          const data = liveData.get(spec.key);
          const tone = riskTone(data?.frostScore);
          const name = t(`cities.${spec.key}.name`);

          return (
            <a
              key={spec.key}
              href={panelHref(spec, name)}
              className="city-card"
              data-risk={tone}
              aria-label={t('cityCardAria', { city: name })}
            >
              <div className="city-name">{name}</div>
              <div className="city-region">{t(`cities.${spec.key}.region`)}</div>
              <div className="city-temp">
                {typeof data?.temp === 'number' ? `${Math.round(data.temp)}°` : '—'}
              </div>
              <div className="city-condition">
                {data?.condition || t(`cities.${spec.key}.condition`)}
              </div>
              <div className="city-bar">
                <div
                  className="city-bar-fill"
                  style={{ width: `${data?.frostScore ?? 0}%` }}
                />
              </div>
              <div className="city-risk-row">
                <span className="city-risk-label">{t('riskLabel')}</span>
                <strong className="city-risk-value">
                  {typeof data?.frostScore === 'number'
                    ? t('riskValueLive', { tone: t(`risk.${tone}`), score: data.frostScore })
                    : t(`cities.${spec.key}.riskValue`)}
                </strong>
              </div>
              <span className="city-card-cta" aria-hidden="true">{t('openDetail')} →</span>
            </a>
          );
        })}
      </div>
    </>
  );
}
