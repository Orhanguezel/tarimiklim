import type { FastifyInstance } from 'fastify';
import { publicNavigationHandler } from './controller.js';

export async function registerNavigation(app: FastifyInstance) {
  app.get('/navigation', { schema: { tags: ['Navigation'] } }, publicNavigationHandler);
}
