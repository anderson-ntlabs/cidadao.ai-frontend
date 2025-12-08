-- Add daily bonus tracking to agora_profiles
-- This column tracks when the user last claimed their daily login bonus
-- Date: 2025-12-08
-- Author: Anderson Henrique da Silva

-- Add the last_daily_bonus_date column
ALTER TABLE agora_profiles
ADD COLUMN IF NOT EXISTS last_daily_bonus_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN agora_profiles.last_daily_bonus_date IS 'Tracks the last date the user claimed their daily login bonus';

-- Create an index for efficient lookups (optional, but good for performance)
CREATE INDEX IF NOT EXISTS idx_agora_profiles_daily_bonus
ON agora_profiles(last_daily_bonus_date);
