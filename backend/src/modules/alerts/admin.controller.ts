import type { FastifyRequest, FastifyReply } from 'fastify';
import { handleRouteError } from '@agro/shared-backend/modules/_shared/http';
import { checkAndSendFrostAlerts, listAlerts } from './service.js';
import {
  repoCreateAlertRule,
  repoGetAlertRulesByUser,
  repoDeleteAlertRule,
} from './repository.js';
import {
  createAlertRuleSchema,
  listAlertsQuerySchema,
  listAlertRulesQuerySchema,
} from './validation.js';
import { repoListAllAlertRules } from './repository.js';

export async function adminListAlertsHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = listAlertsQuerySchema.parse(req.query);
    const result = await listAlerts((req.server as any).db, query);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.admin.list');
  }
}

export async function adminTriggerFrostCheckHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { locationId } = req.params as { locationId: string };
    const result = await checkAndSendFrostAlerts((req.server as any).db, locationId);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.admin.frostCheck');
  }
}

export async function adminListAlertRulesHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = listAlertRulesQuerySchema.parse(req.query);
    const db = (req.server as any).db;
    if (query.all) {
      const rules = await repoListAllAlertRules(db, 500);
      return reply.send({ success: true, data: rules });
    }
    if (!query.userId) {
      return reply.status(400).send({
        success: false,
        error: 'userId_or_all_required',
        message: 'Query: userId=<uuid> veya all=true',
      });
    }
    const rules = await repoGetAlertRulesByUser(db, query.userId);
    return reply.send({ success: true, data: rules });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.admin.rules.list');
  }
}

export async function adminCreateAlertRuleHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = createAlertRuleSchema.parse(req.body);
    const user = (req as any).user;
    const rule = await repoCreateAlertRule((req.server as any).db, {
      ...body,
      userId: user.sub,
      isActive: body.isActive ? 1 : 0,
    });
    return reply.status(201).send({ success: true, data: rule });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.admin.rules.create');
  }
}

export async function adminDeleteAlertRuleHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    await repoDeleteAlertRule((req.server as any).db, id);
    return reply.send({ success: true });
  } catch (err) {
    return handleRouteError(reply, req, err, 'alerts.admin.rules.delete');
  }
}
