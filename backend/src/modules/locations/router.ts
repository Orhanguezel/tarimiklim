import type { FastifyInstance } from 'fastify';
import { listLocationsHandler, getLocationBySlugHandler } from './controller.js';

export async function registerLocations(app: FastifyInstance) {
  app.get('/locations', { schema: { tags: ['Locations'] } }, listLocationsHandler);
  app.get('/locations/:slug', { schema: { tags: ['Locations'] } }, getLocationBySlugHandler);
}
