import type { FastifyReply, FastifyRequest } from 'fastify';
import { handleRouteError, sendNotFound } from '@agro/shared-backend/modules/_shared/http';
import {
  repoCreateHomeSection,
  repoDeleteHomeSection,
  repoGetHomeSection,
  repoListHomeSections,
  repoReorderHomeSections,
  repoUpdateHomeSection,
} from './repository.js';
import { createHomeSectionSchema, reorderHomeSectionsSchema, updateHomeSectionSchema } from './validation.js';

export async function listPublicHomeSectionsHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await repoListHomeSections((req.server as any).db, true);
    return reply.send({ success: true, data });
  } catch (err) {
    return handleRouteError(reply, req, err, 'homeSections.public.list');
  }
}

export async function listHomeSectionsAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await repoListHomeSections((req.server as any).db, false);
    return reply.send({ success: true, data });
  } catch (err) {
    return handleRouteError(reply, req, err, 'homeSections.admin.list');
  }
}

export async function getHomeSectionAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const section = await repoGetHomeSection((req.server as any).db, id);
    if (!section) return sendNotFound(reply);
    return reply.send({ success: true, data: section });
  } catch (err) {
    return handleRouteError(reply, req, err, 'homeSections.admin.get');
  }
}

export async function createHomeSectionAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = createHomeSectionSchema.parse(req.body);
    const id = await repoCreateHomeSection((req.server as any).db, body);
    return reply.status(201).send({ success: true, data: { id } });
  } catch (err) {
    return handleRouteError(reply, req, err, 'homeSections.admin.create');
  }
}

export async function updateHomeSectionAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const body = updateHomeSectionSchema.parse(req.body);
    const section = await repoUpdateHomeSection((req.server as any).db, id, body);
    if (!section) return sendNotFound(reply);
    return reply.send({ success: true, data: { id } });
  } catch (err) {
    return handleRouteError(reply, req, err, 'homeSections.admin.update');
  }
}

export async function deleteHomeSectionAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    await repoDeleteHomeSection((req.server as any).db, id);
    return reply.send({ success: true, data: { id, ok: true } });
  } catch (err) {
    return handleRouteError(reply, req, err, 'homeSections.admin.delete');
  }
}

export async function reorderHomeSectionsAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = reorderHomeSectionsSchema.parse(req.body);
    const count = await repoReorderHomeSections((req.server as any).db, body.items);
    return reply.send({ success: true, data: { ok: true, count } });
  } catch (err) {
    return handleRouteError(reply, req, err, 'homeSections.admin.reorder');
  }
}
