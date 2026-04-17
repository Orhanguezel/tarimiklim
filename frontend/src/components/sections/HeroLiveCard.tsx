'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchCurrentWeather, fetchFrostRiskByCoords } from '@/lib/api';
import { reverseGeocode } from '@/lib/geocoding';
import {
  readSaved,
  requestBrowserLocation,
  saveLocation,
  type SavedLocation,
} from '@/lib/user-location';
import type { CurrentWeather, FrostRiskResponse } from '@/types/weather';

type Status = 'loading' | 'ready' | 'error';

interface Loc {
  lat: number;
  lon: number;
  name: string;
  subtitle?: string;
  source: SavedLocation['source'];
}

const FALLBACK: Loc = {
  lat: 41.0082,
  lon: 28.9784,
  name: 'İstanbul',
  subtitle: 'Marmara · Türkiye',
  source: 'province',
};

const METRIC_KEYS = ['humidity', 'wind', 'min'] as const;

function formatCoord(lat: number, lon: number): string {
  return `${lat.toFixed(4)}° N · ${lon.toFixed(4)}° E`;
}

export function HeroLiveCard() {
  const t = useTranslations('premium.hero');
  const [loc, setLoc] = useState<Loc | null>(null);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [frost, setFrost] = useState<FrostRiskResponse | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const initRef = useRef(false);

  const resolveSubtitle = useCallback(
    async (lat: number, lon: number): Promise<{ name: string; subtitle?: string } | null> => {
      const r = await reverseGeocode(lat, lon);
      if (!r) return null;
      const subtitle =
        [r.district, r.city || r.state, r.country].filter(Boolean).join(' · ') ||
        formatCoord(lat, lon);
      return { name: r.name, subtitle };
    },
    [],
  );

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      const saved = readSaved();
      if (saved) {
        setLoc({
          lat: saved.lat,
          lon: saved.lon,
          name: saved.name,
          source: saved.source,
        });
        return;
      }
      const geo = await requestBrowserLocation(8000);
      if (geo.status === 'granted' && geo.lat != null && geo.lon != null) {
        const meta = await resolveSubtitle(geo.lat, geo.lon);
        const next: Loc = {
          lat: geo.lat,
          lon: geo.lon,
          name: meta?.name || t('currentArea'),
          subtitle: meta?.subtitle,
          source: 'geolocation',
        };
        setLoc(next);
        saveLocation({ lat: next.lat, lon: next.lon, name: next.name, source: 'geolocation' });
        return;
      }
      setLoc(FALLBACK);
    })();
  }, [resolveSubtitle, t]);

  useEffect(() => {
    if (!loc) return;
    let cancelled = false;
    setStatus('loading');
    (async () => {
      const [curRes, frostRes] = await Promise.allSettled([
        fetchCurrentWeather(loc.lat, loc.lon),
        fetchFrostRiskByCoords(loc.lat, loc.lon),
      ]);
      if (cancelled) return;
      setCurrent(curRes.status === 'fulfilled' ? curRes.value : null);
      setFrost(frostRes.status === 'fulfilled' ? frostRes.value : null);
      setStatus(curRes.status === 'fulfilled' ? 'ready' : 'error');
    })();
    return () => {
      cancelled = true;
    };
  }, [loc]);

  const showLoading = status === 'loading' || !loc;
  const temp = current?.temp;
  const condition = current?.condition;
  const humidity = current?.humidity;
  const windMs = current?.windSpeed;
  const tempMin = frost?.forecasts?.[0]?.tempMin;
  const frostScore = frost?.frostRisk ?? 0;

  const alertTier: 'clear' | 'alert' | 'critical' =
    frostScore >= 60 ? 'critical' : frostScore >= 25 ? 'alert' : 'clear';

  const metricValue = (key: (typeof METRIC_KEYS)[number]): string => {
    if (showLoading) return '—';
    if (key === 'humidity' && typeof humidity === 'number') return `${Math.round(humidity)}%`;
    if (key === 'wind' && typeof windMs === 'number') return `${(windMs * 3.6).toFixed(0)} km/sa`;
    if (key === 'min' && typeof tempMin === 'number') return `${Math.round(tempMin)}°`;
    return '—';
  };

  const locName = loc?.name ?? '—';
  const locSub = loc?.subtitle ?? (loc ? formatCoord(loc.lat, loc.lon) : '');

  const alertTitle =
    alertTier === 'critical'
      ? t('alert.titleCritical', { score: frostScore })
      : alertTier === 'alert'
      ? t('alert.titleLive', { score: frostScore })
      : t('alert.titleClear');

  const alertCopy =
    alertTier === 'critical'
      ? t('alert.copyCritical')
      : alertTier === 'alert'
      ? t('alert.copy')
      : t('alert.copyClear');

  return (
    <div className="hero-card-stack" data-status={status}>
      <article className="weather-card">
        <div className="weather-card-top">
          <div>
            <div className="weather-card-location">{locName}</div>
            <div className="weather-card-sub">{locSub}</div>
          </div>
          <div className="live-badge">{t('card.live')}</div>
        </div>
        <div className="weather-card-temp">
          {typeof temp === 'number' ? `${Math.round(temp)}°C` : '—'}
        </div>
        <div className="weather-card-condition">
          {condition && condition.length > 0 ? condition : t('card.loading')}
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
      <article className="weather-alert-card" data-tier={alertTier}>
        <div className="weather-alert-eyebrow">{t(`alert.eyebrow.${alertTier}`)}</div>
        <div className="weather-alert-title">{alertTitle}</div>
        <div className="weather-alert-copy">{alertCopy}</div>
      </article>
    </div>
  );
}
