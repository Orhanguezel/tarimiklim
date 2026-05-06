import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { weatherAlerts, alertRules, type WeatherAlert, type NewWeatherAlert, type AlertRule, type NewAlertRule } from './schema.js';

export type AlertRuleWithUser = AlertRule & {
  userEmail: string | null;
  userFullName: string | null;
  telegramChatId: string | null;
};

export type SubscribedAlertUser = {
  ruleId: string;
  userId: string;
  email: string | null;
  fullName: string | null;
  telegramChatId: string | null;
  locationId: string;
  alertType: string;
  threshold: string;
  channel: string;
};

function rowsFromExecute<T>(result: unknown): T[] {
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0] as T[];
  if (Array.isArray(result)) return result as T[];
  return [];
}

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

export async function repoListAllAlertRulesWithUsers(db: MySql2Database, limit: number): Promise<AlertRuleWithUser[]> {
  const rows = await db.execute(sql`
    SELECT
      ar.id,
      ar.user_id AS userId,
      ar.location_id AS locationId,
      ar.alert_type AS alertType,
      ar.threshold,
      ar.channel,
      ar.is_active AS isActive,
      ar.created_at AS createdAt,
      ar.updated_at AS updatedAt,
      u.email AS userEmail,
      u.full_name AS userFullName,
      p.telegram_chat_id AS telegramChatId
    FROM weather_alert_rules ar
    LEFT JOIN users u ON u.id = ar.user_id
    LEFT JOIN profiles p ON p.id = ar.user_id
    ORDER BY ar.created_at DESC
    LIMIT ${limit}
  `);
  return rowsFromExecute<AlertRuleWithUser>(rows);
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

export async function repoDeleteAlertRuleForUser(db: MySql2Database, id: string, userId: string): Promise<void> {
  await db.delete(alertRules).where(and(eq(alertRules.id, id), eq(alertRules.userId, userId)));
}

export async function repoUpdateAlertRuleActiveForUser(
  db: MySql2Database,
  id: string,
  userId: string,
  isActive: boolean,
): Promise<AlertRule | undefined> {
  await db
    .update(alertRules)
    .set({ isActive: isActive ? 1 : 0, updatedAt: new Date() })
    .where(and(eq(alertRules.id, id), eq(alertRules.userId, userId)));
  const rows = await db
    .select()
    .from(alertRules)
    .where(and(eq(alertRules.id, id), eq(alertRules.userId, userId)))
    .limit(1);
  return rows[0];
}

export async function repoGetSubscribedUsersForLocation(
  db: MySql2Database,
  locationId: string,
  alertType: string,
): Promise<SubscribedAlertUser[]> {
  const rows = await db.execute(sql`
    SELECT
      ar.id AS ruleId,
      ar.user_id AS userId,
      u.email,
      u.full_name AS fullName,
      p.telegram_chat_id AS telegramChatId,
      ar.location_id AS locationId,
      ar.alert_type AS alertType,
      ar.threshold,
      ar.channel
    FROM weather_alert_rules ar
    INNER JOIN users u ON u.id = ar.user_id AND u.is_active = 1
    LEFT JOIN profiles p ON p.id = ar.user_id
    WHERE ar.location_id = ${locationId}
      AND ar.alert_type = ${alertType}
      AND ar.is_active = 1
  `);
  return rowsFromExecute<SubscribedAlertUser>(rows);
}

export async function repoGetTelegramChatId(db: MySql2Database, userId: string): Promise<string | null> {
  const rows = await db.execute(sql`
    SELECT telegram_chat_id AS telegramChatId
    FROM profiles
    WHERE id = ${userId}
    LIMIT 1
  `);
  return rowsFromExecute<{ telegramChatId: string | null }>(rows)[0]?.telegramChatId ?? null;
}

export async function repoUpdateTelegramChatId(db: MySql2Database, userId: string, chatId: string | null): Promise<string | null> {
  await db.execute(sql`
    INSERT INTO profiles (id, telegram_chat_id)
    VALUES (${userId}, ${chatId})
    ON DUPLICATE KEY UPDATE telegram_chat_id = VALUES(telegram_chat_id)
  `);
  return repoGetTelegramChatId(db, userId);
}

// Don uyarisi spam kontrolu: son 12 saat icinde ayni user+konum+tip+tarih icin uyari gonderildiyse true
export async function repoAlertSentRecently(
  db: MySql2Database,
  locationId: string,
  alertType: string,
  userId?: string | null,
  forecastDate?: Date | string | null,
): Promise<boolean> {
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const conditions = [
    eq(weatherAlerts.locationId, locationId),
    eq(weatherAlerts.alertType, alertType),
    gte(weatherAlerts.sentAt, cutoff),
  ];
  if (userId) conditions.push(eq(weatherAlerts.userId, userId));
  if (forecastDate) conditions.push(eq(weatherAlerts.forecastDate, forecastDate as any));
  const rows = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(weatherAlerts)
    .where(and(...conditions));
  return Number(rows[0]?.count ?? 0) > 0;
}
