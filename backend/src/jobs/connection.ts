import { env } from '@/core/env.js';

export type BullmqConnection = {
  host: string;
  port: number;
  password?: string;
  username?: string;
};

export function getBullmqConnection(): BullmqConnection | null {
  const url = String(env.REDIS_URL ?? '').trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    const conn: BullmqConnection = {
      host: u.hostname || '127.0.0.1',
      port: u.port ? Number(u.port) : 6379,
    };
    if (u.password) conn.password = decodeURIComponent(u.password);
    if (u.username) conn.username = decodeURIComponent(u.username);
    return conn;
  } catch {
    return null;
  }
}
