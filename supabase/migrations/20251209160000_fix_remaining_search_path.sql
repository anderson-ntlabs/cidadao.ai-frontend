-- Migration: Fix remaining function search_path security
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-09
-- Description: Fixes search_path for Agora gamification functions
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- ============================================
-- Fix Agora Gamification Functions
-- These were created without SET search_path in the database
-- ============================================

-- Fix calculate_level
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    RETURN GREATEST(1, (xp / 100) + 1);
END;
$$;

COMMENT ON FUNCTION public.calculate_level(INTEGER) IS 'Calculate user level based on XP';

-- Fix calculate_rank
CREATE OR REPLACE FUNCTION public.calculate_rank(xp INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF xp >= 5000 THEN RETURN 'arquiteto';
    ELSIF xp >= 2000 THEN RETURN 'mentor';
    ELSIF xp >= 500 THEN RETURN 'contribuidor';
    ELSIF xp >= 100 THEN RETURN 'aprendiz';
    ELSE RETURN 'novato';
    END IF;
END;
$$;

COMMENT ON FUNCTION public.calculate_rank(INTEGER) IS 'Calculate user rank based on XP';

-- Fix update_rank_and_level
CREATE OR REPLACE FUNCTION public.update_rank_and_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.current_rank := public.calculate_rank(NEW.total_xp);
    NEW.current_level := public.calculate_level(NEW.total_xp);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_rank_and_level() IS 'Trigger function to auto-update rank and level on XP change';

-- Fix get_agora_leaderboard
CREATE OR REPLACE FUNCTION public.get_agora_leaderboard(
    sort_by TEXT DEFAULT 'xp',
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    total_xp INTEGER,
    current_level INTEGER,
    current_rank TEXT,
    current_streak INTEGER,
    total_time_minutes INTEGER,
    rank_position BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF sort_by = 'xp' THEN
        RETURN QUERY
        SELECT p.id, p.user_id, p.full_name, p.avatar_url, p.total_xp, p.current_level,
               p.current_rank, p.current_streak, p.total_time_minutes,
               ROW_NUMBER() OVER (ORDER BY p.total_xp DESC)
        FROM public.agora_profiles p
        WHERE p.is_active = TRUE
        ORDER BY p.total_xp DESC
        LIMIT limit_count;
    ELSIF sort_by = 'time' THEN
        RETURN QUERY
        SELECT p.id, p.user_id, p.full_name, p.avatar_url, p.total_xp, p.current_level,
               p.current_rank, p.current_streak, p.total_time_minutes,
               ROW_NUMBER() OVER (ORDER BY p.total_time_minutes DESC)
        FROM public.agora_profiles p
        WHERE p.is_active = TRUE
        ORDER BY p.total_time_minutes DESC
        LIMIT limit_count;
    ELSE
        RETURN QUERY
        SELECT p.id, p.user_id, p.full_name, p.avatar_url, p.total_xp, p.current_level,
               p.current_rank, p.current_streak, p.total_time_minutes,
               ROW_NUMBER() OVER (ORDER BY p.current_streak DESC)
        FROM public.agora_profiles p
        WHERE p.is_active = TRUE
        ORDER BY p.current_streak DESC
        LIMIT limit_count;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.get_agora_leaderboard(TEXT, INTEGER) IS 'Get Agora leaderboard with configurable sorting';

-- Fix get_user_rank
CREATE OR REPLACE FUNCTION public.get_user_rank(
    p_user_id UUID,
    sort_by TEXT DEFAULT 'xp'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    IF sort_by = 'xp' THEN
        SELECT rp INTO user_rank
        FROM (
            SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) AS rp
            FROM public.agora_profiles
            WHERE is_active = TRUE
        ) ranked
        WHERE ranked.user_id = p_user_id;
    ELSIF sort_by = 'time' THEN
        SELECT rp INTO user_rank
        FROM (
            SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_time_minutes DESC) AS rp
            FROM public.agora_profiles
            WHERE is_active = TRUE
        ) ranked
        WHERE ranked.user_id = p_user_id;
    ELSE
        SELECT rp INTO user_rank
        FROM (
            SELECT user_id, ROW_NUMBER() OVER (ORDER BY current_streak DESC) AS rp
            FROM public.agora_profiles
            WHERE is_active = TRUE
        ) ranked
        WHERE ranked.user_id = p_user_id;
    END IF;
    RETURN COALESCE(user_rank, 0);
END;
$$;

COMMENT ON FUNCTION public.get_user_rank(UUID, TEXT) IS 'Get user rank position in leaderboard';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Fixed functions:
-- 1. calculate_level
-- 2. calculate_rank
-- 3. update_rank_and_level
-- 4. get_agora_leaderboard
-- 5. get_user_rank
-- ============================================
