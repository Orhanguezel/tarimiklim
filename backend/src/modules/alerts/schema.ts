import { mysqlTable, varchar, tinyint, datetime, date, text, json, int, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const weatherAlerts = mysqlTable(
  'weather_alerts',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }),
    locationId: varchar('location_id', { length: 36 }).notNull(),
    alertType: varchar('alert_type', { length: 20 }).notNull(), // frost|heavy_rain|storm|heat|humidity
    severity: varchar('severity', { length: 20 }).notNull(),    // info|warning|critical
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    threshold: varchar('threshold', { length: 50 }),
    actualValue: varchar('actual_value', { length: 50 }),
    forecastDate: date('forecast_date').notNull(),
    sentAt: datetime('sent_at'),
    channels: json('channels'),         // ["telegram","push","email"]
    recipients: int('recipients').default(0),
    createdAt: datetime('created_at').default(sql`NOW()`),
  },
  (t) => ({
    userLocationTypeDateIdx: index('idx_user_location_type_date').on(t.userId, t.locationId, t.alertType, t.forecastDate),
    locationTypeIdx: index('idx_location_type').on(t.locationId, t.alertType),
    dateIdx: index('idx_date').on(t.forecastDate),
    severityIdx: index('idx_severity').on(t.severity),
  }),
);

export const alertRules = mysqlTable(
  'weather_alert_rules',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    locationId: varchar('location_id', { length: 36 }).notNull(),
    alertType: varchar('alert_type', { length: 20 }).notNull(),
    threshold: varchar('threshold', { length: 50 }).notNull(),  // JSON olarak sakla: "2.0"
    channel: varchar('channel', { length: 20 }).notNull(),      // telegram|push|email
    isActive: tinyint('is_active').default(1),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW() ON UPDATE NOW()`),
  },
  (t) => ({
    userIdx: index('idx_user').on(t.userId),
    locationIdx: index('idx_location').on(t.locationId),
    activeIdx: index('idx_active').on(t.isActive),
  }),
);

export const userPushTokens = mysqlTable(
  'user_push_tokens',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    token: varchar('token', { length: 512 }).notNull(),
    provider: varchar('provider', { length: 20 }).notNull(), // fcm|expo
    platform: varchar('platform', { length: 20 }).notNull(), // ios|android|web|unknown
    deviceId: varchar('device_id', { length: 128 }),
    isActive: tinyint('is_active').default(1),
    lastSeenAt: datetime('last_seen_at').default(sql`NOW()`),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW() ON UPDATE NOW()`),
  },
  (t) => ({
    userTokenUnique: uniqueIndex('uq_user_push_token').on(t.userId, t.token),
    userIdx: index('idx_user_push_tokens_user').on(t.userId),
    activeIdx: index('idx_user_push_tokens_active').on(t.isActive),
    providerIdx: index('idx_user_push_tokens_provider').on(t.provider),
  }),
);

export type WeatherAlert = typeof weatherAlerts.$inferSelect;
export type NewWeatherAlert = typeof weatherAlerts.$inferInsert;
export type AlertRule = typeof alertRules.$inferSelect;
export type NewAlertRule = typeof alertRules.$inferInsert;
export type UserPushToken = typeof userPushTokens.$inferSelect;
export type NewUserPushToken = typeof userPushTokens.$inferInsert;
