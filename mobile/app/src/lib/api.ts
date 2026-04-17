/**
 * TarımİKlim Backend API istemcisi (React Native).
 * Web frontend'in lib/api.ts'i ile symmetric.
 */

import Constants from 'expo-constants';
import type {
  CurrentWeather,
  ForecastResponse,
  FrostRiskResponse,
  HourlyForecastResponse,
  WeatherLocation,
  WidgetDataResponse,
} from '@/types/weather';

const API_URL =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  'https://tarimiklim.com/api/v1';

interface Envelope<T> {
  success?: boolean;
  data: T;
  error?: string;
}

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as Envelope<T>;
  return json.data;
}

export const api = {
  weather: (lat: number, lon: number, days = 7) =>
    get<ForecastResponse>('/weather', { lat, lon, days }),

  currentWeather: (lat: number, lon: number) =>
    get<CurrentWeather>('/weather/current', { lat, lon }),

  hourly: (lat: number, lon: number, slots = 40) =>
    get<HourlyForecastResponse>('/weather/hourly', { lat, lon, slots }),

  frostRiskByCoords: (lat: number, lon: number) =>
    get<FrostRiskResponse>('/weather/frost-risk', { lat, lon }),

  frostRiskBySlug: (slug: string) =>
    get<FrostRiskResponse>('/weather/frost-risk', { location: slug }),

  widgetData: (slug: string) =>
    get<WidgetDataResponse>('/weather/widget-data', { location: slug }),

  locations: () =>
    get<{ items: WeatherLocation[] }>('/locations', { active: 'true', limit: 100 }),
};
