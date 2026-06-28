import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@agro/shared-backend/middleware/auth';
import { requireAdmin } from '@agro/shared-backend/middleware/roles';
import {
  createFooterSectionAdminHandler,
  deleteFooterSectionAdminHandler,
  getFooterSectionAdminHandler,
  getFooterSectionBySlugAdminHandler,
  listFooterSectionsAdminHandler,
  updateFooterSectionAdminHandler,
} from './controller.js';

export async function registerNavigationAdmin(app: FastifyInstance) {
  app.addHook('onRequest', requireAuth);
  app.addHook('onRequest', requireAdmin);

  app.get('/footer_sections', { schema: { tags: ['Admin:FooterSections'] } }, listFooterSectionsAdminHandler);
  app.get('/footer_sections/by-slug/:slug', { schema: { tags: ['Admin:FooterSections'] } }, getFooterSectionBySlugAdminHandler);
  app.get('/footer_sections/:id', { schema: { tags: ['Admin:FooterSections'] } }, getFooterSectionAdminHandler);
  app.post('/footer_sections', { schema: { tags: ['Admin:FooterSections'] } }, createFooterSectionAdminHandler);
  app.patch('/footer_sections/:id', { schema: { tags: ['Admin:FooterSections'] } }, updateFooterSectionAdminHandler);
  app.delete('/footer_sections/:id', { schema: { tags: ['Admin:FooterSections'] } }, deleteFooterSectionAdminHandler);
}
