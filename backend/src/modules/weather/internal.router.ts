import type { FastifyInstance } from 'fastify';
import {
  getInternalForecastHandler,
  getInternalHistoricalHandler,
  getInternalHumidityRiskHandler,
} from './internal.controller.js';

/** Ekosistem ic diger moduller (Sera, Acik Tarla, Verim, Hastalik). Opsiyonel: INTERNAL_WEATHER_API_TOKEN */
export async function registerWeatherInternal(app: FastifyInstance) {
  app.get(
    '/forecast',
    { schema: { tags: ['Weather', 'Internal'] } },
    getInternalForecastHandler,
  );
  app.get(
    '/historical',
    { schema: { tags: ['Weather', 'Internal'] } },
    getInternalHistoricalHandler,
  );
  app.get(
    '/humidity-risk',
    { schema: { tags: ['Weather', 'Internal'] } },
    getInternalHumidityRiskHandler,
  );
}
