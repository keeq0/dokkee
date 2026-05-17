DROP INDEX IF EXISTS idx_auth_credentials_role;
ALTER TABLE auth_credentials DROP COLUMN IF EXISTS role;
DROP TYPE IF EXISTS user_role;
