CREATE TABLE IF NOT EXISTS push_campaigns (
  id CHAR(36) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(500) NOT NULL,
  target_segment VARCHAR(40) NOT NULL DEFAULT 'all',
  deep_link VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY push_campaigns_slug_uq (slug),
  KEY push_campaigns_active_order_idx (is_active, display_order),
  KEY push_campaigns_segment_idx (target_segment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO push_campaigns (id, slug, title, body, target_segment, deep_link, display_order, is_active) VALUES
  (
    'd0000001-0000-4000-8000-000000000001',
    'don-riski-gece-hatirlatma',
    'Bu gece don riskini kontrol edin',
    'Seçili konumlarınız için gece minimum sıcaklık ve don riski tahminlerini panelden kontrol edebilirsiniz.',
    'all',
    '/tr/don-uyarisi',
    10,
    1
  ),
  (
    'd0000002-0000-4000-8000-000000000001',
    'konum-uyarisi-kurulum',
    'Konum bazlı uyarınızı kurun',
    'Don riski yükselmeden bildirim almak için hesabınıza konum ve uyarı kuralı ekleyin.',
    'all',
    '/tr/hesabim/uyarilar',
    20,
    1
  ),
  (
    'd0000003-0000-4000-8000-000000000001',
    'telegram-push-kanal-hatirlatma',
    'Bildirim kanallarınızı tamamlayın',
    'Telegram ve push bildirim tercihlerinizi açarak don uyarılarını kaçırmayın.',
    'all',
    '/tr/hesabim/bildirimler',
    30,
    1
  ),
  (
    'd0000004-0000-4000-8000-000000000001',
    'pasif-kullanici-geri-cagirma',
    'Tarım İklim tahminleri güncellendi',
    'Bir süredir giriş yapmadınız. Yeni hava tahmini ve don riski ekranını tekrar kontrol edin.',
    'inactive_7d',
    '/tr/giris',
    40,
    1
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  body = VALUES(body),
  target_segment = VALUES(target_segment),
  deep_link = VALUES(deep_link),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP(3);
