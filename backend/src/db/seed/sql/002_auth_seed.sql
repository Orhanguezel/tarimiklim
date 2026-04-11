-- Admin kullanici seed — @ADMIN_ID, @ADMIN_EMAIL, @ADMIN_PASSWORD_HASH runner tarafindan inject edilir
INSERT IGNORE INTO users (id, email, password_hash, full_name, is_active, email_verified)
VALUES (@ADMIN_ID, @ADMIN_EMAIL, @ADMIN_PASSWORD_HASH, 'Yerel Admin', 1, 0);

INSERT IGNORE INTO user_roles (id, user_id, role)
VALUES (UUID(), @ADMIN_ID, 'admin');

INSERT IGNORE INTO profiles (id, full_name)
VALUES (@ADMIN_ID, 'Yerel Admin');
