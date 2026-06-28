import { TelegramWebhookBodySchema } from '@agro/shared-backend/modules/telegram';
import type { z } from 'zod';

export const tarimiklimTelegramWebhookSchema = TelegramWebhookBodySchema;
export type TarimiklimTelegramWebhook = z.infer<typeof tarimiklimTelegramWebhookSchema>;
