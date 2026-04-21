import { randomUUID } from 'crypto';
import type { FastifyInstance } from 'fastify';
import { fetchForecast } from '@/modules/weather/helpers/weather-api.js';
import { repoUpsertForecasts } from '@/modules/weather/repository.js';
import { repoGetAllActiveLocations } from '@/modules/locations/repository.js';

/** Aktif konumlar icin 7 gunluk tahmini API'den cekip DB'ye yazar. */
export async function runFetchForecastJob(app: FastifyInstance) {
  const db = (app as any).db;
  const locs = await repoGetAllActiveLocations(db);
  const now = new Date();
  for (const loc of locs) {
    const lat = parseFloat(String(loc.latitude));
    const lon = parseFloat(String(loc.longitude));
    const days7 = await fetchForecast(lat, lon, 7);
    const rows = days7.map((d) => ({
      id: randomUUID(),
      locationId: loc.id,
      forecastDate: new Date(d.date.includes('T') ? d.date : `${d.date}T00:00:00.000Z`),
      hour: null,
      tempMin: String(d.tempMin),
      tempMax: String(d.tempMax),
      tempAvg: String(d.tempAvg),
      humidity: d.humidity,
      windSpeed: String(d.windSpeed),
      windDirection: d.windDirection,
      precipitation: String(d.precipitation),
      condition: d.condition,
      icon: d.icon,
      uvIndex: d.uvIndex,
      frostRisk: d.frostRisk,
      dataSource: 'openweathermap',
      fetchedAt: now,
    }));
    await repoUpsertForecasts(db, rows);
  }
  app.log.info({ job: 'fetch-forecast', locations: locs.length }, 'forecast refresh done');
}
