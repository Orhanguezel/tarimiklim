CREATE TABLE IF NOT EXISTS menu_items (
  id CHAR(36) NOT NULL,
  parent_id CHAR(36) NULL,
  type VARCHAR(16) NOT NULL DEFAULT 'custom',
  page_id CHAR(36) NULL,
  location VARCHAR(16) NOT NULL DEFAULT 'header',
  icon VARCHAR(64) NULL,
  section_id CHAR(36) NULL,
  site_id CHAR(36) NULL,
  order_num INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY menu_items_parent_idx (parent_id),
  KEY menu_items_site_idx (site_id),
  KEY menu_items_active_idx (is_active),
  KEY menu_items_order_idx (order_num),
  KEY menu_items_created_idx (created_at),
  KEY menu_items_updated_idx (updated_at),
  KEY menu_items_location_idx (location),
  KEY menu_items_section_idx (section_id),
  CONSTRAINT menu_items_parent_fk FOREIGN KEY (parent_id) REFERENCES menu_items(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items_i18n (
  id CHAR(36) NOT NULL,
  menu_item_id CHAR(36) NOT NULL,
  locale VARCHAR(10) NOT NULL,
  title VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY ux_menu_items_i18n_item_locale (menu_item_id, locale),
  KEY menu_items_i18n_locale_idx (locale),
  KEY menu_items_i18n_title_idx (title),
  CONSTRAINT menu_items_i18n_menu_fk FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_user_read (user_id, is_read),
  KEY idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_templates (
  id CHAR(36) NOT NULL,
  template_key VARCHAR(100) NOT NULL,
  template_name VARCHAR(255) NULL,
  subject VARCHAR(500) NULL,
  content_html LONGTEXT NULL,
  variables LONGTEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY email_templates_key_uq (template_key),
  KEY email_templates_active_idx (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  is_resolved TINYINT(1) NOT NULL DEFAULT 0,
  admin_note VARCHAR(2000) NULL,
  ip VARCHAR(64) NULL,
  user_agent VARCHAR(512) NULL,
  website VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_contact_created_at (created_at),
  KEY idx_contact_status (status),
  KEY idx_contact_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  locale VARCHAR(10) NULL,
  meta LONGTEXT NOT NULL,
  unsubscribed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY newsletter_email_uq (email),
  KEY newsletter_verified_idx (is_verified),
  KEY newsletter_locale_idx (locale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS custom_pages (
  id CHAR(36) NOT NULL,
  module_key VARCHAR(100) NOT NULL DEFAULT 'kurumsal',
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  featured_image VARCHAR(500) NULL,
  storage_asset_id CHAR(36) NULL,
  images JSON DEFAULT (JSON_ARRAY()),
  storage_image_ids JSON DEFAULT (JSON_ARRAY()),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY custom_pages_module_idx (module_key),
  KEY custom_pages_published_idx (is_published),
  KEY custom_pages_order_idx (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS custom_pages_i18n (
  page_id CHAR(36) NOT NULL,
  locale VARCHAR(10) NOT NULL DEFAULT 'tr',
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  content LONGTEXT NULL,
  summary LONGTEXT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description VARCHAR(500) NULL,
  PRIMARY KEY (page_id, locale),
  UNIQUE KEY ux_cp_i18n_locale_slug (locale, slug),
  CONSTRAINT fk_cp_i18n_page FOREIGN KEY (page_id) REFERENCES custom_pages(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
