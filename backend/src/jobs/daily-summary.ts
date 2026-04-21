import type { FastifyInstance } from 'fastify';
import { repoGetAllActiveLocations } from '@/modules/locations/repository.js';

/** Sabah ozeti — log; ileride Telegram/rapor genisletilebilir. */
export async function runDailySummaryJob(app: FastifyInstance) {
  const db = (app as any).db;
  const locs = await repoGetAllActiveLocations(db);
  app.log.info({ job: 'daily-summary', activeLocations: locs.length }, 'daily summary tick');
}
