import './core/bootstrap-env.js';
import { createApp } from './app.js';
import { env } from '@/core/env.js';
import { startScheduledJobs } from './jobs/register.js';
import { syncTelegramEnvToDb } from './core/sync-telegram-env.js';

async function main() {
  const app = await createApp();
  // Telegram env varlarini DB'ye yaz (site_settings uzerinden calisabilmek icin)
  await syncTelegramEnvToDb();
  // startScheduledJobs listen() oncesinde cagrilmali (addHook kaydedebilmek icin)
  await startScheduledJobs(app);
  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(`Hava Durumu API listening on ${env.HOST}:${env.PORT}`);
  app.log.info(`Swagger: http://${env.HOST}:${env.PORT}/documentation`);
}

main().catch((e) => {
  console.error('Server failed to start', e);
  process.exit(1);
});
