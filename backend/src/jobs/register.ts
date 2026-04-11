import type { FastifyInstance } from 'fastify';
import { Queue, Worker } from 'bullmq';
import { getBullmqConnection } from './connection.js';
import { runFetchForecastJob } from './fetch-forecast.js';
import { runCheckFrostRiskJob } from './check-frost-risk.js';
import { runDailySummaryJob } from './daily-summary.js';

const QUEUE_NAME = 'hava-scheduled';

let worker: Worker | null = null;
let queue: Queue | null = null;

export async function startScheduledJobs(app: FastifyInstance) {
  const connection = getBullmqConnection();
  if (!connection) {
    app.log.warn('BullMQ atlandi: REDIS_URL yok veya gecersiz');
    return;
  }

  queue = new Queue(QUEUE_NAME, { connection });
  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name === 'fetch-forecast') await runFetchForecastJob(app);
      else if (job.name === 'check-frost-risk') await runCheckFrostRiskJob(app);
      else if (job.name === 'daily-summary') await runDailySummaryJob(app);
    },
    { connection, concurrency: 1 },
  );

  worker.on('failed', (job, err) => {
    app.log.error({ err, jobId: job?.id, name: job?.name }, 'BullMQ job failed');
  });

  await queue.add(
    'fetch-forecast',
    {},
    { repeat: { every: 30 * 60 * 1000 }, jobId: 'repeat-fetch-forecast' },
  );
  await queue.add(
    'check-frost-risk',
    {},
    { repeat: { every: 60 * 60 * 1000 }, jobId: 'repeat-check-frost-risk' },
  );
  await queue.add(
    'daily-summary',
    {},
    { repeat: { pattern: '0 6 * * *', tz: 'Europe/Istanbul' }, jobId: 'repeat-daily-summary' },
  );

  app.log.info('BullMQ: 30dk tahmin, 1s don kontrolu, 06:00 TR gunluk ozet');

  app.addHook('onClose', async () => {
    await worker?.close();
    await queue?.close();
    worker = null;
    queue = null;
  });
}
