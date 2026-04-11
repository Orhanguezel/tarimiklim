CREATE TABLE IF NOT EXISTS weather_locations (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  city VARCHAR(100),
  district VARCHAR(100),
  region VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
  is_active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id),
  UNIQUE KEY idx_slug (slug),
  KEY idx_active (is_active),
  KEY idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
