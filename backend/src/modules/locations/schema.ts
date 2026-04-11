import { mysqlTable, varchar, decimal, tinyint, datetime, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const locations = mysqlTable(
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

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
