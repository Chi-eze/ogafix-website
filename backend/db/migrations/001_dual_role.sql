-- Dual-role support: every user is a customer; tradesman is an optional profile.
-- Run: psql ... -f db/migrations/001_dual_role.sql

ALTER TABLE tradesmen ALTER COLUMN trade_category DROP NOT NULL;

COMMENT ON COLUMN users.user_type IS 'UI default role at signup (customer|tradesman). All users can post jobs.';

CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
