CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  is_active TINYINT NOT NULL DEFAULT 1,
  email_verified TINYINT NOT NULL DEFAULT 0,
  reset_token VARCHAR(255),
  reset_token_expires DATETIME(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  rules_accepted_at DATETIME(3),
  last_sign_in_at DATETIME(3),
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role ENUM('admin','editor','carrier','customer','dealer') NOT NULL DEFAULT 'customer',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY user_roles_user_id_role_unique (user_id, role),
  KEY user_roles_user_id_idx (user_id),
  KEY user_roles_role_idx (role),
  KEY user_roles_user_id_created_at_idx (user_id, created_at),
  CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3),
  replaced_by CHAR(36),
  PRIMARY KEY (id),
  KEY refresh_tokens_user_id_idx (user_id),
  KEY refresh_tokens_expires_at_idx (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) NOT NULL,
  full_name TEXT,
  phone VARCHAR(64),
  avatar_url TEXT,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(128),
  country VARCHAR(128),
  postal_code VARCHAR(32),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_profiles_id FOREIGN KEY (id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
