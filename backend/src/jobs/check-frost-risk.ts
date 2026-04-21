import type { FastifyInstance } from 'fastify';
import { checkAndSendFrostAlerts } from '@/modules/alerts/service.js';
import { repoGetAllActiveLocations } from '@/modules/locations/repository.js';

/** Aktif konumlar icin don riski kontrolu ve bildirim. */
export async function runCheckFrostRiskJob(app: FastifyInstance) {
  const db = (app as any).db;
  const locs = await repoGetAllActiveLocations(db);
  let sent = 0;
  for (const loc of locs) {
    const r = await checkAndSendFrostAlerts(db, loc.id);
    if (r.sent) sent += 1;
  }
  app.log.info({ job: 'check-frost-risk', checked: locs.length, sent }, 'frost check done');
}
