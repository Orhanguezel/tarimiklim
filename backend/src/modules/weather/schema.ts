import { mysqlTable, varchar, decimal, tinyint, datetime, date, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const weatherLocations = mysqlTable(
  'weather_locations',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    city: varchar('city', { length: 100 }),
    district: varchar('district', { length: 100 }),
    region: varchar('region', { length: 100 }),
    timezone: varchar('timezone', { length: 50 }).default('Europe/Istanbul'),
    isActive: tinyint('is_active').default(1),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW() ON UPDATE NOW()`),
  },
  (t) => ({
    slugIdx: uniqueIndex('idx_slug').on(t.slug),
    activeIdx: index('idx_active').on(t.isActive),
    cityIdx: index('idx_city').on(t.city),
  }),
);

export const weatherForecasts = mysqlTable(
  'weather_forecasts',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    locationId: varchar('location_id', { length: 36 }).notNull(),
    forecastDate: date('forecast_date').notNull(),
    hour: tinyint('hour'),
    tempMin: decimal('temp_min', { precision: 5, scale: 2 }),
    tempMax: decimal('temp_max', { precision: 5, scale: 2 }),
    tempAvg: decimal('temp_avg', { precision: 5, scale: 2 }),
    humidity: tinyint('humidity'),
    windSpeed: decimal('wind_speed', { precision: 5, scale: 2 }),
    windDirection: varchar('wind_direction', { length: 10 }),
    precipitation: decimal('precipitation', { precision: 5, scale: 2 }),
    condition: varchar('condition', { length: 50 }),
    icon: varchar('icon', { length: 20 }),
    uvIndex: tinyint('uv_index'),
    frostRisk: tinyint('frost_risk').default(0),
    dataSource: varchar('data_source', { length: 50 }),
    fetchedAt: datetime('fetched_at').notNull(),
    createdAt: datetime('created_at').default(sql`NOW()`),
  },
  (t) => ({
    locationDateIdx: index('idx_location_date').on(t.locationId, t.forecastDate),
    frostIdx: index('idx_frost').on(t.frostRisk, t.forecastDate),
    uniqueKey: uniqueIndex('uk_location_date_hour').on(t.locationId, t.forecastDate, t.hour),
  }),
);

export type WeatherLocation = typeof weatherLocations.$inferSelect;
export type NewWeatherLocation = typeof weatherLocations.$inferInsert;
export type WeatherForecast = typeof weatherForecasts.$inferSelect;
export type NewWeatherForecast = typeof weatherForecasts.$inferInsert;
