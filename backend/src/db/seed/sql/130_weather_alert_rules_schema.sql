CREATE TABLE IF NOT EXISTS weather_alert_rules (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36) NOT NULL,
  alert_type VARCHAR(20) NOT NULL,
  threshold VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  is_active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  KEY idx_location (location_id),
  KEY idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
