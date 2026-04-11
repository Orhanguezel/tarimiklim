import { randomUUID } from 'crypto';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { fetchForecast, fetchCurrentWeather } from './helpers/weather-api.js';
import { fetchHourlyForecast, type HourlySlot } from './helpers/hourly-forecast.js';
import { repoGetForecastsByLocation, repoUpsertForecasts } from './repository.js';
import { repoGetLocationBySlug, repoGetLocationByCoords } from '@/modules/locations/repository.js';
import { env } from '@/core/env.js';

/** Redis uzerinden kisa omurlu tahmin onbellegi (TTL: WEATHER_CACHE_TTL_SECONDS). */
type ForecastCacheRedis = {
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<unknown>;
};

function forecastCacheKey(locationId: string | undefined, lat: number, lon: number, today: string, days: number) {
  return locationId
    ? `weather:forecast:v1:${locationId}:${today}:${days}`
    : `weather:forecast:v1:c:${lat.toFixed(4)}:${lon.toFixed(4)}:${days}`;
}

export async function getForecast(
  db: MySql2Database,
  lat: number,
  lon: number,
  days: number,
  redis?: ForecastCacheRedis | null,
) {
  const today = new Date().toISOString().split('T')[0];
  const ttl = env.WEATHER_CACHE_TTL_SECONDS;

  const location = await repoGetLocationByCoords(db, lat, lon, 0.1);
  const key = forecastCacheKey(location?.id, lat, lon, today, days);

  if (redis && ttl > 0) {
    const raw = await redis.get(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { forecasts: unknown[]; location: unknown };
        return {
          forecasts: parsed.forecasts,
          location: (parsed.location as typeof location) ?? location,
          fromCache: true,
        };
      } catch {
        /* devam */
      }
    }
  }

  if (location) {
    const cached = await repoGetForecastsByLocation(db, location.id, today);
    if (cached.length >= days) {
      const slice = cached.slice(0, days);
      const result = { forecasts: slice, location, fromCache: true };
      if (redis && ttl > 0) {
        await redis.setex(key, ttl, JSON.stringify({ forecasts: slice, location }));
      }
      return result;
    }
  }

  const days7 = await fetchForecast(lat, lon, days);
  const now = new Date();
  const locationId = location?.id ?? randomUUID();

  const rows = days7.map((d) => ({
    id: randomUUID(),
    locationId,
    forecastDate: new Date(d.date.includes('T') ? d.date : `${d.date}T00:00:00.000Z`),
    hour: null,
    tempMin: String(d.tempMin),
    tempMax: String(d.tempMax),
    tempAvg: String(d.tempAvg),
    humidity: d.humidity,
    windSpeed: String(d.windSpeed),
    windDirection: d.windDirection,
    precipitation: String(d.precipitation),
    condition: d.condition,
    icon: d.icon,
    uvIndex: d.uvIndex,
    frostRisk: d.frostRisk,
    dataSource: 'openweathermap',
    fetchedAt: now,
  }));

  if (location) {
    await repoUpsertForecasts(db, rows);
  }

  const result = { forecasts: days7, location, fromCache: false };
  if (redis && ttl > 0) {
    await redis.setex(key, ttl, JSON.stringify({ forecasts: days7, location }));
  }
  return result;
}

export async function getCurrentWeather(lat: number, lon: number) {
  return fetchCurrentWeather(lat, lon);
}

function hourlyCacheKey(lat: number, lon: number, slots: number, today: string) {
  return `weather:hourly:v1:${lat.toFixed(4)}:${lon.toFixed(4)}:${slots}:${today}`;
}

export async function getHourlyForecast(
  lat: number,
  lon: number,
  slots: number,
  redis?: ForecastCacheRedis | null,
): Promise<{ hourly: HourlySlot[]; fromCache: boolean }> {
  const today = new Date().toISOString().split('T')[0];
  const ttl = env.WEATHER_CACHE_TTL_SECONDS;
  const key = hourlyCacheKey(lat, lon, slots, today);

  if (redis && ttl > 0) {
    const raw = await redis.get(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { hourly?: HourlySlot[] };
        const h = Array.isArray(parsed.hourly) ? parsed.hourly : [];
        return { hourly: h, fromCache: true };
      } catch {
        /* */
      }
    }
  }

  const hourly = await fetchHourlyForecast(lat, lon, slots);
  const result = { hourly, fromCache: false };
  if (redis && ttl > 0) {
    await redis.setex(key, ttl, JSON.stringify({ hourly }));
  }
  return result;
}

