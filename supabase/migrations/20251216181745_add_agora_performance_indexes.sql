-- Performance Indexes for Agora Platform
-- Optimizes common query patterns for user data fetching
-- @author Anderson Henrique da Silva
-- @since 2025-12-16

-- Index on agora_profiles for user_id lookups
-- Used by: get_agora_user_data RPC, profile queries
CREATE INDEX IF NOT EXISTS idx_agora_profiles_user_id
ON agora_profiles(user_id);

-- Index on agora_consent for user_id lookups
-- Used by: consent checks during session init
CREATE INDEX IF NOT EXISTS idx_agora_consent_user_id
ON agora_consent(user_id);

-- Index on agora_xp_transactions for user_id lookups
-- Used by: XP history, leaderboards
CREATE INDEX IF NOT EXISTS idx_agora_xp_transactions_user_id
ON agora_xp_transactions(user_id);

-- Composite index on agora_xp_transactions for time-based queries
-- Used by: Recent XP gains, daily/weekly stats
CREATE INDEX IF NOT EXISTS idx_agora_xp_transactions_user_created
ON agora_xp_transactions(user_id, created_at DESC);

-- Index on agora_diary_entries for user_id lookups
-- Used by: Diary listing, reflection history
CREATE INDEX IF NOT EXISTS idx_agora_diary_entries_user_id
ON agora_diary_entries(user_id);

-- Composite index on agora_diary_entries for pagination
-- Used by: Diary feed with date sorting
CREATE INDEX IF NOT EXISTS idx_agora_diary_entries_user_date
ON agora_diary_entries(user_id, created_at DESC);

-- Index on agora_sessions for user_id lookups
-- Used by: Session history, learning progress
CREATE INDEX IF NOT EXISTS idx_agora_sessions_user_id
ON agora_sessions(user_id);

-- Composite index on agora_sessions for active sessions
-- Used by: Current session lookups, finding sessions without end time
CREATE INDEX IF NOT EXISTS idx_agora_sessions_user_started
ON agora_sessions(user_id, started_at DESC);

-- Analyze tables to update statistics after index creation
ANALYZE agora_profiles;
ANALYZE agora_consent;
ANALYZE agora_xp_transactions;
ANALYZE agora_diary_entries;
ANALYZE agora_sessions;
