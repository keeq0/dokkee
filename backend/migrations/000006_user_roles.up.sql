CREATE TYPE user_role AS ENUM ('user', 'super_admin');
ALTER TABLE auth_credentials ADD COLUMN role user_role NOT NULL DEFAULT 'user';
CREATE INDEX idx_auth_credentials_role ON auth_credentials(role);
