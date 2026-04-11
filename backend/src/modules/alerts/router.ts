import type { FastifyInstance } from 'fastify';
import { listAlertsHandler } from './controller.js';

export async function registerAlerts(app: FastifyInstance) {
  app.get('/alerts', { schema: { tags: ['Alerts'] } }, listAlertsHandler);
}
