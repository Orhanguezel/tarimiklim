import { eq, and, gte, desc, isNull } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { weatherForecasts, type NewWeatherForecast, type WeatherForecast } from './schema.js';

function dateKey(d: WeatherForecast['forecastDate']): string {
  return new Date(d as unknown as string | Date).toISOString().split('T')[0];
}

export async function repoGetForecastsByLocation(
  db: MySql2Database,
  locationId: string,
  fromDate: string,
): Promise<WeatherForecast[]> {
  const from = new Date(fromDate.includes('T') ? fromDate : `${fromDate}T00:00:00.000Z`);
  const rows = await db
    .select()
    .from(weatherForecasts)
    .where(and(eq(weatherForecasts.locationId, locationId), gte(weatherForecasts.forecastDate, from)))
    .orderBy(weatherForecasts.forecastDate, desc(weatherForecasts.fetchedAt));

  // hour=NULL gunluk satirlarda unique key devreye girmedigi icin ayni gune
  // birden fazla satir birikmis olabilir — gun basina en guncel satiri sec
  const byKey = new Map<string, WeatherForecast>();
  for (const r of rows) {
    const key = `${dateKey(r.forecastDate)}:${r.hour ?? 'daily'}`;
    if (!byKey.has(key)) byKey.set(key, r);
  }
  return [...byKey.values()];
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

function forecastUpdateSet(row: NewWeatherForecast) {
  return {
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
  };
}

export async function repoUpsertForecasts(db: MySql2Database, rows: NewWeatherForecast[]): Promise<void> {
  for (const row of rows) {
    // MySQL unique index NULL degerleri esit saymaz: hour=NULL gunluk satirlar
    // icin uk_location_date_hour calismaz, onDuplicateKeyUpdate hic tetiklenmez.
    // Bu yuzden gunluk satirlarda once UPDATE denenir, satir yoksa INSERT edilir.
    if (row.hour == null) {
      const [res] = await db
        .update(weatherForecasts)
        .set(forecastUpdateSet(row))
        .where(
          and(
            eq(weatherForecasts.locationId, row.locationId),
            eq(weatherForecasts.forecastDate, row.forecastDate),
            isNull(weatherForecasts.hour),
          ),
        );
      if (res.affectedRows > 0) continue;
    }
    await db
      .insert(weatherForecasts)
      .values(row)
      .onDuplicateKeyUpdate({ set: forecastUpdateSet(row) });
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
