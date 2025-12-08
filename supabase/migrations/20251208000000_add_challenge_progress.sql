-- Migration: Add challenge progress tracking
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-08
-- Description: Creates table to persist daily/weekly challenge progress

-- ============================================
-- Challenge Progress Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.agora_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Challenge identification
    challenge_id TEXT NOT NULL,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly')),

    -- Progress tracking
    current_progress INTEGER DEFAULT 0,
    target_value INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,

    -- XP tracking
    xp_reward INTEGER DEFAULT 0,
    xp_claimed BOOLEAN DEFAULT FALSE,
    xp_claimed_at TIMESTAMPTZ,

    -- Period tracking (for resetting challenges)
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one challenge per user per period
    UNIQUE(user_id, challenge_id, period_start)
);

-- Add comments
COMMENT ON TABLE public.agora_challenge_progress IS 'Tracks daily and weekly challenge progress for gamification';
COMMENT ON COLUMN public.agora_challenge_progress.challenge_id IS 'Unique identifier for the challenge type (e.g., daily_xp, weekly_sessions)';
COMMENT ON COLUMN public.agora_challenge_progress.period_start IS 'Start date of the challenge period (today for daily, monday for weekly)';

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id
    ON public.agora_challenge_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_period
    ON public.agora_challenge_progress(user_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_active
    ON public.agora_challenge_progress(user_id, is_completed, period_end)
    WHERE is_completed = FALSE;

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE public.agora_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own challenge progress
CREATE POLICY "Users can view own challenge progress"
    ON public.agora_challenge_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own challenge progress
CREATE POLICY "Users can insert own challenge progress"
    ON public.agora_challenge_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own challenge progress
CREATE POLICY "Users can update own challenge progress"
    ON public.agora_challenge_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- Trigger for updated_at
-- ============================================

CREATE TRIGGER handle_challenge_progress_updated_at
    BEFORE UPDATE ON public.agora_challenge_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Helper function to get current challenge period
-- ============================================

CREATE OR REPLACE FUNCTION public.get_challenge_period(
    p_challenge_type TEXT
)
RETURNS TABLE(period_start DATE, period_end DATE)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_challenge_type = 'daily' THEN
        RETURN QUERY SELECT
            CURRENT_DATE AS period_start,
            CURRENT_DATE AS period_end;
    ELSIF p_challenge_type = 'weekly' THEN
        -- Week starts on Monday
        RETURN QUERY SELECT
            DATE_TRUNC('week', CURRENT_DATE)::DATE AS period_start,
            (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::DATE AS period_end;
    ELSE
        RAISE EXCEPTION 'Invalid challenge type: %', p_challenge_type;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.get_challenge_period IS 'Returns the current period start and end dates for a challenge type';
