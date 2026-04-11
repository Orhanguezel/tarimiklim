CREATE TABLE IF NOT EXISTS telegram_inbound_messages (
  id CHAR(36) NOT NULL,
  update_id INT NOT NULL,
  message_id INT,
  chat_id VARCHAR(64) NOT NULL,
  chat_type VARCHAR(32),
  chat_title VARCHAR(255),
  chat_username VARCHAR(255),
  from_id VARCHAR(64),
  from_username VARCHAR(255),
  from_first_name VARCHAR(255),
  from_last_name VARCHAR(255),
  from_is_bot INT NOT NULL DEFAULT 0,
  text TEXT,
  raw TEXT,
  telegram_date INT,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tg_inbound_update_message (update_id, message_id),
  KEY idx_tg_inbound_chat_id (chat_id),
  KEY idx_tg_inbound_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Telegram site_settings: bot ayarlarini tut (admin veya env-sync ile doldurulur)
INSERT IGNORE INTO site_settings (id, `key`, locale, value) VALUES
  ('b0000001-0000-4000-8000-000000000001', 'telegram_enabled', '*', '0'),
  ('b0000002-0000-4000-8000-000000000001', 'telegram_bot_token', '*', ''),
  ('b0000003-0000-4000-8000-000000000001', 'telegram_default_chat_id', '*', '');
