-- Migration: Fix function search_path security
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-09
-- Description: Adds SET search_path = '' to all functions for security
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- ============================================
-- Fix Kids Mode Functions (from 20251209120000_agora_kids.sql)
-- ============================================

-- Fix generate_parental_code
CREATE OR REPLACE FUNCTION public.generate_parental_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.generate_parental_code() IS 'Generates 6-character alphanumeric code for parental access';

-- Fix create_parental_access_code
CREATE OR REPLACE FUNCTION public.create_parental_access_code(p_parent_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate unique code
  new_code := public.generate_parental_code();

  -- Remove old codes from same parent
  DELETE FROM public.agora_parental_codes
  WHERE parent_user_id = p_parent_user_id;

  -- Insert new code
  INSERT INTO public.agora_parental_codes (parent_user_id, code)
  VALUES (p_parent_user_id, new_code);

  RETURN new_code;
END;
$$;

COMMENT ON FUNCTION public.create_parental_access_code(UUID) IS 'Creates unique permanent parental access code';

-- Fix validate_parental_code
CREATE OR REPLACE FUNCTION public.validate_parental_code(p_code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  parent_user_id UUID,
  kids_profile_id UUID,
  child_name TEXT,
  parent_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update last_used_at when code is used
  UPDATE public.agora_parental_codes
  SET last_used_at = NOW()
  WHERE code = p_code;

  RETURN QUERY
  SELECT
    TRUE as is_valid,
    pc.parent_user_id,
    kp.id as kids_profile_id,
    kp.child_name,
    kp.parent_name
  FROM public.agora_parental_codes pc
  LEFT JOIN public.agora_kids_profiles kp ON kp.parent_user_id = pc.parent_user_id
  WHERE pc.code = p_code;
END;
$$;

COMMENT ON FUNCTION public.validate_parental_code(TEXT) IS 'Validates parental code and returns Kids profile data';

-- Fix get_kids_daily_stats
CREATE OR REPLACE FUNCTION public.get_kids_daily_stats(
  p_kids_profile_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_minutes INTEGER,
  total_sessions INTEGER,
  videos_watched TEXT[],
  agents_used TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(s.duration_minutes), 0)::INTEGER as total_minutes,
    COUNT(*)::INTEGER as total_sessions,
    ARRAY(
      SELECT DISTINCT unnest(s.videos_watched)
      FROM public.agora_kids_sessions s
      WHERE s.kids_profile_id = p_kids_profile_id
        AND DATE(s.started_at) = p_date
    ) as videos_watched,
    ARRAY(
      SELECT DISTINCT unnest(s.agents_interacted)
      FROM public.agora_kids_sessions s
      WHERE s.kids_profile_id = p_kids_profile_id
        AND DATE(s.started_at) = p_date
    ) as agents_used
  FROM public.agora_kids_sessions s
  WHERE s.kids_profile_id = p_kids_profile_id
    AND DATE(s.started_at) = p_date;
END;
$$;

COMMENT ON FUNCTION public.get_kids_daily_stats(UUID, DATE) IS 'Returns daily stats for parental report';

-- Fix update_kids_profile_updated_at
CREATE OR REPLACE FUNCTION public.update_kids_profile_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_kids_profile_updated_at() IS 'Trigger function to update kids profile updated_at';

-- ============================================
-- Fix Challenge Progress Functions (from 20251208000000_add_challenge_progress.sql)
-- ============================================

-- Fix get_challenge_period
CREATE OR REPLACE FUNCTION public.get_challenge_period(
    p_challenge_type TEXT
)
RETURNS TABLE(period_start DATE, period_end DATE)
LANGUAGE plpgsql
SET search_path = ''
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

COMMENT ON FUNCTION public.get_challenge_period(TEXT) IS 'Returns the current period start and end dates for a challenge type';

-- ============================================
-- Fix potential legacy function: update_updated_at
-- This function may exist in the database but not in migrations
-- ============================================

-- Drop if exists and recreate with proper search_path
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at() IS 'Generic trigger function to update updated_at timestamp';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Fixed functions:
-- 1. generate_parental_code
-- 2. create_parental_access_code
-- 3. validate_parental_code
-- 4. get_kids_daily_stats
-- 5. update_kids_profile_updated_at
-- 6. get_challenge_period
-- 7. update_updated_at (legacy cleanup)
-- ============================================
