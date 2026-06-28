import type { FastifyInstance } from 'fastify';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
import {
  isTelegramUserTextMessage,
  mapTelegramInboundInsert,
  repoInsertInbound,
  telegramSendRaw,
} from '@agro/shared-backend/modules/telegram';
import { repoCreateAlertRule, repoUpdateTelegramChatId } from '@/modules/alerts/repository.js';
import { repoGetLocationBySlug } from '@/modules/locations/repository.js';
import type { TarimiklimTelegramWebhook } from './validation.js';

type BotResult = {
  ok: true;
  handled: boolean;
  command?: string;
  reason?: string;
};

type LinkedUser = {
  userId: string;
  email: string | null;
};

type LocationRow = {
  id: string;
  name: string;
  slug: string;
};

function chatIdFromUpdate(update: TarimiklimTelegramWebhook): string | null {
  const raw = update.message?.chat?.id;
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return null;
}

function textFromUpdate(update: TarimiklimTelegramWebhook): string {
  return String(update.message?.text ?? '').trim();
}

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function sendReply(chatId: string | null, text: string): Promise<void> {
  if (!chatId) return;
  await telegramSendRaw({ chatId, text });
}

async function persistInbound(update: TarimiklimTelegramWebhook): Promise<void> {
  const inbound = mapTelegramInboundInsert(update);
  if (!inbound) return;
  try {
    await repoInsertInbound(inbound);
  } catch {
    // Telegram may retry the same update; the inbound table has a unique key.
  }
}

async function userFromChatId(db: MySql2Database, chatId: string): Promise<LinkedUser | null> {
  const rows = await db.execute(sql`
    SELECT p.id AS userId, u.email
    FROM profiles p
    LEFT JOIN users u ON u.id = p.id
    WHERE p.telegram_chat_id = ${chatId}
    LIMIT 1
  `);
  const list = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
  const first = Array.isArray(list) ? (list[0] as LinkedUser | undefined) : undefined;
  return first?.userId ? first : null;
}

async function locationByUserInput(db: MySql2Database, raw: string): Promise<LocationRow | null> {
  const slug = normalizeSlug(raw);
  const direct = await repoGetLocationBySlug(db, slug);
  if (direct) return { id: direct.id, name: direct.name, slug: direct.slug };

  const like = `%${raw.trim()}%`;
  const rows = await db.execute(sql`
    SELECT id, name, slug
    FROM weather_locations
    WHERE is_active = 1
      AND (name LIKE ${like} OR city LIKE ${like} OR slug LIKE ${`%${slug}%`})
    ORDER BY
      CASE WHEN slug = ${slug} THEN 0 ELSE 1 END,
      name ASC
    LIMIT 1
  `);
  const list = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
  const first = Array.isArray(list) ? (list[0] as LocationRow | undefined) : undefined;
  return first?.id ? first : null;
}

async function hasAlertRule(db: MySql2Database, userId: string, locationId: string, alertType: string, channel: string): Promise<boolean> {
  const rows = await db.execute(sql`
    SELECT id
    FROM weather_alert_rules
    WHERE user_id = ${userId}
      AND location_id = ${locationId}
      AND alert_type = ${alertType}
      AND channel = ${channel}
    LIMIT 1
  `);
  const list = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
  return Array.isArray(list) && list.length > 0;
}

async function reactivateAlertRule(db: MySql2Database, userId: string, locationId: string, alertType: string, threshold: string, channel: string) {
  await db.execute(sql`
    UPDATE weather_alert_rules
    SET threshold = ${threshold}, is_active = 1, updated_at = NOW()
    WHERE user_id = ${userId}
      AND location_id = ${locationId}
      AND alert_type = ${alertType}
      AND channel = ${channel}
  `);
}

async function unsubscribeAll(db: MySql2Database, userId: string): Promise<number> {
  const rows = await db.execute(sql`
    UPDATE weather_alert_rules
    SET is_active = 0, updated_at = NOW()
    WHERE user_id = ${userId}
      AND is_active = 1
  `);
  const packet = Array.isArray(rows) ? (rows[0] as { affectedRows?: number } | undefined) : undefined;
  return Number(packet?.affectedRows ?? 0);
}

