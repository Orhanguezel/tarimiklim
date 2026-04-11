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
  '{"colors":{"primary":"#F97316","primaryDark":"#D4610B","accent":"#FEE8D6","background":"#F8FAFC","surfaceBase":"#EEF2F7","surfaceRaised":"#FFFFFF","surfaceMuted":"#FFF4ED","textStrong":"#0F172A","textBody":"#64748B","textMuted":"#94A3B8","border":"#CBD5E1","borderLight":"#E2E8F0","navBg":"#0F2340","navFg":"#FFFFFF","footerBg":"#0F2340","footerFg":"#E2E8F0","success":"#16A34A","warning":"#F59E0B","danger":"#EF4444","surfaceDarkBg":"#0F2340","surfaceDarkText":"#E2E8F0","surfaceDarkHeading":"#F97316"},"typography":{"fontHeading":"DM Sans, system-ui, -apple-system, sans-serif","fontBody":"DM Sans, system-ui, -apple-system, sans-serif"},"radius":"0.5rem","darkMode":"light","sectionBackgrounds":[{"key":"hero","bg":"transparent","overlay":"rgba(15,35,64,0.7)"},{"key":"how_it_works","bg":"#FFFFFF"},{"key":"products_list","bg":"#EEF2F7"},{"key":"benefits","bg":"#FFFFFF"},{"key":"testimonials","bg":"#FFF4ED"},{"key":"faq","bg":"#FFFFFF"},{"key":"cta","bg":"#0F2340","textColor":"#FFFFFF","headingColor":"#F97316"}]}'
) ON DUPLICATE KEY UPDATE config = VALUES(config), is_active = 1;
