import { asc, eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { homeSections, type HomeSection, type NewHomeSection } from './schema.js';

export type HomeSectionCreateInput = {
  slug: string;
  label: string;
  component_key: string;
  order_index?: number;
  is_active?: number | boolean;
  config?: Record<string, unknown> | null;
};

export type HomeSectionUpdateInput = Partial<Omit<HomeSectionCreateInput, 'slug'>>;

function toDto(row: HomeSection) {
  let config: Record<string, unknown> | null = null;
  if (typeof row.config === 'string' && row.config.trim()) {
    try {
      config = JSON.parse(row.config) as Record<string, unknown>;
    } catch {
      config = null;
    }
  } else if (row.config && typeof row.config === 'object') {
    config = row.config as Record<string, unknown>;
  }

  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    component_key: row.componentKey,
    order_index: Number(row.orderIndex ?? 0),
    is_active: Number(row.isActive ?? 0),
    config,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function repoListHomeSections(db: MySql2Database, activeOnly = false) {
  const where = activeOnly ? eq(homeSections.isActive, 1) : undefined;
  const rows = await db.select().from(homeSections).where(where).orderBy(asc(homeSections.orderIndex), asc(homeSections.slug));
  return rows.map(toDto);
}

export async function repoGetHomeSection(db: MySql2Database, id: string) {
  const rows = await db.select().from(homeSections).where(eq(homeSections.id, id)).limit(1);
  return rows[0] ? toDto(rows[0]) : undefined;
}

export async function repoCreateHomeSection(db: MySql2Database, input: HomeSectionCreateInput) {
  const id = randomUUID();
  const row: NewHomeSection = {
    id,
    slug: input.slug,
    label: input.label,
    componentKey: input.component_key,
    orderIndex: Number(input.order_index ?? 0),
    isActive: input.is_active === false || input.is_active === 0 ? 0 : 1,
    config: input.config ? JSON.stringify(input.config) : null,
  };
  await db.insert(homeSections).values(row);
  return id;
}

export async function repoUpdateHomeSection(db: MySql2Database, id: string, input: HomeSectionUpdateInput) {
  const set: Partial<NewHomeSection> = {};
  if (input.label !== undefined) set.label = input.label;
  if (input.component_key !== undefined) set.componentKey = input.component_key;
  if (input.order_index !== undefined) set.orderIndex = Number(input.order_index);
  if (input.is_active !== undefined) set.isActive = input.is_active === false || input.is_active === 0 ? 0 : 1;
  if (input.config !== undefined) set.config = input.config ? JSON.stringify(input.config) : null;
  if (Object.keys(set).length) await db.update(homeSections).set(set).where(eq(homeSections.id, id));
  return repoGetHomeSection(db, id);
}

export async function repoDeleteHomeSection(db: MySql2Database, id: string) {
  await db.delete(homeSections).where(eq(homeSections.id, id));
}

export async function repoReorderHomeSections(db: MySql2Database, items: Array<{ id: string; order_index: number }>) {
  const ids = items.map((item) => item.id);
  const existing = ids.length ? await db.select({ id: homeSections.id }).from(homeSections).where(inArray(homeSections.id, ids)) : [];
  const existingIds = new Set(existing.map((row) => row.id));
  for (const item of items) {
    if (!existingIds.has(item.id)) continue;
    await db.update(homeSections).set({ orderIndex: Number(item.order_index) }).where(eq(homeSections.id, item.id));
  }
  return existingIds.size;
}
