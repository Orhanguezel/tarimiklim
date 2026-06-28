import { mysqlTable, varchar, tinyint, datetime, int, longtext, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const homeSections = mysqlTable(
  'home_sections',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    componentKey: varchar('component_key', { length: 100 }).notNull(),
    orderIndex: int('order_index').notNull().default(0),
    isActive: tinyint('is_active').notNull().default(1),
    config: longtext('config'),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW() ON UPDATE NOW()`),
  },
  (t) => ({
    slugUq: uniqueIndex('home_sections_slug_uq').on(t.slug),
    activeOrderIdx: index('home_sections_active_order_idx').on(t.isActive, t.orderIndex),
    orderIdx: index('home_sections_order_idx').on(t.orderIndex),
  }),
);

export type HomeSection = typeof homeSections.$inferSelect;
export type NewHomeSection = typeof homeSections.$inferInsert;
