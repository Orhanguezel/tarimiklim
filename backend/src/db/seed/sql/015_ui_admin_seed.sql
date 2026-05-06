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
    '{"version":"2","colors":{"brand_primary":"#16a34a","brand_primary_dark":"#15803d","brand_primary_light":"#22c55e","brand_secondary":"#15803d","brand_accent":"#854d0e","bg_base":"#f7fee7","bg_deep":"#ecfccb","bg_surface":"#FFFFFF","bg_surface_high":"#f0fdf4","text_primary":"#14532d","text_secondary":"#365314","text_muted":"#64748b","border":"rgba(22,101,52,0.22)","success":"#16a34a","warning":"#ca8a04","error":"#dc2626"},"typography":{"font_display":"var(--font-inter), system-ui, sans-serif","font_serif":"Georgia, serif","font_sans":"var(--font-inter), system-ui, sans-serif","font_mono":"ui-monospace, monospace","base_size":"16px"},"radius":{"xs":"4px","sm":"8px","md":"12px","lg":"16px","xl":"24px","pill":"9999px"},"shadows":{"soft":"0 2px 20px rgba(22,163,74,0.08)","card":"0 8px 40px rgba(22,163,74,0.12)","glow_primary":"0 0 60px rgba(22,163,74,0.18)","glow_gold":"0 0 30px rgba(22,163,74,0.14)"},"branding":{"app_name":"Tarım İklim","tagline":"Hava ve iklim verilerini yönetin.","tagline_en":"Manage weather and climate data.","logo_url":"","favicon_url":"","theme_color":"#15803d"}}'
  );
