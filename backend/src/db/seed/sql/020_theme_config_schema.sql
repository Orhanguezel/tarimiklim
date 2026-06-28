CREATE TABLE IF NOT EXISTS theme_config (
  id CHAR(36) NOT NULL,
  is_active TINYINT NOT NULL DEFAULT 1,
  config MEDIUMTEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Varsayilan tema — packages/shared-types/theme.ts DEFAULT_THEME_CONFIG ile eslesir
INSERT INTO theme_config (id, is_active, config) VALUES (
  '00000000-0000-4000-8000-000000000001',
  1,
  '{"colors":{"primary":"#1E3023","primaryDark":"#142117","accent":"#C69B3A","background":"#F1EBDD","surfaceBase":"#E8DFCB","surfaceRaised":"#FFFCF6","surfaceMuted":"#F5EFE2","textStrong":"#141B14","textBody":"#2B3527","textMuted":"#64748B","border":"rgba(20, 27, 20, 0.14)","borderLight":"rgba(20, 27, 20, 0.08)","navBg":"#1E3023","navFg":"#F1EBDD","footerBg":"#141B14","footerFg":"#F1EBDD","success":"#16A34A","warning":"#C69B3A","danger":"#C23B2C","surfaceDarkBg":"#141B14","surfaceDarkText":"#F1EBDD","surfaceDarkHeading":"#C69B3A"},"typography":{"fontHeading":"Space Grotesk, system-ui, -apple-system, sans-serif","fontBody":"Inter, system-ui, -apple-system, sans-serif"},"radius":"1.25rem","darkMode":"light","sectionBackgrounds":[{"key":"hero","bg":"transparent","overlay":"rgba(30,48,35,0.7)"},{"key":"how_it_works","bg":"#FFFCF6"},{"key":"products_list","bg":"#E8DFCB"},{"key":"benefits","bg":"#FFFCF6"},{"key":"testimonials","bg":"#F5EFE2"},{"key":"faq","bg":"#FFFCF6"},{"key":"cta","bg":"#1E3023","textColor":"#F1EBDD","headingColor":"#C69B3A"}]}'
) ON DUPLICATE KEY UPDATE config = VALUES(config), is_active = 1;
