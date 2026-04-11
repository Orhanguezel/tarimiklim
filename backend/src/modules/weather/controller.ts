import type { FastifyRequest, FastifyReply } from 'fastify';
import { handleRouteError } from '@agro/shared-backend/modules/_shared/http';
import { getForecast, getCurrentWeather, getFrostRisk, getWidgetData, getHourlyForecast } from './service.js';
import {
  forecastQuerySchema,
  frostRiskQuerySchema,
  hourlyQuerySchema,
  rainForecastQuerySchema,
  widgetQuerySchema,
} from './validation.js';

export async function getForecastHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = forecastQuerySchema.parse(req.query);
    const result = await getForecast((req.server as any).db, query.lat, query.lon, query.days, (req.server as any).redis);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.getForecast');
  }
}

export async function getCurrentWeatherHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = forecastQuerySchema.parse(req.query);
    const data = await getCurrentWeather(query.lat, query.lon);
    return reply.send({ success: true, data });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.current');
  }
}

export async function getHourlyForecastHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = hourlyQuerySchema.parse(req.query);
    const result = await getHourlyForecast(query.lat, query.lon, query.slots, (req.server as any).redis);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.hourly');
  }
}

export async function getFrostRiskHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = frostRiskQuerySchema.parse(req.query);
    const data = await getFrostRisk((req.server as any).db, query, (req.server as any).redis);
    return reply.send({ success: true, data });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.frostRisk');
  }
}

export async function getRainForecastHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = rainForecastQuerySchema.parse(req.query);
    const lat = query.lat ?? 0;
    const lon = query.lon ?? 0;
    const result = await getForecast((req.server as any).db, lat, lon, query.days, (req.server as any).redis);
    const rainData = (Array.isArray(result.forecasts) ? result.forecasts : []).map((f: any) => ({
      date: f.date ?? f.forecastDate,
      precipitation: f.precipitation,
      condition: f.condition,
    }));
    return reply.send({ success: true, data: { location: result.location, rainForecast: rainData } });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.rainForecast');
  }
}

export async function getWidgetDataHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = widgetQuerySchema.parse(req.query);
    const data = await getWidgetData((req.server as any).db, query.location, (req.server as any).redis);
    return reply.send({ success: true, data });
  } catch (err) {
    return handleRouteError(reply, req, err, 'weather.widgetData');
  }
}
