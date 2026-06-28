import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@agro/shared-backend/middleware/auth';
import { requireAdmin } from '@agro/shared-backend/middleware/roles';
import {
  createHomeSectionAdminHandler,
  deleteHomeSectionAdminHandler,
  getHomeSectionAdminHandler,
  listHomeSectionsAdminHandler,
  reorderHomeSectionsAdminHandler,
  updateHomeSectionAdminHandler,
} from './controller.js';

export async function registerHomeSectionsAdmin(app: FastifyInstance) {
  app.addHook('onRequest', requireAuth);
  app.addHook('onRequest', requireAdmin);

  app.get('/home/sections', { schema: { tags: ['Admin:HomeSections'] } }, listHomeSectionsAdminHandler);
  app.get('/home/sections/:id', { schema: { tags: ['Admin:HomeSections'] } }, getHomeSectionAdminHandler);
  app.post('/home/sections', { schema: { tags: ['Admin:HomeSections'] } }, createHomeSectionAdminHandler);
  app.patch('/home/sections/:id', { schema: { tags: ['Admin:HomeSections'] } }, updateHomeSectionAdminHandler);
  app.delete('/home/sections/:id', { schema: { tags: ['Admin:HomeSections'] } }, deleteHomeSectionAdminHandler);
  app.post('/home/sections/reorder', { schema: { tags: ['Admin:HomeSections'] } }, reorderHomeSectionsAdminHandler);
}
