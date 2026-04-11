import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8088/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchWeather(lat: number, lon: number, days = 7) {
  const { data } = await api.get('/weather', { params: { lat, lon, days } });
  return data.data;
}

export async function fetchHourlyForecast(lat: number, lon: number, slots = 40) {
  const { data } = await api.get('/weather/hourly', { params: { lat, lon, slots } });
  return data.data as { hourly: HourlySlot[]; fromCache?: boolean };
}

export type HourlySlot = {
  dt: number;
  timeRangeLabel: string;
  weekdayShort: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeedKmh: number;
  windDeg: number;
  windDir: string;
  precipitationMm: number;
  precipitationLabel: string;
  condition: string;
  icon: string;
  cloudCover: number;
  frostScore: number;
  frostLabel: string;
  frostShort: string;
  sprayOk: boolean;
  tempStress: 'none' | 'heat' | 'cold';
  tempStressLabel: string;
};

export async function fetchCurrentWeather(lat: number, lon: number) {
  const { data } = await api.get('/weather/current', { params: { lat, lon } });
  return data.data;
}

export async function fetchFrostRisk(location: string) {
  const { data } = await api.get('/weather/frost-risk', { params: { location } });
  return data.data;
}

export async function fetchWidgetData(location: string) {
  const { data } = await api.get('/weather/widget-data', { params: { location } });
  return data.data;
}

export async function fetchLocations() {
  const { data } = await api.get('/locations', { params: { active: true, limit: 100 } });
  return data.data;
}
