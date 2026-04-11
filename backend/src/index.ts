import './core/bootstrap-env.js';
import { createApp } from './app.js';
import { env } from '@/core/env.js';
import { startScheduledJobs } from './jobs/register.js';

async function main() {
  const app = await createApp();
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
