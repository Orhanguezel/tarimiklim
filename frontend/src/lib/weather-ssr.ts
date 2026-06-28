import { API_URL } from '@/lib/site-settings';
import type { ForecastDay } from '@/types/weather';

export interface SsrForecast {
  forecasts: ForecastDay[];
  maxFrostRisk: number;
  minTemp: number;
  maxTemp: number;
  /** Bugün veya en yakın günün özeti */
  today: ForecastDay | null;
}

function normalizeDay(raw: Record<string, unknown>): ForecastDay {
  return {
    date: String(raw.date ?? raw.forecastDate ?? '').slice(0, 10),
    tempMin: Number(raw.tempMin ?? 0),
    tempMax: Number(raw.tempMax ?? 0),
    humidity: raw.humidity != null ? Number(raw.humidity) : undefined,
    windSpeed: raw.windSpeed != null ? Number(raw.windSpeed) : undefined,
    precipitation: raw.precipitation != null ? Number(raw.precipitation) : undefined,
    condition: String(raw.condition ?? ''),
    icon: raw.icon != null ? String(raw.icon) : undefined,
    frostRisk: Number(raw.frostRisk ?? 0),
  };
}

/**
 * Şehir sayfaları için sunucu tarafında 7 günlük tahmini çeker.
 * Backend Redis/DB cache'i zaten var; burada ISR revalidate ile katmanlıyoruz.
 */
export async function fetchForecastSsr(
  lat: number,
  lon: number,
  days = 7,
  revalidateSeconds = 1800,
): Promise<SsrForecast | null> {
  try {
    const url = `${API_URL}/weather?lat=${lat}&lon=${lon}&days=${days}`;
    const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { forecasts?: Record<string, unknown>[] } };
    const rawList = json?.data?.forecasts ?? [];
    if (!Array.isArray(rawList) || rawList.length === 0) return null;

    const seen = new Set<string>();
    const forecasts: ForecastDay[] = [];
    for (const raw of rawList) {
      const d = normalizeDay(raw);
      if (d.date && seen.has(d.date)) continue;
      if (d.date) seen.add(d.date);
      forecasts.push(d);
    }
    if (forecasts.length === 0) return null;

    const maxFrostRisk = forecasts.reduce((m, d) => Math.max(m, d.frostRisk), 0);
    const minTemp = Math.min(...forecasts.map((d) => d.tempMin));
    const maxTemp = Math.max(...forecasts.map((d) => d.tempMax));

    return { forecasts, maxFrostRisk, minTemp, maxTemp, today: forecasts[0] ?? null };
  } catch {
    return null;
  }
}
