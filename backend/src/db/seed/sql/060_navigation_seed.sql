CREATE TABLE IF NOT EXISTS footer_sections (
  id CHAR(36) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(1000) NULL,
  locale VARCHAR(10) NOT NULL DEFAULT 'tr',
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY footer_sections_slug_locale_uq (slug, locale),
  KEY footer_sections_locale_order_idx (locale, display_order),
  KEY footer_sections_active_idx (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_settings (id, `key`, locale, value) VALUES
  ('c0000001-0000-4000-8000-000000000001', 'footer_content', 'tr', '{"tagline":"Çiftçinin gecesini bilen, sabahına hazırlayan servis.","copy":"Tarvista Tarım Teknolojileri A.Ş. tarafından geliştirilmektedir. Türkiye merkezli, AB ve MENA bölgesi için çoklu dil desteği planlanmaktadır.","contact":{"company":"Tarvista Tarım Teknolojileri A.Ş.","city":"Antalya · Türkiye","email":"destek@tarimiklim.com","social":"@tarimiklim"},"bottom":{"copyright":"© 2026 Tarvista Tarım Teknolojileri A.Ş. · Tüm hakları saklıdır.","creditLabel":"Tasarım & geliştirme","creditBy":"GWD","creditUrl":"https://guezelwebdesign.com"}}'),
  ('c0000001-0000-4000-8000-000000000002', 'footer_content', 'en', '{"tagline":"The service that knows the grower night and prepares the morning.","copy":"Built by Vista Agriculture Technologies. Based in Turkiye with multi-language support planned for the EU and MENA regions.","contact":{"company":"Vista Agriculture Technologies","city":"Antalya · Türkiye","email":"destek@tarimiklim.com","social":"@tarimiklim"},"bottom":{"copyright":"© 2026 Vista Agriculture Technologies · All rights reserved.","creditLabel":"Design & development","creditBy":"GWD","creditUrl":"https://guezelwebdesign.com"}}')
ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = CURRENT_TIMESTAMP(3);

INSERT INTO footer_sections (id, slug, title, description, locale, display_order, is_active) VALUES
  ('c0000101-0000-4000-8000-000000000001', 'product', 'Ürün', NULL, 'tr', 10, 1),
  ('c0000102-0000-4000-8000-000000000001', 'developer', 'Geliştirici', NULL, 'tr', 20, 1),
  ('c0000103-0000-4000-8000-000000000001', 'ecosystem', 'Ekosistem', NULL, 'tr', 30, 1),
  ('c0000104-0000-4000-8000-000000000001', 'company', 'Şirket', NULL, 'tr', 40, 1),
  ('c0000101-0000-4000-8000-000000000002', 'product', 'Product', NULL, 'en', 10, 1),
  ('c0000102-0000-4000-8000-000000000002', 'developer', 'Developer', NULL, 'en', 20, 1),
  ('c0000103-0000-4000-8000-000000000002', 'ecosystem', 'Ecosystem', NULL, 'en', 30, 1),
  ('c0000104-0000-4000-8000-000000000002', 'company', 'Company', NULL, 'en', 40, 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP(3);

INSERT INTO menu_items (id, parent_id, type, page_id, location, icon, section_id, order_num, is_active) VALUES
  ('c0000201-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'header', NULL, NULL, 10, 1),
  ('c0000202-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'header', NULL, NULL, 20, 1),
  ('c0000203-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'header', NULL, NULL, 30, 1),
  ('c0000204-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'header', NULL, NULL, 40, 1),
  ('c0000205-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'header', 'cta', NULL, 90, 1),
  ('c0000301-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000101-0000-4000-8000-000000000001', 10, 1),
  ('c0000302-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000101-0000-4000-8000-000000000001', 20, 1),
  ('c0000303-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000101-0000-4000-8000-000000000001', 30, 1),
  ('c0000311-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000102-0000-4000-8000-000000000001', 10, 1),
  ('c0000312-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000102-0000-4000-8000-000000000001', 20, 1),
  ('c0000313-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000102-0000-4000-8000-000000000001', 30, 1),
  ('c0000321-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000103-0000-4000-8000-000000000001', 10, 1),
  ('c0000322-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000103-0000-4000-8000-000000000001', 20, 1),
  ('c0000323-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000103-0000-4000-8000-000000000001', 30, 1),
  ('c0000331-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000104-0000-4000-8000-000000000001', 10, 1),
  ('c0000332-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000104-0000-4000-8000-000000000001', 20, 1),
  ('c0000333-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, 'c0000104-0000-4000-8000-000000000001', 30, 1),
  ('c0000341-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, NULL, 10, 1),
  ('c0000342-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, NULL, 20, 1),
  ('c0000343-0000-4000-8000-000000000001', NULL, 'custom', NULL, 'footer', NULL, NULL, 30, 1)
ON DUPLICATE KEY UPDATE
  location = VALUES(location),
  icon = VALUES(icon),
  section_id = VALUES(section_id),
  order_num = VALUES(order_num),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP(3);

INSERT INTO menu_items_i18n (id, menu_item_id, locale, title, url) VALUES
  ('c0001201-0000-4000-8000-000000000001', 'c0000201-0000-4000-8000-000000000001', 'tr', 'Canlı Panel', '/don-uyarisi'),
  ('c0001202-0000-4000-8000-000000000001', 'c0000202-0000-4000-8000-000000000001', 'tr', 'Modüller', '#modules'),
  ('c0001203-0000-4000-8000-000000000001', 'c0000203-0000-4000-8000-000000000001', 'tr', 'API & Widget', '#api'),
  ('c0001204-0000-4000-8000-000000000001', 'c0000204-0000-4000-8000-000000000001', 'tr', 'Ekosistem', '#ekosistem'),
  ('c0001205-0000-4000-8000-000000000001', 'c0000205-0000-4000-8000-000000000001', 'tr', 'Giriş Yap', '/giris'),
  ('c0002201-0000-4000-8000-000000000001', 'c0000201-0000-4000-8000-000000000001', 'en', 'Live Panel', '/don-uyarisi'),
  ('c0002202-0000-4000-8000-000000000001', 'c0000202-0000-4000-8000-000000000001', 'en', 'Modules', '#modules'),
  ('c0002203-0000-4000-8000-000000000001', 'c0000203-0000-4000-8000-000000000001', 'en', 'API & Widget', '#api'),
  ('c0002204-0000-4000-8000-000000000001', 'c0000204-0000-4000-8000-000000000001', 'en', 'Ecosystem', '#ekosistem'),
  ('c0002205-0000-4000-8000-000000000001', 'c0000205-0000-4000-8000-000000000001', 'en', 'Sign In', '/giris'),
  ('c0001301-0000-4000-8000-000000000001', 'c0000301-0000-4000-8000-000000000001', 'tr', 'Canlı Panel', '/don-uyarisi'),
  ('c0001302-0000-4000-8000-000000000001', 'c0000302-0000-4000-8000-000000000001', 'tr', 'Don Riski Servisi', '/don-uyarisi'),
  ('c0001303-0000-4000-8000-000000000001', 'c0000303-0000-4000-8000-000000000001', 'tr', 'Üye Paneli', '/hesabim'),
  ('c0001311-0000-4000-8000-000000000001', 'c0000311-0000-4000-8000-000000000001', 'tr', 'API Referansı', '/api-docs'),
  ('c0001312-0000-4000-8000-000000000001', 'c0000312-0000-4000-8000-000000000001', 'tr', 'Widget Kurulumu', '/api-docs'),
  ('c0001313-0000-4000-8000-000000000001', 'c0000313-0000-4000-8000-000000000001', 'tr', 'Gömülü Widget', '/widget'),
  ('c0001321-0000-4000-8000-000000000001', 'c0000321-0000-4000-8000-000000000001', 'tr', 'Ana Sayfa', '/'),
  ('c0001322-0000-4000-8000-000000000001', 'c0000322-0000-4000-8000-000000000001', 'tr', 'Modüller', '#modules'),
  ('c0001323-0000-4000-8000-000000000001', 'c0000323-0000-4000-8000-000000000001', 'tr', 'Ekosistem', '#ekosistem'),
  ('c0001331-0000-4000-8000-000000000001', 'c0000331-0000-4000-8000-000000000001', 'tr', 'Hakkımızda', '/hakkimizda'),
  ('c0001332-0000-4000-8000-000000000001', 'c0000332-0000-4000-8000-000000000001', 'tr', 'İletişim', '/iletisim'),
  ('c0001333-0000-4000-8000-000000000001', 'c0000333-0000-4000-8000-000000000001', 'tr', 'Giriş Yap', '/giris'),
  ('c0001341-0000-4000-8000-000000000001', 'c0000341-0000-4000-8000-000000000001', 'tr', 'Gizlilik Politikası', '/gizlilik-politikasi'),
  ('c0001342-0000-4000-8000-000000000001', 'c0000342-0000-4000-8000-000000000001', 'tr', 'KVKK', '/kvkk'),
  ('c0001343-0000-4000-8000-000000000001', 'c0000343-0000-4000-8000-000000000001', 'tr', 'Kullanım Koşulları', '/kullanim-kosullari'),
  ('c0002301-0000-4000-8000-000000000001', 'c0000301-0000-4000-8000-000000000001', 'en', 'Live Panel', '/don-uyarisi'),
  ('c0002302-0000-4000-8000-000000000001', 'c0000302-0000-4000-8000-000000000001', 'en', 'Frost Risk Service', '/don-uyarisi'),
  ('c0002303-0000-4000-8000-000000000001', 'c0000303-0000-4000-8000-000000000001', 'en', 'Member Panel', '/hesabim'),
  ('c0002311-0000-4000-8000-000000000001', 'c0000311-0000-4000-8000-000000000001', 'en', 'API Reference', '/api-docs'),
  ('c0002312-0000-4000-8000-000000000001', 'c0000312-0000-4000-8000-000000000001', 'en', 'Widget Setup', '/api-docs'),
  ('c0002313-0000-4000-8000-000000000001', 'c0000313-0000-4000-8000-000000000001', 'en', 'Embeddable Widget', '/widget'),
  ('c0002321-0000-4000-8000-000000000001', 'c0000321-0000-4000-8000-000000000001', 'en', 'Home', '/'),
  ('c0002322-0000-4000-8000-000000000001', 'c0000322-0000-4000-8000-000000000001', 'en', 'Modules', '#modules'),
  ('c0002323-0000-4000-8000-000000000001', 'c0000323-0000-4000-8000-000000000001', 'en', 'Ecosystem', '#ekosistem'),
  ('c0002331-0000-4000-8000-000000000001', 'c0000331-0000-4000-8000-000000000001', 'en', 'About', '/hakkimizda'),
  ('c0002332-0000-4000-8000-000000000001', 'c0000332-0000-4000-8000-000000000001', 'en', 'Contact', '/iletisim'),
  ('c0002333-0000-4000-8000-000000000001', 'c0000333-0000-4000-8000-000000000001', 'en', 'Sign In', '/giris'),
  ('c0002341-0000-4000-8000-000000000001', 'c0000341-0000-4000-8000-000000000001', 'en', 'Privacy Policy', '/gizlilik-politikasi'),
  ('c0002342-0000-4000-8000-000000000001', 'c0000342-0000-4000-8000-000000000001', 'en', 'KVKK', '/kvkk'),
  ('c0002343-0000-4000-8000-000000000001', 'c0000343-0000-4000-8000-000000000001', 'en', 'Terms of Use', '/kullanim-kosullari')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  url = VALUES(url),
  updated_at = CURRENT_TIMESTAMP(3);
