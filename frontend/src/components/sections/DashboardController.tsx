'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { fetchFrostRisk, fetchCurrentWeather } from '@/lib/api';
import type { CurrentWeather, FrostRiskResponse } from '@/types/weather';

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
  slug?: string;
  lat: number;
  lon: number;
}

const CITIES: CitySpec[] = [
  { key: 'konya',     slug: 'konya',    lat: 37.8713, lon: 32.4846 },
  { key: 'kayseri',                     lat: 38.7225, lon: 35.4875 },
  { key: 'antalya',   slug: 'antalya',  lat: 36.8968, lon: 30.7133 },
  { key: 'bursa',     slug: 'bursa',    lat: 40.1826, lon: 29.0663 },
  { key: 'erzurum',                     lat: 39.9054, lon: 41.2611 },
  { key: 'izmir',     slug: 'izmir',    lat: 38.4189, lon: 27.1287 },
  { key: 'ankara',    slug: 'ankara',   lat: 39.9207, lon: 32.8540 },
  { key: 'sanliurfa',                   lat: 37.1671, lon: 38.7939 },
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

export function DashboardController() {
  const t = useTranslations('premium.dashboard');
  const [activeTab, setActiveTab] = useState<Tab>('now');
  const [liveData, setLiveData] = useState<Map<CityKey, LiveCity>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      const results = await Promise.all(
        CITIES.map(async (spec) => {
          try {
            const [frost, current] = await Promise.allSettled([
              spec.slug ? fetchFrostRisk(spec.slug) : Promise.reject('no-slug'),
              fetchCurrentWeather(spec.lat, spec.lon),
            ]);

            return {
              key: spec.key,
              temp: current.status === 'fulfilled' ? current.value.temp : undefined,
              condition: current.status === 'fulfilled' ? current.value.condition : undefined,
              frostScore: frost.status === 'fulfilled' ? frost.value.frostRisk : undefined,
            };
          } catch {
            return { key: spec.key };
          }
        })
      );
      setLiveData(new Map(results.map((r) => [r.key, r])));
      setIsLoading(false);
    }

    loadAll();
  }, []);

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

      <div className="city-grid" data-loading={isLoading}>
        {CITIES.map(({ key }) => {
          const data = liveData.get(key);
          const tone = riskTone(data?.frostScore);
          
          return (
            <article key={key} className="city-card" data-risk={tone}>
              <div className="city-name">{t(`cities.${key}.name`)}</div>
              <div className="city-region">{t(`cities.${key}.region`)}</div>
              <div className="city-temp">
                {typeof data?.temp === 'number' ? `${Math.round(data.temp)}°` : '--'}
              </div>
              <div className="city-condition">
                {data?.condition || t(`cities.${key}.condition`)}
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
                    : t(`cities.${key}.riskValue`)}
                </strong>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
