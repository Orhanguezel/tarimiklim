-- 040_storage_assets_schema.sql
-- @agro/shared-backend storage modulu icin storage_assets tablosu.
-- Schema: packages/shared-backend/modules/storage/schema.ts ile ayni.

CREATE TABLE IF NOT EXISTS `storage_assets` (
  `id`                     CHAR(36)        NOT NULL,
  `user_id`                CHAR(36)        NULL,
  `name`                   VARCHAR(255)    NOT NULL,
  `bucket`                 VARCHAR(64)     NOT NULL,
  `path`                   VARCHAR(512)    NOT NULL,
  `folder`                 VARCHAR(255)    NULL,
  `mime`                   VARCHAR(127)    NOT NULL,
  `size`                   BIGINT UNSIGNED NOT NULL,
  `width`                  INT UNSIGNED    NULL,
  `height`                 INT UNSIGNED    NULL,
  `url`                    TEXT            NULL,
  `hash`                   VARCHAR(64)     NULL,
  `provider`               VARCHAR(16)     NOT NULL DEFAULT 'local',
  `provider_public_id`     VARCHAR(255)    NULL,
  `provider_resource_type` VARCHAR(16)     NULL,
  `provider_format`        VARCHAR(32)     NULL,
  `provider_version`       INT UNSIGNED    NULL,
  `etag`                   VARCHAR(64)     NULL,
  `metadata`               JSON            NULL,
  `created_at`             DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`             DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_bucket_path` (`bucket`, `path`),
  KEY `idx_storage_bucket`  (`bucket`),
  KEY `idx_storage_folder`  (`folder`),
  KEY `idx_storage_created` (`created_at`),
  KEY `idx_provider_pubid`  (`provider_public_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: Marka gorselleri (logo + favicon + apple touch icon)
-- Fiziksel konum: backend/uploads/<name>
INSERT INTO `storage_assets`
  (`id`, `name`, `bucket`, `path`, `folder`, `mime`, `size`, `width`, `height`,
   `url`, `provider`, `provider_resource_type`, `provider_format`, `metadata`)
VALUES
  (
    'b1000000-0001-4000-8000-000000000001',
    'logo.png',
    'uploads',
    'logo.png',
    NULL,
    'image/png',
    2093949,
    1536,
    1024,
    '/uploads/logo.png',
    'local',
    'image',
    'png',
    JSON_OBJECT('alt', 'Tarimiklim Logo', 'usage', 'site-logo')
  ),
  (
    'b1000000-0001-4000-8000-000000000002',
    'favicon.png',
    'uploads',
    'favicon.png',
    NULL,
    'image/png',
    284740,
    1254,
    1254,
    '/uploads/favicon.png',
    'local',
    'image',
    'png',
    JSON_OBJECT('alt', 'Tarimiklim Favicon', 'usage', 'favicon')
  ),
  (
    'b1000000-0001-4000-8000-000000000003',
    'appletouch.png',
    'uploads',
    'appletouch.png',
    NULL,
    'image/png',
    1415713,
    1024,
    1024,
    '/uploads/appletouch.png',
    'local',
    'image',
    'png',
    JSON_OBJECT('alt', 'Tarimiklim Apple Touch Icon', 'usage', 'apple-touch-icon')
  )
ON DUPLICATE KEY UPDATE
  `name`     = VALUES(`name`),
  `url`      = VALUES(`url`),
  `width`    = VALUES(`width`),
  `height`   = VALUES(`height`),
  `size`     = VALUES(`size`),
  `metadata` = VALUES(`metadata`);
