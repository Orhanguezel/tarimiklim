import { env } from '@/core/env.js';
import { calculateFrostRisk } from './frost-rules.js';

const TZ = 'Europe/Istanbul';

export interface HourlySlot {
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
  /** Tablo satiri icin kisa metin */
  frostShort: string;
  sprayOk: boolean;
  tempStress: 'none' | 'heat' | 'cold';
  tempStressLabel: string;
}

function useDevMock(): boolean {
  return env.NODE_ENV === 'development' && !String(env.OPENWEATHERMAP_API_KEY ?? '').trim();
}

function windDirFromDeg(deg: number): string {
  const dirs = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function precipShortLabel(weatherId: number, rainMm: number, snowMm: number): string {
  if (rainMm < 0.05 && snowMm < 0.05) return '—';
  if (weatherId >= 200 && weatherId < 300) return 'GSY';
  if (weatherId >= 300 && weatherId < 400) return 'ÇY';
  if (weatherId >= 500 && weatherId < 600) return 'Y';
  if (weatherId >= 600 && weatherId < 700) return 'K';
  if (rainMm >= 5) return 'SY';
  if (rainMm >= 0.5) return 'Y';
  return 'HY';
}

function spraySuitability(
  temp: number,
  windKmh: number,
  rainMm: number,
  humidity: number,
): { ok: boolean } {
  if (rainMm >= 0.3) return { ok: false };
  if (temp < 5 || temp > 32) return { ok: false };
  if (windKmh < 2 || windKmh > 25) return { ok: false };
  if (humidity > 92) return { ok: false };
  return { ok: true };
}

function tempStress(temp: number): { level: 'none' | 'heat' | 'cold'; label: string } {
  if (temp >= 34) return { level: 'heat', label: 'Sıcak stresi' };
  if (temp <= 2) return { level: 'cold', label: 'Soğuk stresi' };
  if (temp >= 30) return { level: 'heat', label: 'Hafif sıcak stresi' };
  if (temp <= 5) return { level: 'cold', label: 'Hafif soğuk stresi' };
  return { level: 'none', label: 'Stres yok' };
}

function slotLabels(dtSec: number): { timeRangeLabel: string; weekdayShort: string } {
  const endMs = dtSec * 1000;
  const startMs = endMs - 3 * 60 * 60 * 1000;
  const hourFmt = new Intl.DateTimeFormat('tr-TR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dayFmt = new Intl.DateTimeFormat('tr-TR', {
    timeZone: TZ,
    weekday: 'short',
  });
  const a = hourFmt.format(new Date(startMs)).replace(/\s/g, '');
  const b = hourFmt.format(new Date(endMs)).replace(/\s/g, '');
  return {
    timeRangeLabel: `${a}–${b}`,
    weekdayShort: dayFmt.format(new Date(endMs)),
  };
}

function parseItem(item: any): HourlySlot {
  const windMs = item.wind?.speed ?? 0;
  const windKmh = Math.round(windMs * 36) / 10;
  const windDeg = item.wind?.deg ?? 0;
  const rain = (item.rain?.['3h'] ?? 0) + (item.snow?.['3h'] ?? 0);
  const w0 = item.weather?.[0];
  const wid = w0?.id ?? 800;
  const rainOnly = item.rain?.['3h'] ?? 0;
  const snowOnly = item.snow?.['3h'] ?? 0;
  const temp = item.main?.temp ?? 0;
  const humidity = item.main?.humidity ?? 50;
  const cloud = item.clouds?.all ?? 0;
  const frost = calculateFrostRisk({
    tempMin: temp,
    humidity,
    windSpeed: windKmh,
    cloudCover: cloud,
  });
  const spray = spraySuitability(temp, windKmh, rain, humidity);
  const stress = tempStress(temp);
  const { timeRangeLabel, weekdayShort } = slotLabels(item.dt);
  let frostShort = 'Risk yok';
  if (frost.score > 80) frostShort = 'Kritik';
  else if (frost.score > 55) frostShort = 'Yüksek';
  else if (frost.score > 30) frostShort = 'Orta';
  else if (frost.score > 10) frostShort = 'Düşük';

  return {
    dt: item.dt,
    timeRangeLabel,
    weekdayShort,
    temp: Math.round(temp * 10) / 10,
    feelsLike: Math.round((item.main?.feels_like ?? temp) * 10) / 10,
    humidity,
    windSpeedKmh: windKmh,
    windDeg,
    windDir: windDirFromDeg(windDeg),
    precipitationMm: Math.round(rain * 10) / 10,
    precipitationLabel: precipShortLabel(wid, rainOnly, snowOnly),
    condition: w0?.description ?? '',
    icon: w0?.icon ?? '',
    cloudCover: cloud,
    frostScore: frost.score,
    frostLabel: frost.label,
    frostShort,
    sprayOk: spray.ok,
    tempStress: stress.level,
    tempStressLabel: stress.label,
  };
}

function mockHourly(maxSlots: number): HourlySlot[] {
  const out: HourlySlot[] = [];
  const now = Math.floor(Date.now() / 1000);
  const step = 3 * 3600;
  for (let i = 0; i < maxSlots; i++) {
    const dt = now + i * step;
    const t = 8 + Math.sin(i / 3) * 6;
    const item = {
      dt,
      main: { temp: t, feels_like: t - 1, humidity: 60 + (i % 5) * 3 },
      wind: { speed: 3 + (i % 4), deg: (i * 45) % 360 },
      rain: i % 7 === 2 ? { '3h': 2.1 } : {},
      snow: {},
      clouds: { all: 40 },
      weather: [{ id: 801, description: 'parçalı bulutlu', icon: '01d' }],
    };
    out.push(parseItem(item));
  }
  return out;
}

export async function fetchHourlyForecast(lat: number, lon: number, maxSlots: number): Promise<HourlySlot[]> {
  const n = Math.min(Math.max(1, maxSlots), 40);
  if (useDevMock()) return mockHourly(n);

  const apiKey = env.OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr&cnt=40`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json() as { list?: unknown[] };
  const list = (data.list ?? []).slice(0, n);
  return list.map((item) => parseItem(item));
}
