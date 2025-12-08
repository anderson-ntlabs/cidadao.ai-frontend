-- Migration: Add superuser and onboarding fields to agora_profiles
-- Description: Enables superuser access and tracks onboarding completion
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-08

-- Add superuser flag
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE;

-- Add onboarding fields
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS has_accepted_terms BOOLEAN DEFAULT FALSE;
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Add tracks array (replaces main_track for multi-track support)
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS tracks TEXT[] DEFAULT '{}';

-- Add github contribution tracking
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS github_fork_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS github_fork_url TEXT;

-- Add videos completed count
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS total_videos_completed INTEGER DEFAULT 0;

-- Add last session date for streak calculation
ALTER TABLE agora_profiles ADD COLUMN IF NOT EXISTS last_session_date DATE;

-- Index for superuser queries
CREATE INDEX IF NOT EXISTS idx_agora_profiles_superuser ON agora_profiles(is_superuser) WHERE is_superuser = TRUE;

-- Comment
COMMENT ON COLUMN agora_profiles.is_superuser IS 'Superuser flag for admin access';
COMMENT ON COLUMN agora_profiles.has_completed_onboarding IS 'Whether user completed onboarding flow';
COMMENT ON COLUMN agora_profiles.tracks IS 'Array of selected learning tracks (backend, frontend, ia, devops)';
