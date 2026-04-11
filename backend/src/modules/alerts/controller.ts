import type { FastifyRequest, FastifyReply } from 'fastify';
import { handleRouteError } from '@agro/shared-backend/modules/_shared/http';
import { listAlerts } from './service.js';
import { listAlertsQuerySchema } from './validation.js';

export async function listAlertsHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = listAlertsQuerySchema.parse(req.query);
    const result = await listAlerts((req.server as any).db, query);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.list');
  }
}
