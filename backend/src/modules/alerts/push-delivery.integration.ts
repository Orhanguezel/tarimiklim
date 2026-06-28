import '@/core/bootstrap-env.js';
import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { mysqlConnectionOptions } from '@/db/mysql-connection.js';
import { checkAndSendFrostAlerts, setPushAlertSenderForTests } from './service.js';

const prefix = `push-test-${Date.now()}`;
const locationId = randomUUID();
const forecastId = randomUUID();
const forecastDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function ensurePushTokenTable(conn: mysql.Connection) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS user_push_tokens (
      id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      token VARCHAR(512) NOT NULL,
      provider VARCHAR(20) NOT NULL,
      platform VARCHAR(20) NOT NULL,
      device_id VARCHAR(128) DEFAULT NULL,
      is_active TINYINT DEFAULT 1,
      last_seen_at DATETIME DEFAULT NOW(),
      created_at DATETIME DEFAULT NOW(),
      updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
      PRIMARY KEY (id),
      UNIQUE KEY uq_user_push_token (user_id, token),
      KEY idx_user_push_tokens_user (user_id),
      KEY idx_user_push_tokens_active (is_active),
      KEY idx_user_push_tokens_provider (provider)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function setupLocation(conn: mysql.Connection) {
  await conn.execute(
    `
      INSERT INTO weather_locations (id, name, slug, latitude, longitude, city, region, timezone, is_active)
      VALUES (?, ?, ?, 36.8969, 30.7133, 'Antalya', 'Akdeniz', 'Europe/Istanbul', 1)
    `,
    [locationId, `${prefix} Antalya`, prefix],
  );
  await conn.execute(
    `
      INSERT INTO weather_forecasts (
        id, location_id, forecast_date, hour, temp_min, temp_max, temp_avg,
        humidity, wind_speed, wind_direction, precipitation, \`condition\`,
        icon, uv_index, frost_risk, data_source, fetched_at
      )
      VALUES (?, ?, ?, 6, -2.50, 8.00, 2.00, 70, 5.00, 'N', 0.00, 'clear', '01n', 1, 90, 'push-test', NOW())
    `,
    [forecastId, locationId, forecastDate],
  );
}

async function cleanup(conn: mysql.Connection) {
  await conn.execute('DELETE FROM weather_alerts WHERE location_id = ?', [locationId]);
  await conn.execute('DELETE FROM weather_alert_rules WHERE location_id = ?', [locationId]);
  await conn.execute('DELETE FROM user_push_tokens WHERE token LIKE ?', [`${prefix}%`]);
  await conn.execute('DELETE FROM weather_forecasts WHERE location_id = ?', [locationId]);
  await conn.execute('DELETE FROM weather_locations WHERE id = ?', [locationId]);
  await conn.execute('DELETE FROM profiles WHERE id IN (SELECT id FROM users WHERE email LIKE ?)', [`${prefix}%`]);
  await conn.execute('DELETE FROM users WHERE email LIKE ?', [`${prefix}%`]);
}

async function createUser(conn: mysql.Connection, label: string): Promise<string> {
  const userId = randomUUID();
  await conn.execute(
    `
      INSERT INTO users (id, email, password_hash, full_name, is_active, email_verified)
      VALUES (?, ?, 'test-hash', ?, 1, 1)
    `,
    [userId, `${prefix}-${label}@example.test`, `Push Test ${label}`],
  );
  await conn.execute('INSERT INTO profiles (id, full_name) VALUES (?, ?)', [userId, `Push Test ${label}`]);
  return userId;
}

async function createPushRule(conn: mysql.Connection, userId: string) {
  await conn.execute(
    `
      INSERT INTO weather_alert_rules (id, user_id, location_id, alert_type, threshold, channel, is_active)
      VALUES (?, ?, ?, 'frost', '30', 'push', 1)
    `,
    [randomUUID(), userId, locationId],
  );
}

async function createPushToken(conn: mysql.Connection, userId: string, token: string, provider: 'fcm' | 'expo' = 'fcm') {
  await conn.execute(
    `
      INSERT INTO user_push_tokens (id, user_id, token, provider, platform, is_active, last_seen_at)
      VALUES (?, ?, ?, ?, 'android', 1, NOW())
    `,
    [randomUUID(), userId, token, provider],
  );
}

async function clearScenario(conn: mysql.Connection) {
  await conn.execute('DELETE FROM weather_alerts WHERE location_id = ?', [locationId]);
  await conn.execute('DELETE FROM weather_alert_rules WHERE location_id = ?', [locationId]);
  await conn.execute('DELETE FROM user_push_tokens WHERE token LIKE ?', [`${prefix}%`]);
}

async function countAlerts(conn: mysql.Connection, userId: string): Promise<{ count: number; sent: number; recipients: number }> {
  const [rows] = await conn.execute<mysql.RowDataPacket[]>(
    `
      SELECT COUNT(*) AS count, SUM(sent_at IS NOT NULL) AS sent, COALESCE(SUM(recipients), 0) AS recipients
      FROM weather_alerts
      WHERE user_id = ? AND location_id = ?
    `,
    [userId, locationId],
  );
  const row = rows[0] ?? {};
  return {
    count: Number(row.count ?? 0),
    sent: Number(row.sent ?? 0),
    recipients: Number(row.recipients ?? 0),
  };
}

async function tokenActive(conn: mysql.Connection, token: string): Promise<number> {
  const [rows] = await conn.execute<mysql.RowDataPacket[]>(
    'SELECT is_active AS isActive FROM user_push_tokens WHERE token = ? LIMIT 1',
    [token],
  );
  return Number(rows[0]?.isActive ?? 0);
}

async function main() {
  const conn = await mysql.createConnection(mysqlConnectionOptions({ multipleStatements: true }));
  const db = drizzle(conn);

  try {
    await ensurePushTokenTable(conn);
    await cleanup(conn);
    await setupLocation(conn);

    const noTokenUser = await createUser(conn, 'no-token');
    await createPushRule(conn, noTokenUser);
    setPushAlertSenderForTests(async (_title, _body, targets) => {
      assert(targets.length === 0, 'no-token scenario must not send any target');
      return { successCount: 0, invalidTokens: [] };
    });
    const noToken = await checkAndSendFrostAlerts(db, locationId);
    const noTokenAlerts = await countAlerts(conn, noTokenUser);
    assert(noToken.sent === false && noToken.reason === 'delivery_failed', 'no-token should fail delivery gracefully');
    assert(noTokenAlerts.count === 1 && noTokenAlerts.sent === 0, 'no-token should create an unsent alert row');

    await clearScenario(conn);
    const successUser = await createUser(conn, 'success');
    const successToken = `${prefix}-success-token`;
    await createPushRule(conn, successUser);
    await createPushToken(conn, successUser, successToken, 'expo');
    setPushAlertSenderForTests(async (_title, _body, targets) => {
      assert(targets.length === 1 && targets[0]?.token === successToken, 'success scenario should send one DB token');
      return { successCount: 1, invalidTokens: [] };
    });
    const success = await checkAndSendFrostAlerts(db, locationId);
    const successAlerts = await countAlerts(conn, successUser);
    assert(success.sent === true, 'success scenario should send');
    assert(successAlerts.count === 1 && successAlerts.sent === 1 && successAlerts.recipients === 1, 'success alert should be marked sent');

    await clearScenario(conn);
    const invalidUser = await createUser(conn, 'invalid');
    const invalidToken = `${prefix}-invalid-token`;
    await createPushRule(conn, invalidUser);
    await createPushToken(conn, invalidUser, invalidToken);
    setPushAlertSenderForTests(async (_title, _body, targets) => {
      assert(targets.length === 1 && targets[0]?.token === invalidToken, 'invalid scenario should send one DB token');
      return { successCount: 0, invalidTokens: [invalidToken] };
    });
    const invalid = await checkAndSendFrostAlerts(db, locationId);
    const invalidAlerts = await countAlerts(conn, invalidUser);
    assert(invalid.sent === false && invalid.reason === 'delivery_failed', 'invalid scenario should fail delivery');
    assert(invalidAlerts.count === 1 && invalidAlerts.sent === 0, 'invalid alert should remain unsent');
    assert((await tokenActive(conn, invalidToken)) === 0, 'invalid token should be deactivated');

    console.log('push-delivery integration ok');
  } finally {
    setPushAlertSenderForTests(null);
    await cleanup(conn).catch(() => undefined);
    await conn.end();
  }
}

main().catch((err) => {
  console.error('push-delivery integration failed');
  console.error(err);
  process.exit(1);
});
