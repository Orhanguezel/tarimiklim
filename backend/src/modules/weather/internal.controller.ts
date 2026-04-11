import type { FastifyReply, FastifyRequest } from 'fastify';
import { handleRouteError } from '@agro/shared-backend/modules/_shared/http';
import { env } from '@/core/env.js';
import {
  getInternalForecastDetail,
  getInternalHistoricalClimate,
  getInternalHumidityRisk,
} from './service.js';
import {
  internalForecastQuerySchema,
  internalHistoricalQuerySchema,
  internalHumidityQuerySchema,
} from './validation.js';

export function assertInternalWeatherAuth(req: FastifyRequest, reply: FastifyReply): boolean {
  const token = env.INTERNAL_WEATHER_API_TOKEN?.trim();
  if (!token) return true;
  const auth = req.headers.authorization;
  if (auth === `Bearer ${token}`) return true;
  reply.code(401).send({
    success: false,
    error: { code: 'unauthorized', message: 'INTERNAL_WEATHER_API_TOKEN ile Bearer auth gerekli' },
  });
  return false;
}

export async function getInternalForecastHandler(req: FastifyRequest, reply: FastifyReply) {
  if (!assertInternalWeatherAuth(req, reply)) return;
  try {
    const query = internalForecastQuerySchema.parse(req.query);
    const data = await getInternalForecastDetail(query.lat, query.lon, query.hours, (req.server as any).redis);
    return reply.send({ success: true, data });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.internal.forecast');
  }
}

export async function getInternalHistoricalHandler(req: FastifyRequest, reply: FastifyReply) {
  if (!assertInternalWeatherAuth(req, reply)) return;
  try {
    const query = internalHistoricalQuerySchema.parse(req.query);
    const data = getInternalHistoricalClimate(query.lat, query.lon, query.days);
    return reply.send({ success: true, data });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.internal.historical');
  }
}

export async function getInternalHumidityRiskHandler(req: FastifyRequest, reply: FastifyReply) {
  if (!assertInternalWeatherAuth(req, reply)) return;
  try {
    const query = internalHumidityQuerySchema.parse(req.query);
    const data = await getInternalHumidityRisk(query.lat, query.lon, (req.server as any).redis);
    return reply.send({ success: true, data });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.internal.humidityRisk');
  }
}
