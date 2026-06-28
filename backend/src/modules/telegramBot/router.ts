import type { FastifyInstance } from 'fastify';
import { tarimiklimTelegramWebhookHandler } from './controller.js';

export async function registerTarimiklimTelegramBot(app: FastifyInstance) {
  app.post('/telegram/bot-webhook', { schema: { tags: ['Telegram:Tarimiklim'] } }, tarimiklimTelegramWebhookHandler);
}
