import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@agro/shared-backend/middleware/auth';
import {
  createMyAlertRuleHandler,
  deleteMyAlertRuleHandler,
  deleteMyPushTokenHandler,
  getMyTelegramChatIdHandler,
  listAlertsHandler,
  listMyAlertRulesHandler,
  listMyPushTokensHandler,
  updateMyAlertRuleHandler,
  updateMyTelegramChatIdHandler,
  upsertMyPushTokenHandler,
} from './controller.js';

export async function registerAlerts(app: FastifyInstance) {
  app.get('/alerts', { schema: { tags: ['Alerts'] } }, listAlertsHandler);
  app.get('/me/alert-rules', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, listMyAlertRulesHandler);
  app.post('/me/alert-rules', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, createMyAlertRuleHandler);
  app.patch('/me/alert-rules/:id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, updateMyAlertRuleHandler);
  app.delete('/me/alert-rules/:id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, deleteMyAlertRuleHandler);
  app.get('/me/telegram-chat-id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, getMyTelegramChatIdHandler);
  app.put('/me/telegram-chat-id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, updateMyTelegramChatIdHandler);
  app.get('/me/push-tokens', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, listMyPushTokensHandler);
  app.post('/me/push-tokens', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, upsertMyPushTokenHandler);
  app.delete('/me/push-tokens/:id', { onRequest: [requireAuth], schema: { tags: ['Alerts:Me'] } }, deleteMyPushTokenHandler);
}
