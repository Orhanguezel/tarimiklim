'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api, fetchHourlyForecast, fetchLocations, fetchWeather } from '@/lib/api';
import type { ForecastDay, HourlySlot, WeatherLocation } from '@/types/weather';
import { ForecastCard } from '@/components/ForecastCard';
import { FrostAlertBanner } from '@/components/FrostAlertBanner';
import { HourlyForecastTable } from '@/components/HourlyForecastTable';
import { LocationSelector, type LocationOption } from '@/components/LocationSelector';

const DEFAULT_LOC: LocationOption = {
  id: 'default-istanbul',
  label: 'İstanbul',
  lat: 41.0082,
  lon: 28.9784,
};

function mapLocations(items: WeatherLocation[]): LocationOption[] {
  const out: LocationOption[] = [];
  for (const it of items) {
    const id = it.slug || it.id || `${it.latitude}-${it.longitude}`;
    const lat = Number(it.latitude);
    const lon = Number(it.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
    const label = it.city || it.name || id;
    out.push({ id, label, lat, lon });
  }
  return out.length ? out : [DEFAULT_LOC];
}

function dedupeForecastDays(list: ForecastDay[]): ForecastDay[] {
  const seen = new Set<string>();
  const out: ForecastDay[] = [];
  for (const f of list) {
    const rawDate = f.date || f.forecastDate || '';
    const dayKey = rawDate.length >= 10 ? rawDate.slice(0, 10) : rawDate;
    if (!dayKey || seen.has(dayKey)) continue;
    seen.add(dayKey);
    out.push(f);
  }
  return out;
}

export function WeatherDashboard() {
  const t = useTranslations('home.preview');
  const td = useTranslations('home.dashboard');
  const th = useTranslations('home.hourly');
  const tw = useTranslations('weather');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [days, setDays] = useState<ForecastDay[]>([]);
  const [hourlySlots, setHourlySlots] = useState<HourlySlot[]>([]);
  const [hourlyLoading, setHourlyLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const locData = await fetchLocations();
        const opts = mapLocations(locData);
        if (!cancelled) {
          setLocations(opts);
          setSelectedId(opts[0]?.id ?? null);
        }
      } catch {
        if (!cancelled) {
          setLocations([DEFAULT_LOC]);
          setSelectedId(DEFAULT_LOC.id);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? locations[0] ?? DEFAULT_LOC,
    [locations, selectedId],
  );

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
        const mapped = dedupeForecastDays(list);
        if (!cancelled) setDays(mapped);
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

  const labels = { tempMin: tw('tempMin'), tempMax: tw('tempMax'), frostRisk: tw('frostRisk') };
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

  if (loading && days.length === 0 && !err) {
    return (
      <section
        style={{
          marginTop: '2rem',
          padding: '1.25rem',
          borderRadius: 12,
          background: 'var(--color-surface, #f4f4f5)',
        }}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{t('loading')}</p>
      </section>
    );
  }

  if (err) {
    return (
      <section
        style={{
          marginTop: '2rem',
          padding: '1.25rem',
          borderRadius: 12,
          background: '#fef2f2',
          color: '#991b1b',
        }}
      >
        <p style={{ margin: 0 }}>{err}</p>
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
          {t('hint', { url: String(api.defaults.baseURL) })}
        </p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      <LocationSelector
        options={locations}
        valueId={selectedId}
        onChange={setSelectedId}
        label={td('selectLocation')}
      />
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
        {t('sectionTitle', { place: active.label })}
      </h2>
      <FrostAlertBanner
        level={frostLevel.level}
        message={
          frostLevel.level === 'high'
            ? td('bannerHigh', { max: String(frostLevel.max) })
            : td('bannerMedium', { max: String(frostLevel.max) })
        }
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {days.map((d) => {
          const dk = String(d.date).slice(0, 10) || d.date;
          return <ForecastCard key={dk} day={d} labels={labels} />;
        })}
      </div>
      <HourlyForecastTable slots={hourlySlots} loading={hourlyLoading} labels={hourlyLabels} />
    </section>
  );
}
