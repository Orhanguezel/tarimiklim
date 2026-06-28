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

-- Admin Telegram defaults (TarimIklim domain templates)
INSERT IGNORE INTO site_settings (id, `key`, locale, value) VALUES
  (UUID(), 'telegram_notifications_enabled', '*', 'false'),
  (UUID(), 'telegram_webhook_enabled', '*', 'false'),
  (UUID(), 'telegram_chat_id', '*', ''),
  (UUID(), 'telegram_event_new_catalog_request_enabled', '*', 'true'),
  (UUID(), 'telegram_event_new_offer_request_enabled', '*', 'true'),
  (UUID(), 'telegram_event_new_contact_enabled', '*', 'true'),
  (UUID(), 'telegram_event_new_ticket_enabled', '*', 'true'),
  (UUID(), 'telegram_event_ticket_replied_enabled', '*', 'true'),
  (UUID(), 'telegram_event_new_newsletter_subscription_enabled', '*', 'false'),
  (UUID(), 'telegram_template_new_catalog_request', '*', '🥶 KRITIK DON UYARISI\n\n📍 Konum: {{location_name}}\n📅 Tahmin: {{forecast_date}}\n⚠️ Don skoru: {{frost_score}}\n🌡️ Min sicaklik: {{temp_min}}°C\n💧 Nem: {{humidity}}%\n🌬️ Ruzgar: {{wind_speed}} km/sa\n🕐 Olusma: {{created_at}}'),
  (UUID(), 'telegram_template_new_offer_request', '*', '⛈️ HAVA OLAYI UYARISI\n\n📍 Konum: {{location_name}}\n📅 Tahmin: {{forecast_date}}\n🌧️ Yagis: {{rain_mm}} mm\n🌬️ Ruzgar: {{wind_speed}} km/sa\n🚨 Seviye: {{severity}}\n🕐 Olusma: {{created_at}}'),
  (UUID(), 'telegram_template_new_contact', '*', '📩 YENI ILETISIM MESAJI\n\n👤 Isim: {{name}}\n📧 E-posta: {{email}}\n📞 Telefon: {{phone}}\n📋 Konu: {{subject}}\n💬 Mesaj: {{message}}\n🕐 Tarih: {{created_at}}'),
  (UUID(), 'telegram_template_new_ticket', '*', '🎫 YENI DESTEK TALEBI\n\n👤 Kullanici: {{user_name}}\n📧 E-posta: {{user_email}}\n📋 Konu: {{subject}}\n🏷️ Kategori: {{category}}\n⚡ Oncelik: {{priority}}\n💬 Mesaj: {{message}}\n🕐 Tarih: {{created_at}}'),
  (UUID(), 'telegram_template_ticket_replied', '*', '💬 DESTEK TALEBI YANITLANDI\n\n👤 Kullanici: {{user_name}}\n📧 E-posta: {{user_email}}\n📋 Konu: {{subject}}\n🕐 Tarih: {{created_at}}'),
  (UUID(), 'telegram_template_new_newsletter_subscription', '*', '📰 YENI BULTEN ABONELIGI\n\n📧 E-posta: {{email}}\n🌐 Dil: {{locale}}\n🕐 Tarih: {{created_at}}');
