import type { FastifyInstance } from 'fastify';
import { listPublicHomeSectionsHandler } from './controller.js';

export async function registerHomeSections(app: FastifyInstance) {
  app.get('/home/sections', { schema: { tags: ['HomeSections'] } }, listPublicHomeSectionsHandler);
}