async function handleStart(app: FastifyInstance, db: MySql2Database, chatId: string | null, args: string[]): Promise<BotResult> {
  const token = args[0]?.trim();
  if (!chatId) return { ok: true, handled: false, command: 'start', reason: 'chat_id_missing' };
  if (!token) {
    await sendReply(chatId, 'Hesabınızı bağlamak için uygulamadaki Telegram bağlantı koduyla /start <kod> gönderin.');
    return { ok: true, handled: true, command: 'start', reason: 'token_missing' };
  }

  try {
    const payload = await (app as any).jwt.verify(token);
    const userId = String(payload?.sub ?? '').trim();
    if (!userId) throw new Error('sub_missing');
    await repoUpdateTelegramChatId(db, userId, chatId);
    await sendReply(chatId, 'Telegram hesabınız Tarım İklim üyeliğinizle eşleştirildi. Örnek: /subscribe antalya frost');
    return { ok: true, handled: true, command: 'start' };
  } catch {
    await sendReply(chatId, 'Bağlantı kodu geçersiz ya da süresi dolmuş. Uygulamadan yeni kod alıp tekrar deneyin.');
    return { ok: true, handled: true, command: 'start', reason: 'invalid_token' };
  }
}

async function handleSubscribe(db: MySql2Database, chatId: string | null, args: string[]): Promise<BotResult> {
  if (!chatId) return { ok: true, handled: false, command: 'subscribe', reason: 'chat_id_missing' };
  const user = await userFromChatId(db, chatId);
  if (!user) {
    await sendReply(chatId, 'Önce hesabınızı bağlayın: /start <kod>');
    return { ok: true, handled: true, command: 'subscribe', reason: 'user_not_linked' };
  }

  const locationInput = args[0]?.trim();
  const alertType = args[1]?.trim() || 'frost';
  const threshold = args[2]?.trim() || '30';
  if (!locationInput) {
    await sendReply(chatId, 'Kullanım: /subscribe antalya frost');
    return { ok: true, handled: true, command: 'subscribe', reason: 'location_missing' };
  }
  if (!['frost', 'heavy_rain', 'storm', 'heat', 'humidity'].includes(alertType)) {
    await sendReply(chatId, 'Uyarı tipi geçersiz. Örnek: frost');
    return { ok: true, handled: true, command: 'subscribe', reason: 'alert_type_invalid' };
  }

  const location = await locationByUserInput(db, locationInput);
  if (!location) {
    await sendReply(chatId, `Konum bulunamadı: ${locationInput}`);
    return { ok: true, handled: true, command: 'subscribe', reason: 'location_not_found' };
  }

  if (await hasAlertRule(db, user.userId, location.id, alertType, 'telegram')) {
    await reactivateAlertRule(db, user.userId, location.id, alertType, threshold, 'telegram');
  } else {
    await repoCreateAlertRule(db, {
      userId: user.userId,
      locationId: location.id,
      alertType,
      threshold,
      channel: 'telegram',
      isActive: 1,
    });
  }

  await sendReply(chatId, `${location.name} için ${alertType} Telegram aboneliğiniz aktif.`);
  return { ok: true, handled: true, command: 'subscribe' };
}

async function handleUnsubscribe(db: MySql2Database, chatId: string | null): Promise<BotResult> {
  if (!chatId) return { ok: true, handled: false, command: 'unsubscribe', reason: 'chat_id_missing' };
  const user = await userFromChatId(db, chatId);
  if (!user) {
    await sendReply(chatId, 'Bu Telegram hesabı henüz bir üyelikle eşleşmemiş.');
    return { ok: true, handled: true, command: 'unsubscribe', reason: 'user_not_linked' };
  }
  const count = await unsubscribeAll(db, user.userId);
  await sendReply(chatId, count > 0 ? 'Tüm uyarı abonelikleriniz pasifleştirildi.' : 'Aktif aboneliğiniz yok.');
  return { ok: true, handled: true, command: 'unsubscribe' };
}

export async function processTarimiklimTelegramWebhook(app: FastifyInstance, update: TarimiklimTelegramWebhook): Promise<BotResult> {
  await persistInbound(update);
  if (!isTelegramUserTextMessage(update)) return { ok: true, handled: false, reason: 'not_user_text' };

  const db = (app as any).db as MySql2Database;
  const chatId = chatIdFromUpdate(update);
  const text = textFromUpdate(update);
  const [commandRaw = '', ...args] = text.split(/\s+/);
  const command = commandRaw.split('@')[0]?.toLowerCase();

  if (command === '/start') return handleStart(app, db, chatId, args);
  if (command === '/subscribe') return handleSubscribe(db, chatId, args);
  if (command === '/unsubscribe') return handleUnsubscribe(db, chatId);

  if (command?.startsWith('/')) {
    await sendReply(chatId, 'Komutlar: /start <kod>, /subscribe antalya frost, /unsubscribe');
    return { ok: true, handled: true, command, reason: 'unknown_command' };
  }

  return { ok: true, handled: false, reason: 'not_command' };
}
