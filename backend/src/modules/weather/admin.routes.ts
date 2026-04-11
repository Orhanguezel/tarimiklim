import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@agro/shared-backend/middleware/auth';
import { requireAdmin } from '@agro/shared-backend/middleware/roles';
import { getForecastHandler, getFrostRiskHandler } from './controller.js';

export async function registerWeatherAdmin(app: FastifyInstance) {
  app.addHook('onRequest', requireAuth);
  app.addHook('onRequest', requireAdmin);

  // Admin icin detayli forecast
  app.get('/weather/forecast', { schema: { tags: ['Admin:Weather'] } }, getForecastHandler);
  app.get('/weather/frost-risk', { schema: { tags: ['Admin:Weather'] } }, getFrostRiskHandler);
}
