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

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

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

export async function fetchWidgetData(location: string): Promise<WidgetDataResponse> {
  const { data } = await api.get('/weather/widget-data', { params: { location } });
  return data.data;
}

export async function fetchLocations(): Promise<WeatherLocation[]> {
  const { data } = await api.get('/locations', { params: { active: true, limit: 100 } });
  return data.data;
}

export type { HourlySlot } from '@/types/weather';
