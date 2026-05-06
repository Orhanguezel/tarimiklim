import type { FastifyRequest, FastifyReply } from 'fastify';
import { getAuthUserId, handleRouteError } from '@agro/shared-backend/modules/_shared/http';
import { listAlerts } from './service.js';
import {
  createUserAlertRuleSchema,
  listAlertsQuerySchema,
  telegramChatIdSchema,
  updateUserAlertRuleSchema,
} from './validation.js';
import {
  repoCreateAlertRule,
  repoDeleteAlertRuleForUser,
  repoGetAlertRulesByUser,
  repoGetTelegramChatId,
  repoUpdateAlertRuleActiveForUser,
  repoUpdateTelegramChatId,
} from './repository.js';

export async function listAlertsHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = listAlertsQuerySchema.parse(req.query);
    const result = await listAlerts((req.server as any).db, query);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.list');
  }
}

export async function listMyAlertRulesHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = getAuthUserId(req);
    const rules = await repoGetAlertRulesByUser((req.server as any).db, userId);
    return reply.send({ success: true, data: rules });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.me.rules.list');
  }
}

export async function createMyAlertRuleHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = getAuthUserId(req);
    const body = createUserAlertRuleSchema.parse(req.body);
    const rule = await repoCreateAlertRule((req.server as any).db, {
      userId,
      locationId: body.locationId!,
      alertType: body.alertType!,
      threshold: body.threshold,
      channel: body.channel,
      isActive: 1,
    });
    return reply.status(201).send({ success: true, data: rule });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.me.rules.create');
  }
}

export async function deleteMyAlertRuleHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = getAuthUserId(req);
    const { id } = req.params as { id: string };
    await repoDeleteAlertRuleForUser((req.server as any).db, id, userId);
    return reply.send({ success: true });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.me.rules.delete');
  }
}

export async function updateMyAlertRuleHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = getAuthUserId(req);
    const { id } = req.params as { id: string };
    const body = updateUserAlertRuleSchema.parse(req.body);
    if (typeof body.isActive !== 'boolean') {
      return reply.status(400).send({ success: false, error: 'is_active_required' });
    }
    const rule = await repoUpdateAlertRuleActiveForUser((req.server as any).db, id, userId, body.isActive);
    if (!rule) return reply.status(404).send({ success: false, error: 'not_found' });
    return reply.send({ success: true, data: rule });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.me.rules.update');
  }
}

export async function getMyTelegramChatIdHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = getAuthUserId(req);
    const chatId = await repoGetTelegramChatId((req.server as any).db, userId);
    return reply.send({ success: true, data: { chat_id: chatId } });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.me.telegram.get');
  }
}

export async function updateMyTelegramChatIdHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = getAuthUserId(req);
    const body = telegramChatIdSchema.parse(req.body);
    const chatId = body.chatId?.trim() ? body.chatId.trim() : null;
    const saved = await repoUpdateTelegramChatId((req.server as any).db, userId, chatId);
    return reply.send({ success: true, data: { chat_id: saved } });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.me.telegram.update');
  }
}
