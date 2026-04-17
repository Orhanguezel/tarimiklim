import { getTranslations } from 'next-intl/server';
import { fetchCurrentWeather, fetchFrostRisk } from '@/lib/api';
import type { CurrentWeather, FrostRiskResponse } from '@/types/weather';

const HERO_LOC = {
  slug: 'konya',
  lat: 37.5731,
  lon: 32.7734,
};

const METRIC_KEYS = ['humidity', 'wind', 'min'] as const;

interface LiveSnapshot {
  current?: CurrentWeather;
  frost?: FrostRiskResponse;
}

async function loadLive(): Promise<LiveSnapshot> {
  const [current, frost] = await Promise.allSettled([
    fetchCurrentWeather(HERO_LOC.lat, HERO_LOC.lon),
    fetchFrostRisk(HERO_LOC.slug),
  ]);
  return {
    current: current.status === 'fulfilled' ? current.value : undefined,
    frost: frost.status === 'fulfilled' ? frost.value : undefined,
  };
}

function minTonight(frost?: FrostRiskResponse): number | undefined {
  if (!frost?.forecasts?.length) return undefined;
  const next = frost.forecasts[0];
  return typeof next.tempMin === 'number' ? next.tempMin : undefined;
}

export async function HeroLiveCard() {
  const t = await getTranslations('premium.hero');
  const live = await loadLive().catch(() => ({} as LiveSnapshot));

  const temp = live.current?.temp;
  const condition = live.current?.condition;
  const humidity = live.current?.humidity;
  const wind = live.current?.windSpeed;
  const tempMin = minTonight(live.frost);
  const frostScore = live.frost?.frostRisk;

  const metricValue = (key: (typeof METRIC_KEYS)[number]): string => {
    if (key === 'humidity' && typeof humidity === 'number') return `${Math.round(humidity)}%`;
    if (key === 'wind' && typeof wind === 'number') return `${(wind * 3.6).toFixed(0)} km/sa`;
    if (key === 'min' && typeof tempMin === 'number') return `${Math.round(tempMin)}°`;
    return t(`card.metrics.${key}.value`);
  };

  return (
    <div className="hero-card-stack">
      <article className="weather-card">
        <div className="weather-card-top">
          <div>
            <div className="weather-card-location">{t('card.location')}</div>
            <div className="weather-card-sub">{t('card.coordinates')}</div>
          </div>
          <div className="live-badge">{t('card.live')}</div>
        </div>
        <div className="weather-card-temp">
          {typeof temp === 'number' ? `${Math.round(temp)}°C` : t('card.temp')}
        </div>
        <div className="weather-card-condition">
          {condition && condition.length > 0 ? condition : t('card.condition')}
        </div>
        <div className="weather-card-metrics">
          {METRIC_KEYS.map((key) => (
            <div key={key} className="weather-card-metric">
              <div className="weather-card-metric-label">{t(`card.metrics.${key}.label`)}</div>
              <div className="weather-card-metric-value">{metricValue(key)}</div>
            </div>
          ))}
        </div>
      </article>
      <article className="weather-alert-card">
        <div className="weather-alert-eyebrow">{t('alert.eyebrow')}</div>
        <div className="weather-alert-title">
          {typeof frostScore === 'number' && frostScore > 0
            ? t('alert.titleLive', { score: frostScore })
            : t('alert.title')}
        </div>
        <div className="weather-alert-copy">{t('alert.copy')}</div>
      </article>
    </div>
  );
}
