'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { api, fetchHourlyForecast, fetchWeather, fetchLocationBySlug } from '@/lib/api';
import type { ForecastDay, HourlySlot } from '@/types/weather';
import { ForecastCard } from '@/components/ForecastCard';
import { FrostAlertBanner } from '@/components/FrostAlertBanner';
import { HourlyForecastTable } from '@/components/HourlyForecastTable';
import { LocationSearch, type SelectedLocation } from '@/components/LocationSearch';
import { saveLocation, readSaved, requestBrowserLocation } from '@/lib/user-location';

function dedupeForecastDays(list: ForecastDay[]): ForecastDay[] {
  const seen = new Set<string>();
  const out: ForecastDay[] = [];
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    const rawDate = String(f.date || f.forecastDate || '');
    const dayKey =
      rawDate && rawDate !== 'undefined'
        ? rawDate.length >= 10
          ? rawDate.slice(0, 10)
          : rawDate
        : `unknown-${i}`;
    if (seen.has(dayKey)) continue;
    seen.add(dayKey);
    out.push({
      ...f,
      date: dayKey,
      tempMin: Number(f.tempMin || 0),
      tempMax: Number(f.tempMax || 0),
      frostRisk: Number(f.frostRisk ?? 0),
    });
  }
  return out;
}

export function WeatherDashboard() {
  const t = useTranslations('home.preview');
  const td = useTranslations('home.dashboard');
  const th = useTranslations('home.hourly');
  const tw = useTranslations('weather');
  const searchParams = useSearchParams();
  const urlInitRef = useRef(false);
  const [active, setActive] = useState<SelectedLocation | null>(null);
  const [days, setDays] = useState<ForecastDay[]>([]);
  const [hourlySlots, setHourlySlots] = useState<HourlySlot[]>([]);
  const [hourlyLoading, setHourlyLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLocationChange = useCallback((loc: SelectedLocation) => {
    setActive(loc);
  }, []);

  useEffect(() => {
    if (urlInitRef.current) return;

    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const nameParam = searchParams.get('name');
    const cityParam = searchParams.get('city') || searchParams.get('location');

    if (latParam && lonParam && nameParam) {
      const lat = Number(latParam);
      const lon = Number(lonParam);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        urlInitRef.current = true;
        const loc: SelectedLocation = { lat, lon, name: nameParam, source: 'search' };
        setActive(loc);
        saveLocation({ lat, lon, name: nameParam, source: 'search' });
        return;
      }
    }

    if (cityParam) {
      urlInitRef.current = true;
      fetchLocationBySlug(cityParam)
        .then((loc) => {
          const selected: SelectedLocation = {
            lat: Number(loc.latitude),
            lon: Number(loc.longitude),
            name: loc.name,
            source: 'search',
            subtitle: loc.city,
          };
          setActive(selected);
          saveLocation({
            lat: Number(loc.latitude),
            lon: Number(loc.longitude),
            name: loc.name,
            source: 'search',
          });
        })
        .catch(() => {
          // If city fetch fails, let it fallback to geolocation/saved
          urlInitRef.current = false;
        });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    setDays([]);
    setErr(null);
    (async () => {
      try {
        const res = await fetchWeather(active.lat, active.lon, 7);
        const list = res?.forecasts ?? [];
        if (!cancelled) setDays(dedupeForecastDays(list));
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'unknown';
          const status = (e as { response?: { status?: number } })?.response?.status;
          setErr(
            status === undefined
              ? t('errorNetwork', { message: msg })
              : t('errorApi', { status: String(status) }),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, t]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setHourlyLoading(true);
    setHourlySlots([]);
    (async () => {
      try {
        const res = await fetchHourlyForecast(active.lat, active.lon, 40);
        const list = res?.hourly ?? [];
        if (!cancelled) setHourlySlots(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setHourlySlots([]);
      } finally {
        if (!cancelled) setHourlyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  const frostLevel = useMemo(() => {
    const max = days.reduce((m, d) => Math.max(m, d.frostRisk), 0);
    if (max >= 60) return { level: 'high' as const, max };
    if (max >= 25) return { level: 'medium' as const, max };
    return { level: 'none' as const, max };
  }, [days]);

  const labels = {
    tempMin: tw('tempMin'),
    tempMax: tw('tempMax'),
    frostRisk: tw('frostRisk'),
  };
  const hourlyLabels = {
    title: th('title'),
    hadise: th('hadise'),
    sicaklik: th('sicaklik'),
    ruzgar: th('ruzgar'),
    yagis: th('yagis'),
    ziraiDon: th('ziraiDon'),
    ilaclama: th('ilaclama'),
    sicaklikStresi: th('sicaklikStresi'),
    saat: th('saat'),
    gun: th('gun'),
    uygun: th('uygun'),
    uygunDegil: th('uygunDegil'),
    loading: th('loading'),
    footnote: th('footnote'),
  };

  return (
    <section className="weather-dashboard">
      <LocationSearch
        value={active}
        onChange={handleLocationChange}
        initialMode={searchParams.get('edit') === '1' ? 'search' : 'idle'}
      />

      {active ? (
        <>
          <header className="weather-dashboard-head">
            <span className="weather-dashboard-eyebrow">{td('selectLocation')}</span>
            <h2 className="weather-dashboard-title">
              {t('sectionTitle', { place: active.name })}
            </h2>
          </header>
          {err ? (
            <div className="weather-dashboard-error">
              <p>{err}</p>
              <p className="weather-dashboard-error-hint">
                {t('hint', { url: String(api.defaults.baseURL) })}
              </p>
            </div>
          ) : loading && days.length === 0 ? (
            <div className="weather-dashboard-loading">
              <p>{t('loading')}</p>
            </div>
          ) : (
            <>
              <FrostAlertBanner
                level={frostLevel.level}
                message={
                  frostLevel.level === 'high'
                    ? td('bannerHigh', { max: String(frostLevel.max) })
                    : td('bannerMedium', { max: String(frostLevel.max) })
                }
              />
              <div className="forecast-grid">
                {days.map((d, i) => (
                  <ForecastCard
                    key={`forecast-card-${d.date || 'idx'}-${i}`}
                    day={d}
                    labels={labels}
                  />
                ))}
              </div>
              <HourlyForecastTable
                slots={hourlySlots}
                loading={hourlyLoading}
                labels={hourlyLabels}
              />
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
