-- Admin kullanici seed — @ADMIN_ID, @ADMIN_EMAIL, @ADMIN_PASSWORD_HASH runner tarafindan inject edilir
INSERT IGNORE INTO users (id, email, password_hash, full_name, is_active, email_verified)
VALUES (@ADMIN_ID, @ADMIN_EMAIL, @ADMIN_PASSWORD_HASH, 'Yerel Admin', 1, 0);

UPDATE users
SET email = @ADMIN_EMAIL,
    password_hash = @ADMIN_PASSWORD_HASH,
    full_name = 'Yerel Admin',
    is_active = 1
WHERE id = @ADMIN_ID;

INSERT IGNORE INTO user_roles (id, user_id, role)
VALUES (UUID(), @ADMIN_ID, 'admin');

INSERT IGNORE INTO profiles (id, full_name)
VALUES (@ADMIN_ID, 'Yerel Admin');

UPDATE profiles SET full_name = 'Yerel Admin' WHERE id = @ADMIN_ID;
