import { eq, and, like, sql, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { locations, type Location, type NewLocation } from './schema.js';
import type { CreateLocationInput, UpdateLocationInput } from './validation.js';

export async function repoGetLocations(
  db: MySql2Database,
  params: { city?: string; region?: string; active?: boolean; page: number; limit: number },
): Promise<{ items: Location[]; total: number }> {
  const conditions = [];
  if (params.active !== undefined) conditions.push(eq(locations.isActive, params.active ? 1 : 0));
  if (params.city) conditions.push(like(locations.city, `%${params.city}%`));
  if (params.region) conditions.push(like(locations.region, `%${params.region}%`));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (params.page - 1) * params.limit;

  const [items, countRows] = await Promise.all([
    db.select().from(locations).where(where).limit(params.limit).offset(offset),
    db.select({ count: sql<number>`COUNT(*)` }).from(locations).where(where),
  ]);

  return { items, total: Number(countRows[0]?.count ?? 0) };
}

export async function repoGetAllActiveLocations(db: MySql2Database): Promise<Location[]> {
  return db.select().from(locations).where(eq(locations.isActive, 1)).orderBy(desc(locations.name));
}

export async function repoGetLocationBySlug(db: MySql2Database, slug: string): Promise<Location | undefined> {
  const rows = await db.select().from(locations).where(eq(locations.slug, slug)).limit(1);
  return rows[0];
}

export async function repoGetLocationById(db: MySql2Database, id: string): Promise<Location | undefined> {
  const rows = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return rows[0];
}

export async function repoGetLocationByCoords(
  db: MySql2Database,
  lat: number,
  lon: number,
  tolerance: number,
): Promise<Location | undefined> {
  const rows = await db
    .select()
    .from(locations)
    .where(
      and(
        sql`ABS(CAST(${locations.latitude} AS DECIMAL(10,7)) - ${lat}) < ${tolerance}`,
        sql`ABS(CAST(${locations.longitude} AS DECIMAL(10,7)) - ${lon}) < ${tolerance}`,
      ),
    )
    .limit(1);
  return rows[0];
}

export async function repoCreateLocation(db: MySql2Database, input: CreateLocationInput): Promise<Location> {
  const id = randomUUID();
  const row: NewLocation = {
    id,
    name: input.name,
    slug: input.slug,
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    city: input.city,
    district: input.district,
    region: input.region,
    timezone: input.timezone,
    isActive: input.isActive ? 1 : 0,
  };
  await db.insert(locations).values(row);
  return (await repoGetLocationById(db, id))!;
}

export async function repoUpdateLocation(
  db: MySql2Database,
  id: string,
  input: UpdateLocationInput,
): Promise<Location | undefined> {
  const set: Partial<NewLocation> = {};
  if (input.name !== undefined) set.name = input.name;
  if (input.slug !== undefined) set.slug = input.slug;
  if (input.latitude !== undefined) set.latitude = String(input.latitude);
  if (input.longitude !== undefined) set.longitude = String(input.longitude);
  if (input.city !== undefined) set.city = input.city;
  if (input.district !== undefined) set.district = input.district;
  if (input.region !== undefined) set.region = input.region;
  if (input.timezone !== undefined) set.timezone = input.timezone;
  if (input.isActive !== undefined) set.isActive = input.isActive ? 1 : 0;
  if (Object.keys(set).length) await db.update(locations).set(set).where(eq(locations.id, id));
  return repoGetLocationById(db, id);
}

export async function repoDeleteLocation(db: MySql2Database, id: string): Promise<void> {
  await db.delete(locations).where(eq(locations.id, id));
}
