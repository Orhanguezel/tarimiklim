CREATE TABLE IF NOT EXISTS site_settings (
  id CHAR(36) NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  locale VARCHAR(8) NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY site_settings_key_locale_uq (`key`, locale),
  KEY site_settings_key_idx (`key`),
  KEY site_settings_locale_idx (locale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO site_settings (id, `key`, locale, value) VALUES
  ('a0000001-0000-4000-8000-000000000001', 'app_locales', '*', '["tr","en"]'),
  ('a0000002-0000-4000-8000-000000000001', 'default_locale', '*', 'tr'),
  ('a0000010-0000-4000-8000-000000000001', 'site_logo', '*', '"/uploads/logo.png"'),
  ('a0000011-0000-4000-8000-000000000001', 'site_favicon', '*', '"/uploads/favicon.png"'),
  ('a0000012-0000-4000-8000-000000000001', 'site_apple_touch_icon', '*', '"/uploads/appletouch.png"');