export async function getFrostRisk(
  db: MySql2Database,
  params: { location?: string; lat?: number; lon?: number },
  redis?: ForecastCacheRedis | null,
) {
  let lat: number;
  let lon: number;

  if (params.location) {
    const loc = await repoGetLocationBySlug(db, params.location);
    if (!loc) throw Object.assign(new Error('location_not_found'), { statusCode: 404 });
    lat = parseFloat(String(loc.latitude));
    lon = parseFloat(String(loc.longitude));
  } else {
    lat = params.lat!;
    lon = params.lon!;
  }

  const { forecasts } = await getForecast(db, lat, lon, 3, redis);
  const riskDays = (Array.isArray(forecasts) ? forecasts : []).map((f: any) => ({
    date: f.date ?? f.forecastDate,
    frostRisk: f.frostRisk,
    tempMin: f.tempMin,
  }));

  const maxRisk = Math.max(...riskDays.map((d) => Number(d.frostRisk)));
  return { riskDays, maxRisk };
}

export async function getWidgetData(
  db: MySql2Database,
  locationSlug: string,
  redis?: ForecastCacheRedis | null,
) {
  const loc = await repoGetLocationBySlug(db, locationSlug);
  if (!loc) throw Object.assign(new Error('location_not_found'), { statusCode: 404 });

  const lat = parseFloat(String(loc.latitude));
  const lon = parseFloat(String(loc.longitude));
  const [current, forecastResult] = await Promise.all([
    getCurrentWeather(lat, lon),
    getForecast(db, lat, lon, 3, redis),
  ]);

  return { location: loc, current, forecast: forecastResult.forecasts };
}

/** Dahili: 3 saatlik slotlarla saatlik yakin tahmin (OWM forecast; max 40 slot). */
export async function getInternalForecastDetail(
  lat: number,
  lon: number,
  requestedHours: number,
  redis?: ForecastCacheRedis | null,
) {
  const slotCount = Math.min(40, Math.max(1, Math.ceil(requestedHours / 3)));
  const { hourly, fromCache } = await getHourlyForecast(lat, lon, slotCount, redis);
  return {
    lat,
    lon,
    requestedHours,
    slotStepHours: 3,
    slots: hourly,
    fromCache,
  };
}

/** Dahili: gecmis iklim — veri katmani henuz yok (TimescaleDB plani). */
export function getInternalHistoricalClimate(lat: number, lon: number, requestedDays: number) {
  return {
    lat,
    lon,
    requestedDays,
    series: [] as unknown[],
    meta: {
      source: 'none' as const,
      noteTr:
        'Uzun donem iklim serisi henuz veritabaninda yok; TimescaleDB / weather_history entegrasyonu planlandi (Faz 6).',
      noteEn: 'Long-term climate series not stored yet; TimescaleDB / weather_history planned (phase 6).',
    },
  };
}

function analyzeHumidityFromSlots(slots: HourlySlot[]) {
  if (!slots.length) {
    return {
      riskLevel: 'unknown' as const,
      score: 0,
      maxHumidity: null as number | null,
      slotsAbove80: 0,
      slotsAbove85: 0,
      fungicideHint: 'Saatlik veri yok.',
    };
  }
  const maxH = Math.max(...slots.map((s) => s.humidity));
  const above80 = slots.filter((s) => s.humidity >= 80).length;
  const above85 = slots.filter((s) => s.humidity >= 85).length;
  const score = Math.min(100, above85 * 12 + above80 * 5 + (maxH >= 95 ? 20 : 0));
  let riskLevel: 'low' | 'medium' | 'high';
  if (score < 25) riskLevel = 'low';
  else if (score < 55) riskLevel = 'medium';
  else riskLevel = 'high';
  const fungicideHint =
    riskLevel === 'high'
      ? 'Yuksek nem penceresi — mantar hastalik riski; mucadele zamanlamasini gozden gecirin.'
      : riskLevel === 'medium'
        ? 'Nem ara sira yuksek; yaprak islakligi ve havalandirmayi izleyin.'
        : 'Nem profili genel olarak makul.';
  return {
    riskLevel,
    score,
    maxHumidity: maxH,
    slotsAbove80: above80,
    slotsAbove85: above85,
    fungicideHint,
  };
}

/** Dahili: onumuzdeki ~5 gunluk saatlik nemden basit risk ozeti (hastalik uyari girdisi). */
export async function getInternalHumidityRisk(
  lat: number,
  lon: number,
  redis?: ForecastCacheRedis | null,
) {
  const { hourly, fromCache } = await getHourlyForecast(lat, lon, 40, redis);
  const slots = (Array.isArray(hourly) ? hourly : []) as HourlySlot[];
  return {
    lat,
    lon,
    fromCache,
    ...analyzeHumidityFromSlots(slots),
  };
}
