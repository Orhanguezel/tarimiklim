import { env } from './env.js';

/** shared-backend/redis plugin process.env.REDIS_URL okur; bos ise hava .env varsayilanini aktar. */
if (!String(process.env.REDIS_URL ?? '').trim()) {
  process.env.REDIS_URL = env.REDIS_URL;
}
