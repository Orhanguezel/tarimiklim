-- 031_audit_quality_columns_apply.sql
-- audit_request_logs icin shared-backend'in bekledigi bot/internal/attribution
-- kolonlarini idempotent ekler (vistaseeds 193 kalibi).
-- Canlida `mysql ... < 031_audit_quality_columns_apply.sql` ile uygulanir (DROP yok, veri korunur).
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND COLUMN_NAME = 'is_bot');
SET @sql := IF(@col = 0,
  'ALTER TABLE `audit_request_logs` ADD COLUMN `is_bot` TINYINT NOT NULL DEFAULT 0 AFTER `is_admin`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND COLUMN_NAME = 'is_internal');
SET @sql := IF(@col = 0,
  'ALTER TABLE `audit_request_logs` ADD COLUMN `is_internal` TINYINT NOT NULL DEFAULT 0 AFTER `is_bot`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND COLUMN_NAME = 'gclid');
SET @sql := IF(@col = 0,
  'ALTER TABLE `audit_request_logs` ADD COLUMN `gclid` VARCHAR(255) NULL AFTER `request_body`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND COLUMN_NAME = 'utm_source');
SET @sql := IF(@col = 0,
  'ALTER TABLE `audit_request_logs` ADD COLUMN `utm_source` VARCHAR(255) NULL AFTER `gclid`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND COLUMN_NAME = 'utm_medium');
SET @sql := IF(@col = 0,
  'ALTER TABLE `audit_request_logs` ADD COLUMN `utm_medium` VARCHAR(255) NULL AFTER `utm_source`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND COLUMN_NAME = 'utm_campaign');
SET @sql := IF(@col = 0,
  'ALTER TABLE `audit_request_logs` ADD COLUMN `utm_campaign` VARCHAR(255) NULL AFTER `utm_medium`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND COLUMN_NAME = 'utm_content');
SET @sql := IF(@col = 0,
  'ALTER TABLE `audit_request_logs` ADD COLUMN `utm_content` VARCHAR(255) NULL AFTER `utm_campaign`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND COLUMN_NAME = 'utm_term');
SET @sql := IF(@col = 0,
  'ALTER TABLE `audit_request_logs` ADD COLUMN `utm_term` VARCHAR(255) NULL AFTER `utm_content`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND INDEX_NAME = 'audit_request_logs_bot_idx');
SET @sql := IF(@idx = 0,
  'ALTER TABLE `audit_request_logs` ADD KEY `audit_request_logs_bot_idx` (`is_bot`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND INDEX_NAME = 'audit_request_logs_internal_idx');
SET @sql := IF(@idx = 0,
  'ALTER TABLE `audit_request_logs` ADD KEY `audit_request_logs_internal_idx` (`is_internal`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND INDEX_NAME = 'audit_request_logs_gclid_idx');
SET @sql := IF(@idx = 0,
  'ALTER TABLE `audit_request_logs` ADD KEY `audit_request_logs_gclid_idx` (`gclid`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_request_logs' AND INDEX_NAME = 'audit_request_logs_utm_source_idx');
SET @sql := IF(@idx = 0,
  'ALTER TABLE `audit_request_logs` ADD KEY `audit_request_logs_utm_source_idx` (`utm_source`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Mevcut satirlar icin bot/internal geri doldurma
UPDATE `audit_request_logs`
SET
  `is_bot` = CASE
    WHEN LOWER(COALESCE(`user_agent`, '')) REGEXP 'bot|crawler|spider|slurp|facebookexternalhit|whatsapp|telegrambot|googlebot|bingbot|yandex|headless|lighthouse'
    THEN 1 ELSE 0
  END,
  `is_internal` = CASE
    WHEN `ip` IS NULL OR `ip` = ''
      OR `country` = 'LOCAL'
      OR `ip` LIKE '127.%'
      OR `ip` = '::1'
      OR `ip` LIKE '::ffff:127.%'
      OR `ip` LIKE '10.%'
      OR `ip` LIKE '192.168.%'
      OR `ip` LIKE '172.16.%'
      OR `ip` LIKE '172.17.%'
      OR `ip` LIKE '172.18.%'
      OR `ip` LIKE '172.19.%'
      OR `ip` LIKE '172.20.%'
      OR `ip` LIKE '172.21.%'
      OR `ip` LIKE '172.22.%'
      OR `ip` LIKE '172.23.%'
      OR `ip` LIKE '172.24.%'
      OR `ip` LIKE '172.25.%'
      OR `ip` LIKE '172.26.%'
      OR `ip` LIKE '172.27.%'
      OR `ip` LIKE '172.28.%'
      OR `ip` LIKE '172.29.%'
      OR `ip` LIKE '172.30.%'
      OR `ip` LIKE '172.31.%'
    THEN 1 ELSE 0
  END;
