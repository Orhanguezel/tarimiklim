import { eq, and, gte, desc } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { weatherForecasts, type NewWeatherForecast, type WeatherForecast } from './schema.js';

export async function repoGetForecastsByLocation(
  db: MySql2Database,
  locationId: string,
  fromDate: string,
): Promise<WeatherForecast[]> {
  const from = new Date(fromDate.includes('T') ? fromDate : `${fromDate}T00:00:00.000Z`);
  return db
    .select()
    .from(weatherForecasts)
    .where(and(eq(weatherForecasts.locationId, locationId), gte(weatherForecasts.forecastDate, from)))
    .orderBy(weatherForecasts.forecastDate);
}

export async function repoGetLatestForecast(
  db: MySql2Database,
  locationId: string,
  forecastDate: string,
): Promise<WeatherForecast | undefined> {
  const d = new Date(forecastDate.includes('T') ? forecastDate : `${forecastDate}T00:00:00.000Z`);
  const rows = await db
    .select()
    .from(weatherForecasts)
    .where(and(eq(weatherForecasts.locationId, locationId), eq(weatherForecasts.forecastDate, d)))
    .orderBy(desc(weatherForecasts.fetchedAt))
    .limit(1);
  return rows[0];
}

export async function repoUpsertForecasts(db: MySql2Database, rows: NewWeatherForecast[]): Promise<void> {
  if (!rows.length) return;
  for (const row of rows) {
    await db
      .insert(weatherForecasts)
      .values(row)
      .onDuplicateKeyUpdate({
        set: {
          tempMin: row.tempMin,
          tempMax: row.tempMax,
          tempAvg: row.tempAvg,
          humidity: row.humidity,
          windSpeed: row.windSpeed,
          windDirection: row.windDirection,
          precipitation: row.precipitation,
          condition: row.condition,
          icon: row.icon,
          uvIndex: row.uvIndex,
          frostRisk: row.frostRisk,
          fetchedAt: row.fetchedAt,
        },
      });
  }
}

export async function repoGetFrostForecastsAboveThreshold(
  db: MySql2Database,
  locationId: string,
  minScore: number,
): Promise<WeatherForecast[]> {
  return db
    .select()
    .from(weatherForecasts)
    .where(and(eq(weatherForecasts.locationId, locationId), gte(weatherForecasts.frostRisk, minScore)))
    .orderBy(weatherForecasts.forecastDate);
}
