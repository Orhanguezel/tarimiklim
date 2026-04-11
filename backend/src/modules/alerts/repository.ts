import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { weatherAlerts, alertRules, type WeatherAlert, type NewWeatherAlert, type AlertRule, type NewAlertRule } from './schema.js';

export async function repoGetAlerts(
  db: MySql2Database,
  params: { locationId?: string; alertType?: string; page: number; limit: number },
): Promise<{ items: WeatherAlert[]; total: number }> {
  const conditions = [];
  if (params.locationId) conditions.push(eq(weatherAlerts.locationId, params.locationId));
  if (params.alertType) conditions.push(eq(weatherAlerts.alertType, params.alertType));
  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (params.page - 1) * params.limit;

  const [items, countRows] = await Promise.all([
    db.select().from(weatherAlerts).where(where).orderBy(desc(weatherAlerts.createdAt)).limit(params.limit).offset(offset),
    db.select({ count: sql<number>`COUNT(*)` }).from(weatherAlerts).where(where),
  ]);

  return { items, total: Number(countRows[0]?.count ?? 0) };
}

export async function repoCreateAlert(db: MySql2Database, input: Omit<NewWeatherAlert, 'id' | 'createdAt'>): Promise<WeatherAlert> {
  const id = randomUUID();
  await db.insert(weatherAlerts).values({ ...input, id });
  const rows = await db.select().from(weatherAlerts).where(eq(weatherAlerts.id, id)).limit(1);
  return rows[0]!;
}

export async function repoMarkAlertSent(db: MySql2Database, id: string, recipients: number): Promise<void> {
  await db.update(weatherAlerts).set({ sentAt: new Date(), recipients }).where(eq(weatherAlerts.id, id));
}

export async function repoGetAlertRulesByLocation(db: MySql2Database, locationId: string): Promise<AlertRule[]> {
  return db.select().from(alertRules).where(and(eq(alertRules.locationId, locationId), eq(alertRules.isActive, 1)));
}

export async function repoGetAlertRulesByUser(db: MySql2Database, userId: string): Promise<AlertRule[]> {
  return db.select().from(alertRules).where(eq(alertRules.userId, userId));
}

export async function repoListAllAlertRules(db: MySql2Database, limit: number): Promise<AlertRule[]> {
  return db.select().from(alertRules).orderBy(desc(alertRules.createdAt)).limit(limit);
}

export async function repoCreateAlertRule(db: MySql2Database, input: Omit<NewAlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
  const id = randomUUID();
  await db.insert(alertRules).values({ ...input, id });
  const rows = await db.select().from(alertRules).where(eq(alertRules.id, id)).limit(1);
  return rows[0]!;
}

export async function repoDeleteAlertRule(db: MySql2Database, id: string): Promise<void> {
  await db.delete(alertRules).where(eq(alertRules.id, id));
}

// Don uyarisi spam kontolu: son 12 saat icinde ayni konum+tip icin uyari gonderildiyse true
export async function repoAlertSentRecently(db: MySql2Database, locationId: string, alertType: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const rows = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(weatherAlerts)
    .where(and(eq(weatherAlerts.locationId, locationId), eq(weatherAlerts.alertType, alertType), gte(weatherAlerts.sentAt, cutoff)));
  return Number(rows[0]?.count ?? 0) > 0;
}
