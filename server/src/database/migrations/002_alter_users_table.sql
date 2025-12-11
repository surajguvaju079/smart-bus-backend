-- Add password and role columns
ALTER TABLE users
ADD COLUMN password VARCHAR(255) NOT NULL,
ADD COLUMN role VARCHAR(50) DEFAULT 'user';


CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
