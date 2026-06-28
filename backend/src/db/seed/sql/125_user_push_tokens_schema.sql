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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
