import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@agro/shared-backend/middleware/auth';
import {
  createMyAlertRuleHandler,
  deleteMyAlertRuleHandler,
  getMyTelegramChatIdHandler,
  listAlertsHandler,
  listMyAlertRulesHandler,
  updateMyAlertRuleHandler,
  updateMyTelegramChatIdHandler,
} from './controller.js';

export async function registerAlerts(app: FastifyInstance) {
  app.get('/alerts', { schema: { tags: ['Alerts'] } }, listAlertsHandler);
  app.get('/me/alert-rules', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, listMyAlertRulesHandler);
  app.post('/me/alert-rules', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, createMyAlertRuleHandler);
  app.patch('/me/alert-rules/:id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, updateMyAlertRuleHandler);
  app.delete('/me/alert-rules/:id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, deleteMyAlertRuleHandler);
  app.get('/me/telegram-chat-id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, getMyTelegramChatIdHandler);
  app.put('/me/telegram-chat-id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, updateMyTelegramChatIdHandler);
}
