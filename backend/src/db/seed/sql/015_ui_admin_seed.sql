-- Admin panel metinleri (site_settings.ui_admin). Marka metni burada, uygulama kodunda sabit yok.
INSERT IGNORE INTO site_settings (id, `key`, locale, value) VALUES
  (
    'a0000015-0000-4000-8000-000000000001',
    'ui_admin',
    '*',
    '{"app_name":"Tarım İklim Admin","nav":{"labels":{"tarimiklim":"Tarım İklim"},"items":{"tarimiklim_hub":"Hava & iklim özeti","tarimiklim_locations":"Konumlar","tarimiklim_alerts":"Uyarı geçmişi","tarimiklim_alert_rules":"Uyarı kuralları","user_roles":"Kullanıcı rolleri","reports":"Raporlar","availability":"Müsaitlik / takvim"}}}'
  );

INSERT IGNORE INTO site_settings (id, `key`, locale, value) VALUES
  (
    'a0000016-0000-4000-8000-000000000001',
    'ui_admin_config',
    '*',
    '{"default_locale":"tr","theme":{"mode":"light","preset":"tangerine","font":"inter"},"layout":{"sidebar_variant":"inset","sidebar_collapsible":"icon","navbar_style":"sticky","content_layout":"full-width"},"branding":{"app_name":"Tarım İklim Admin","app_copyright":"Tarım İklim","html_lang":"tr","theme_color":"#15803d","favicon_16":"/favicon/favicon.png","favicon_32":"/favicon/favicon.png","favicon_url":"/favicon/favicon.png","logo_url":"/logo/logo.png","apple_touch_icon":"/favicon/apple-touch-icon.png","admin_login_heading":"","admin_login_quote":"","admin_login_background_url":"/img/admin_login_bg.png","meta":{"title":"Tarım İklim Admin","description":"Yönetim paneli.","og_url":"http://localhost:3096","og_title":"Tarım İklim Admin","og_description":"Yönetim paneli.","og_image":"/favicon/favicon.png","twitter_card":"summary_large_image"}}}'
  );

INSERT IGNORE INTO site_settings (id, `key`, locale, value) VALUES
  ('a0000017-0000-4000-8000-000000000001', 'ui_admin_pages', 'tr', '{}'),
  ('a0000018-0000-4000-8000-000000000001', 'ui_admin_pages', 'en', '{}'),
  ('a0000019-0000-4000-8000-000000000001', 'active_theme_preset', '*', ''),
  ('a0000020-0000-4000-8000-000000000001', 'theme_presets', '*', '[]'),
  (
    'a0000021-0000-4000-8000-000000000001',
    'design_tokens',
    '*',
    '{"version":"2.1","colors":{"brand_primary":"#1E3023","brand_primary_dark":"#142117","brand_primary_light":"#3B5A3C","brand_secondary":"#3B5A3C","brand_accent":"#C69B3A","brand_accent_deep":"#8E6F2A","bg_base":"#F1EBDD","bg_deep":"#E8DFCB","bg_surface":"#FFFCF6","bg_surface_high":"#F5EFE2","text_primary":"#141B14","text_secondary":"#2B3527","text_muted":"#64748B","border":"rgba(20, 27, 20, 0.14)","success":"#16A34A","warning":"#C69B3A","error":"#C23B2C"},"typography":{"font_display":"var(--font-display), system-ui, sans-serif","font_serif":"Georgia, serif","font_sans":"var(--font-sans), system-ui, sans-serif","font_mono":"var(--font-mono), ui-monospace, monospace","base_size":"16px"},"radius":{"xs":"12px","sm":"20px","md":"28px","lg":"40px","xl":"48px","pill":"999px"},"shadows":{"soft":"0 18px 40px rgba(20, 27, 20, 0.08)","card":"0 24px 60px rgba(30, 48, 35, 0.12)","glow_primary":"0 0 60px rgba(30, 48, 35, 0.18)","glow_gold":"0 0 30px rgba(198, 155, 58, 0.14)"},"branding":{"app_name":"Tarım İklim","tagline":"Profesyonel Tarımsal Veri ve İklim Analitiği","tagline_en":"Professional Agricultural Data and Climate Analytics","theme_color":"#1E3023"}}'
  ),
  ('a0000022-0000-4000-8000-000000000001', 'site_logo', '*', '/logo/logo.png'),
  ('a0000023-0000-4000-8000-000000000001', 'site_favicon', '*', '/favicon/favicon.png'),
  ('a0000024-0000-4000-8000-000000000001', 'site_apple_touch_icon', '*', '/favicon/apple-touch-icon.png');
