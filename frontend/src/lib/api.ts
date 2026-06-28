import axios from 'axios';
import type {
  CurrentWeather,
  ForecastResponse,
  FrostRiskResponse,
  HourlyForecastResponse,
  WeatherLocation,
  WidgetDataResponse,
} from '@/types/weather';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8088/api/v1';

export type CustomPageData = {
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function createApiClient(apiBase?: string) {
  const baseURL = (apiBase || API_URL).replace(/\/+$/, '');
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function fetchWeather(lat: number, lon: number, days = 7): Promise<ForecastResponse> {
  const { data } = await api.get('/weather', { params: { lat, lon, days } });
  return data.data;
}

export async function fetchHourlyForecast(
  lat: number,
  lon: number,
  slots = 40,
): Promise<HourlyForecastResponse> {
  const { data } = await api.get('/weather/hourly', { params: { lat, lon, slots } });
  return data.data;
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const { data } = await api.get('/weather/current', { params: { lat, lon } });
  return data.data;
}

export async function fetchFrostRisk(location: string): Promise<FrostRiskResponse> {
  const { data } = await api.get('/weather/frost-risk', { params: { location } });
  return data.data;
}

export async function fetchFrostRiskByCoords(
  lat: number,
  lon: number,
): Promise<FrostRiskResponse> {
  const { data } = await api.get('/weather/frost-risk', { params: { lat, lon } });
  return data.data;
}

export async function fetchWidgetData(
  location?: string,
  lat?: number,
  lon?: number,
): Promise<WidgetDataResponse> {
  const { data } = await api.get('/weather/widget-data', { params: { location, lat, lon } });
  return data.data;
}

export async function fetchWidgetDataWithBase(
  apiBase: string | undefined,
  location?: string,
  lat?: number,
  lon?: number,
): Promise<WidgetDataResponse> {
  const client = apiBase ? createApiClient(apiBase) : api;
  const { data } = await client.get('/weather/widget-data', { params: { location, lat, lon } });
  return data.data;
}

export async function fetchLocations(): Promise<WeatherLocation[]> {
  const { data } = await api.get('/locations', { params: { active: true, limit: 100 } });
  return data.data;
}

export async function fetchLocationBySlug(slug: string): Promise<WeatherLocation> {
  const { data } = await api.get(`/locations/${slug}`);
  return data.data;
}

export async function fetchCustomPageBySlug(slug: string, locale = 'tr'): Promise<CustomPageData | null> {
  const candidates = [
    `/site_settings/ui_${slug}?locale=${encodeURIComponent(locale)}`,
    `/site_settings/${encodeURIComponent(`ui_${slug}`)}?locale=${encodeURIComponent(locale)}`,
  ];

  for (const path of candidates) {
    try {
      const { data } = await api.get(path);
      const value = data?.value ?? data?.data?.value ?? data?.data ?? data;
      if (value && typeof value === 'object') return value as CustomPageData;
      if (typeof value === 'string' && value.trim()) return { title: slug, content: value };
    } catch {
      // try next fallback
    }
  }

  return null;
}

export type { HourlySlot } from '@/types/weather';
