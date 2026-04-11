import { env } from '@/core/env.js';
import { calculateFrostRisk } from './frost-rules.js';

function useDevMock(): boolean {
  return env.NODE_ENV === 'development' && !String(env.OPENWEATHERMAP_API_KEY ?? '').trim();
}

function mockForecast(days: number): WeatherApiDay[] {
  const out: WeatherApiDay[] = [];
  const base = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split('T')[0];
    const tempMin = 4 + i * 0.4;
    const tempMax = 14 + i * 0.3;
    const tempAvg = (tempMin + tempMax) / 2;
    const humidity = 55 + (i % 3) * 10;
    const windSpeed = 8 + i;
    const cloudCover = 30 + (i % 4) * 15;
    const frost = calculateFrostRisk({ tempMin, humidity, windSpeed, cloudCover });
    out.push({
      date,
      tempMin,
      tempMax,
      tempAvg,
      humidity,
      windSpeed: Math.round(windSpeed * 10) / 10,
      windDirection: 'KD',
      precipitation: i % 2 === 0 ? 0.2 : 0,
      condition: i % 3 === 0 ? 'parçalı bulutlu' : 'açık',
      icon: '02d',
      uvIndex: 3,
      cloudCover,
      frostRisk: frost.score,
    });
  }
  return out;
}

function mockCurrent(): CurrentWeather {
  return {
    temp: 12,
    feelsLike: 11,
    humidity: 62,
    windSpeed: 3.2,
    condition: 'geliştirme önizlemesi (mock)',
    icon: '03d',
    visibility: 10000,
    pressure: 1012,
    updatedAt: new Date().toISOString(),
  };
}

export interface WeatherApiDay {
  date: string;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  condition: string;
  icon: string;
  uvIndex: number;
  cloudCover: number;
  frostRisk: number;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  visibility: number;
  pressure: number;
  updatedAt: string;
}

export async function fetchForecast(lat: number, lon: number, days: number): Promise<WeatherApiDay[]> {
  if (useDevMock()) return mockForecast(days);
  const url = buildOwmForecastUrl(lat, lon);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json() as any;
  return parseOwmForecast(data, days);
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  if (useDevMock()) return mockCurrent();
  const apiKey = env.OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const d = await res.json() as any;
  return {
    temp: d.main.temp,
    feelsLike: d.main.feels_like,
    humidity: d.main.humidity,
    windSpeed: d.wind?.speed ?? 0,
    condition: d.weather?.[0]?.description ?? '',
    icon: d.weather?.[0]?.icon ?? '',
    visibility: d.visibility ?? 0,
    pressure: d.main.pressure,
    updatedAt: new Date().toISOString(),
  };
}

function buildOwmForecastUrl(lat: number, lon: number): string {
  const apiKey = env.OPENWEATHERMAP_API_KEY;
  return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr&cnt=56`;
}

function parseOwmForecast(data: any, days: number): WeatherApiDay[] {
  const byDate = new Map<string, any[]>();

  for (const item of data.list ?? []) {
    const date = item.dt_txt.split(' ')[0];
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(item);
  }

  const result: WeatherApiDay[] = [];
  let count = 0;

  for (const [date, items] of byDate) {
    if (count >= days) break;
    const temps = items.map((i) => i.main.temp);
    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);
    const tempAvg = temps.reduce((a, b) => a + b, 0) / temps.length;
    const humidity = Math.round(items.reduce((a, b) => a + b.main.humidity, 0) / items.length);
    const windSpeed = items.reduce((a, b) => a + (b.wind?.speed ?? 0), 0) / items.length * 3.6;
    const precipitation = items.reduce((a, b) => a + (b.rain?.['3h'] ?? 0), 0);
    const cloudCover = Math.round(items.reduce((a, b) => a + (b.clouds?.all ?? 0), 0) / items.length);
    const nightItem = items.find((i) => i.dt_txt.includes('03:00')) ?? items[0];
    const frostResult = calculateFrostRisk({ tempMin, humidity, windSpeed, cloudCover });

    result.push({
      date,
      tempMin,
      tempMax,
      tempAvg,
      humidity,
      windSpeed: Math.round(windSpeed * 10) / 10,
      windDirection: getWindDirection(items[0]?.wind?.deg ?? 0),
      precipitation: Math.round(precipitation * 10) / 10,
      condition: nightItem.weather?.[0]?.description ?? '',
      icon: nightItem.weather?.[0]?.icon ?? '',
      uvIndex: 0,
      cloudCover,
      frostRisk: frostResult.score,
    });
    count++;
  }

  return result;
}

function getWindDirection(deg: number): string {
  const dirs = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB'];
  return dirs[Math.round(deg / 22.5) % 16];
}
