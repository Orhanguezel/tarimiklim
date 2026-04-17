/**
 * TarımİKlim Global Weather Types
 * @module types/weather
 */

export interface WeatherLocation {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;      // m/s as seen in widget data
  condition: string;
  icon: string;
}

export interface ForecastDay {
  date: string;           // YYYY-MM-DD
  forecastDate?: string;  // backend alternative field
  tempMin: number;
  tempMax: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  condition: string;
  icon?: string;
  frostRisk: number;      // 0-100
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

export interface WidgetDataResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export interface FrostRiskResponse {
  location: WeatherLocation;
  frostRisk: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  forecasts: ForecastDay[];
}

export interface ForecastResponse {
  location: WeatherLocation;
  forecasts: ForecastDay[];
}

export interface HourlyForecastResponse {
  hourly: HourlySlot[];
  fromCache?: boolean;
}

export interface RainForecastResponse {
  location: WeatherLocation;
  rainForecast: Array<{ date: string; precipitation: number; condition: string }>;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
