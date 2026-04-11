/**
 * Startup'ta TELEGRAM_BOT_TOKEN ve TELEGRAM_ALERT_CHANNEL_ID env var'larini
 * site_settings tablosuna yazar. Bu sayede telegramNotify() shared paketten
 * DB okuyarak calisir — env restart gerekmez, admin panel'den de degistirilebilir.
 */

import { db } from '@agro/shared-backend/db/client';
import { siteSettings } from '@agro/shared-backend/modules/siteSettings';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const KEYS = [
  { key: 'telegram_enabled', envValue: () => (process.env.TELEGRAM_BOT_TOKEN ? '1' : '0') },
  { key: 'telegram_bot_token', envValue: () => process.env.TELEGRAM_BOT_TOKEN ?? '' },
  { key: 'telegram_default_chat_id', envValue: () => process.env.TELEGRAM_ALERT_CHANNEL_ID ?? '' },
] as const;

export async function syncTelegramEnvToDb(): Promise<void> {
  for (const { key, envValue } of KEYS) {
    const val = envValue();
    if (!val && key !== 'telegram_enabled') continue; // bos token/chat_id yazma

    try {
      const existing = await db
        .select({ id: siteSettings.id })
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteSettings)
          .set({ value: val })
          .where(eq(siteSettings.key, key));
      } else {
        await db.insert(siteSettings).values({
          id: randomUUID(),
          key,
          locale: '*',
          value: val,
        });
      }
    } catch (err) {
      console.warn(`[telegram-sync] ${key} yazılamadı:`, err);
    }
  }
}
