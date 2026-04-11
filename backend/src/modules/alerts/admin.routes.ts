import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@agro/shared-backend/middleware/auth';
import { requireAdmin } from '@agro/shared-backend/middleware/roles';
import {
  adminListAlertsHandler,
  adminTriggerFrostCheckHandler,
  adminListAlertRulesHandler,
  adminCreateAlertRuleHandler,
  adminDeleteAlertRuleHandler,
} from './admin.controller.js';

export async function registerAlertsAdmin(app: FastifyInstance) {
  app.addHook('onRequest', requireAuth);
  app.addHook('onRequest', requireAdmin);

  app.get('/alerts', { schema: { tags: ['Admin:Alerts'] } }, adminListAlertsHandler);
  app.post('/alerts/frost-check/:locationId', { schema: { tags: ['Admin:Alerts'] } }, adminTriggerFrostCheckHandler);
  app.get('/alerts/rules', { schema: { tags: ['Admin:Alerts'] } }, adminListAlertRulesHandler);
  app.post('/alerts/rules', { schema: { tags: ['Admin:Alerts'] } }, adminCreateAlertRuleHandler);
  app.delete('/alerts/rules/:id', { schema: { tags: ['Admin:Alerts'] } }, adminDeleteAlertRuleHandler);
}
