CREATE TABLE IF NOT EXISTS weather_alerts (
  id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36) NOT NULL,
  alert_type VARCHAR(20) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  threshold VARCHAR(50),
  actual_value VARCHAR(50),
  forecast_date DATE NOT NULL,
  sent_at DATETIME,
  channels JSON,
  recipients INT DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  PRIMARY KEY (id),
  KEY idx_location_type (location_id, alert_type),
  KEY idx_date (forecast_date),
  KEY idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
