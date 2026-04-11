import mysql from 'mysql2/promise';
import { mysqlConnectionOptions } from '@/db/mysql-connection.js';

async function migrate() {
  const connection = await mysql.createConnection({
    ...mysqlConnectionOptions(),
    multipleStatements: true,
  });

  console.log('DB baglantisi kuruldu, tablolar olusturuluyor...');

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      phone VARCHAR(50),
      is_active TINYINT NOT NULL DEFAULT 1,
      email_verified TINYINT NOT NULL DEFAULT 0,
      reset_token VARCHAR(255),
      reset_token_expires DATETIME(3),
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      rules_accepted_at DATETIME(3),
      last_sign_in_at DATETIME(3),
      PRIMARY KEY (id),
      UNIQUE KEY users_email_unique (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      role ENUM('admin','editor','carrier','customer','dealer') NOT NULL DEFAULT 'customer',
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY user_roles_user_id_role_unique (user_id, role),
      KEY user_roles_user_id_idx (user_id),
      KEY user_roles_role_idx (role),
      KEY user_roles_user_id_created_at_idx (user_id, created_at),
      CONSTRAINT fk_user_roles_user_id_users_id FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      expires_at DATETIME(3) NOT NULL,
      revoked_at DATETIME(3),
      replaced_by CHAR(36),
      PRIMARY KEY (id),
      KEY refresh_tokens_user_id_idx (user_id),
      KEY refresh_tokens_expires_at_idx (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS profiles (
      id CHAR(36) NOT NULL,
      full_name TEXT,
      phone VARCHAR(64),
      avatar_url TEXT,
      address_line1 VARCHAR(255),
      address_line2 VARCHAR(255),
      city VARCHAR(128),
      country VARCHAR(128),
      postal_code VARCHAR(32),
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      CONSTRAINT fk_profiles_id_users_id FOREIGN KEY (id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id CHAR(36) NOT NULL,
      \`key\` VARCHAR(100) NOT NULL,
      locale VARCHAR(8) NOT NULL,
      value TEXT NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY site_settings_key_locale_uq (\`key\`, locale),
      KEY site_settings_key_idx (\`key\`),
      KEY site_settings_locale_idx (locale)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    INSERT IGNORE INTO site_settings (id, \`key\`, locale, value) VALUES
      ('a0000001-0000-4000-8000-000000000001', 'app_locales', '*', '["tr","en"]'),
      ('a0000002-0000-4000-8000-000000000001', 'default_locale', '*', 'tr');
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS theme_config (
      id CHAR(36) NOT NULL,
      is_active TINYINT NOT NULL DEFAULT 1,
      config MEDIUMTEXT NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS weather_locations (
      id          VARCHAR(36) NOT NULL,
      name        VARCHAR(255) NOT NULL,
      slug        VARCHAR(255) NOT NULL,
      latitude    DECIMAL(10,7) NOT NULL,
      longitude   DECIMAL(10,7) NOT NULL,
      city        VARCHAR(100),
      district    VARCHAR(100),
      region      VARCHAR(100),
      timezone    VARCHAR(50) DEFAULT 'Europe/Istanbul',
      is_active   TINYINT DEFAULT 1,
      created_at  DATETIME DEFAULT NOW(),
      updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW(),
      PRIMARY KEY (id),
      UNIQUE KEY idx_slug (slug),
      KEY idx_active (is_active),
      KEY idx_city (city)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS weather_forecasts (
      id              VARCHAR(36) NOT NULL,
      location_id     VARCHAR(36) NOT NULL,
      forecast_date   DATE NOT NULL,
      hour            TINYINT,
      temp_min        DECIMAL(5,2),
      temp_max        DECIMAL(5,2),
      temp_avg        DECIMAL(5,2),
      humidity        TINYINT,
      wind_speed      DECIMAL(5,2),
      wind_direction  VARCHAR(10),
      precipitation   DECIMAL(5,2),
      \`condition\`   VARCHAR(50),
      icon            VARCHAR(20),
      uv_index        TINYINT,
      frost_risk      TINYINT DEFAULT 0,
      data_source     VARCHAR(50),
      fetched_at      DATETIME NOT NULL,
      created_at      DATETIME DEFAULT NOW(),
      PRIMARY KEY (id),
      UNIQUE KEY uk_location_date_hour (location_id, forecast_date, hour),
      KEY idx_location_date (location_id, forecast_date),
      KEY idx_frost (frost_risk, forecast_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS weather_alerts (
      id            VARCHAR(36) NOT NULL,
      location_id   VARCHAR(36) NOT NULL,
      alert_type    VARCHAR(20) NOT NULL,
      severity      VARCHAR(20) NOT NULL,
      title         VARCHAR(255) NOT NULL,
      message       TEXT NOT NULL,
      threshold     VARCHAR(50),
      actual_value  VARCHAR(50),
      forecast_date DATE NOT NULL,
      sent_at       DATETIME,
      channels      JSON,
      recipients    INT DEFAULT 0,
      created_at    DATETIME DEFAULT NOW(),
      PRIMARY KEY (id),
      KEY idx_location_type (location_id, alert_type),
      KEY idx_date (forecast_date),
      KEY idx_severity (severity)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS weather_alert_rules (
      id          VARCHAR(36) NOT NULL,
      user_id     VARCHAR(36) NOT NULL,
      location_id VARCHAR(36) NOT NULL,
      alert_type  VARCHAR(20) NOT NULL,
      threshold   VARCHAR(50) NOT NULL,
      channel     VARCHAR(20) NOT NULL,
      is_active   TINYINT DEFAULT 1,
      created_at  DATETIME DEFAULT NOW(),
      updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW(),
      PRIMARY KEY (id),
      KEY idx_user (user_id),
      KEY idx_location (location_id),
      KEY idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS audit_request_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      req_id VARCHAR(64) NOT NULL,
      method VARCHAR(16) NOT NULL,
      url LONGTEXT NOT NULL,
      path VARCHAR(255) NOT NULL,
      status_code INT NOT NULL,
      response_time_ms INT NOT NULL DEFAULT 0,
      ip VARCHAR(64) NOT NULL,
      user_agent LONGTEXT,
      referer LONGTEXT,
      user_id VARCHAR(64),
      is_admin INT NOT NULL DEFAULT 0,
      country VARCHAR(8),
      city VARCHAR(64),
      error_message VARCHAR(512),
      error_code VARCHAR(64),
      request_body LONGTEXT,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY audit_request_logs_created_idx (created_at),
      KEY audit_request_logs_user_idx (user_id),
      KEY audit_request_logs_path_idx (path),
      KEY audit_request_logs_ip_idx (ip),
      KEY audit_request_logs_status_idx (status_code),
      KEY audit_request_logs_method_idx (method)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS audit_auth_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      event VARCHAR(32) NOT NULL,
      user_id VARCHAR(64),
      email VARCHAR(255),
      ip VARCHAR(64) NOT NULL,
      user_agent LONGTEXT,
      country VARCHAR(8),
      city VARCHAR(64),
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY audit_auth_events_created_idx (created_at),
      KEY audit_auth_events_event_idx (event),
      KEY audit_auth_events_user_idx (user_id),
      KEY audit_auth_events_ip_idx (ip)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS audit_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      ts DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      level VARCHAR(16) NOT NULL,
      topic VARCHAR(128) NOT NULL,
      message LONGTEXT,
      actor_user_id VARCHAR(64),
      ip VARCHAR(64),
      entity_type VARCHAR(64),
      entity_id VARCHAR(64),
      meta_json LONGTEXT,
      PRIMARY KEY (id),
      KEY audit_events_ts_idx (ts),
      KEY audit_events_topic_ts_idx (topic, ts),
      KEY audit_events_level_ts_idx (level, ts)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Tum tablolar basariyla olusturuldu.');
  await connection.end();
}

migrate().catch((e) => {
  console.error('Migration hatasi:', e);
  process.exit(1);
});
