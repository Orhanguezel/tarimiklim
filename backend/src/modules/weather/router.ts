import type { FastifyInstance } from 'fastify';
import {
  getForecastHandler,
  getCurrentWeatherHandler,
  getHourlyForecastHandler,
  getFrostRiskHandler,
  getRainForecastHandler,
  getWidgetDataHandler,
} from './controller.js';

export async function registerWeather(app: FastifyInstance) {
  app.get('/weather', { schema: { tags: ['Weather'] } }, getForecastHandler);
  app.get('/weather/hourly', { schema: { tags: ['Weather'] } }, getHourlyForecastHandler);
  app.get('/weather/current', { schema: { tags: ['Weather'] } }, getCurrentWeatherHandler);
  app.get('/weather/frost-risk', { schema: { tags: ['Weather'] } }, getFrostRiskHandler);
  app.get('/weather/rain-forecast', { schema: { tags: ['Weather'] } }, getRainForecastHandler);
  app.get('/weather/widget-data', { schema: { tags: ['Weather'] } }, getWidgetDataHandler);
}
