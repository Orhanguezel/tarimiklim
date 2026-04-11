import type { ConnectionOptions } from 'mysql2/promise';
import { env } from '@/core/env.js';

export function mysqlConnectionOptions(extra?: Partial<ConnectionOptions>): ConnectionOptions {
  const base: ConnectionOptions = {
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.name,
    ...extra,
  };
  if (env.DB.socketPath) {
    return { ...base, socketPath: env.DB.socketPath };
  }
  return { ...base, host: env.DB.host, port: env.DB.port };
}
