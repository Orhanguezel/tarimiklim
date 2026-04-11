import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { hash as argonHash } from 'argon2';
import { env } from '@/core/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@hava-durumu.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'HavaDurumuDev2026!';
const ADMIN_ID = process.env.SEED_ADMIN_ID ?? '00000000-0000-4000-8000-000000000099';

function assertSafeToDrop(dbName: string) {
  const safe = ['mysql', 'information_schema', 'performance_schema', 'sys'];
  if (safe.includes(dbName.toLowerCase())) throw new Error(`Sistem DB drop edilemez: ${dbName}`);
  // Production'da drop YASAK — --no-drop zorunlu
  const noDrop = process.argv.includes('--no-drop');
  if (process.env.NODE_ENV === 'production' && !noDrop)
    throw new Error('Production ortaminda DROP yasak. --no-drop flagini kullan: bun run db:seed:no-drop');
}

async function createConn(withDb = false): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    ...(withDb ? { database: env.DB.name } : {}),
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci',
  });
}

function sqlEscape(v: string) {
  return v.replaceAll("'", "''");
}

async function runFile(conn: mysql.Connection, filePath: string, adminVars: Record<string, string>) {
  const name = path.basename(filePath);
  console.log(`⏳ ${name}...`);

  let sql = fs.readFileSync(filePath, 'utf8');

  // Session degiskenlerini inject et — SQL dosyalari @ADMIN_* degiskenlerini kullanir
  const header = [
    `SET @ADMIN_ID := '${sqlEscape(adminVars.id)}';`,
    `SET @ADMIN_EMAIL := '${sqlEscape(adminVars.email)}';`,
    `SET @ADMIN_PASSWORD_HASH := '${sqlEscape(adminVars.passwordHash)}';`,
    `SET NAMES utf8mb4;`,
    `SET time_zone = '+00:00';`,
  ].join('\n');

  sql = `${header}\n${sql}`;

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    try {
      await conn.query(stmt);
    } catch (err: any) {
      // 1060: Duplicate column, 1061: Duplicate key — idempotent calisma icin gec
      if (err.errno === 1060 || err.errno === 1061) continue;
      throw err;
    }
  }

  console.log(`✅ ${name}`);
}

async function main() {
  const noDrop = process.argv.includes('--no-drop');

  assertSafeToDrop(env.DB.name);

  // 1) DB drop + create
  const root = await createConn(false);
  try {
    if (!noDrop) {
      console.log(`💣 DROP + CREATE: ${env.DB.name}`);
      await root.query(`DROP DATABASE IF EXISTS \`${env.DB.name}\`;`);
      await root.query(
        `CREATE DATABASE \`${env.DB.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      );
      console.log('🆕 DB olusturuldu.');
    } else {
      console.log('⤵️  --no-drop: DROP/CREATE atlaniyor.');
    }
  } finally {
    await root.end();
  }

  // 2) Admin hash hesapla
  const passwordHash = await argonHash(ADMIN_PASSWORD);
  const adminVars = { id: ADMIN_ID, email: ADMIN_EMAIL, passwordHash };

  // 3) SQL dosyalarini calistir
  const conn = await createConn(true);
  try {
    const sqlDir = path.resolve(__dirname, 'sql');
    const files = fs.readdirSync(sqlDir)
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const f of files) {
      await runFile(conn, path.join(sqlDir, f), adminVars);
    }

    console.log('🎉 Seed tamamlandi.');
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Seed hatasi:', err);
  process.exit(1);
});
