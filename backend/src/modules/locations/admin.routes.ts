import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@agro/shared-backend/middleware/auth';
import { requireAdmin } from '@agro/shared-backend/middleware/roles';
import {
  listLocationsHandler,
  getLocationBySlugHandler,
  createLocationHandler,
  updateLocationHandler,
  deleteLocationHandler,
} from './controller.js';

export async function registerLocationsAdmin(app: FastifyInstance) {
  app.addHook('onRequest', requireAuth);
  app.addHook('onRequest', requireAdmin);

  app.get('/locations', { schema: { tags: ['Admin:Locations'] } }, listLocationsHandler);
  app.get('/locations/:slug', { schema: { tags: ['Admin:Locations'] } }, getLocationBySlugHandler);
  app.post('/locations', { schema: { tags: ['Admin:Locations'] } }, createLocationHandler);
  app.put('/locations/:id', { schema: { tags: ['Admin:Locations'] } }, updateLocationHandler);
  app.delete('/locations/:id', { schema: { tags: ['Admin:Locations'] } }, deleteLocationHandler);
}
