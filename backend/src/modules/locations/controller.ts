import type { FastifyRequest, FastifyReply } from 'fastify';
import { handleRouteError, sendNotFound } from '@agro/shared-backend/modules/_shared/http';
import {
  repoGetLocations,
  repoGetLocationBySlug,
  repoCreateLocation,
  repoUpdateLocation,
  repoDeleteLocation,
} from './repository.js';
import { createLocationSchema, updateLocationSchema, listLocationsQuerySchema } from './validation.js';

export async function listLocationsHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = listLocationsQuerySchema.parse(req.query);
    const result = await repoGetLocations((req.server as any).db, query);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleRouteError(reply, req, err, 'locations.list');
  }
}

export async function getLocationBySlugHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug } = req.params as { slug: string };
    const location = await repoGetLocationBySlug((req.server as any).db, slug);
    if (!location) return sendNotFound(reply);
    return reply.send({ success: true, data: location });
  } catch (err) {
    return handleRouteError(reply, req, err, 'locations.getBySlug');
  }
}

export async function createLocationHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = createLocationSchema.parse(req.body);
    const location = await repoCreateLocation((req.server as any).db, body);
    return reply.status(201).send({ success: true, data: location });
  } catch (err) {
    return handleRouteError(reply, req, err, 'locations.create');
  }
}

export async function updateLocationHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const body = updateLocationSchema.parse(req.body);
    const location = await repoUpdateLocation((req.server as any).db, id, body);
    if (!location) return sendNotFound(reply);
    return reply.send({ success: true, data: location });
  } catch (err) {
    return handleRouteError(reply, req, err, 'locations.update');
  }
}

export async function deleteLocationHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    await repoDeleteLocation((req.server as any).db, id);
    return reply.send({ success: true });
  } catch (err) {
    return handleRouteError(reply, req, err, 'locations.delete');
  }
}
