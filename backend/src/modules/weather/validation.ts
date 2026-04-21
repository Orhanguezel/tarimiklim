import { z } from 'zod';

export const forecastQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  days: z.coerce.number().min(1).max(7).default(7),
});

export const hourlyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  /** OpenWeatherMap 3 saatlik slot sayisi (en fazla 40) */
  slots: z.coerce.number().min(4).max(40).default(40),
});

export const frostRiskQuerySchema = z.object({
  location: z.string().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
}).refine((d) => d.location || (d.lat !== undefined && d.lon !== undefined), {
  message: 'location veya lat+lon gerekli',
});

export const rainForecastQuerySchema = z.object({
  location: z.string().min(1).optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  days: z.coerce.number().min(1).max(7).default(3),
}).refine((d) => d.location || (d.lat !== undefined && d.lon !== undefined), {
  message: 'location veya lat+lon gerekli',
});

export const widgetQuerySchema = z.object({
  location: z.string().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
}).refine((d) => d.location || (d.lat !== undefined && d.lon !== undefined), {
  message: 'location veya lat+lon gerekli',
});

export type ForecastQuery = z.infer<typeof forecastQuerySchema>;
export type FrostRiskQuery = z.infer<typeof frostRiskQuerySchema>;
export type RainForecastQuery = z.infer<typeof rainForecastQuerySchema>;

/** Dahili moduller (Sera SaaS, Acik Tarla) — 3 saatlik OWM slotlari, hours max ~120 */
export const internalForecastQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  hours: z.coerce.number().min(6).max(120).default(48),
});

export const internalHistoricalQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  days: z.coerce.number().min(1).max(365).default(30),
});

export const internalHumidityQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});
