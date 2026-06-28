import type { FastifyReply, FastifyRequest } from 'fastify';
import { handleRouteError } from '@agro/shared-backend/modules/_shared/http';
import { processTarimiklimTelegramWebhook } from './service.js';
import { tarimiklimTelegramWebhookSchema } from './validation.js';

export async function tarimiklimTelegramWebhookHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const update = tarimiklimTelegramWebhookSchema.parse(req.body ?? {});
    const result = await processTarimiklimTelegramWebhook(req.server, update);
    return reply.send(result);
  } catch (err) {
    return handleRouteError(reply, req, err, 'tarimiklim.telegram.webhook');
  }
}
