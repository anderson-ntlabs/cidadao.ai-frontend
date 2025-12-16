-- Migration: get_agora_user_data_rpc
-- Description: RPC function to fetch all Agora user data in a single call
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-16
--
-- Performance optimization: Reduces 5 separate queries to 1 RPC call
-- Expected improvement: ~300ms TTFB reduction

-- Create composite type for the response
CREATE TYPE agora_user_data AS (
  -- Profile data
  profile_id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  matricula TEXT,
  curso TEXT,
  periodo INTEGER,
  total_xp INTEGER,
  current_level INTEGER,
  current_rank TEXT,
  tracks JSONB,
  current_streak INTEGER,
  longest_streak INTEGER,
  total_sessions INTEGER,
  total_time_minutes INTEGER,
  total_videos_completed INTEGER,
  has_accepted_terms BOOLEAN,
  has_completed_onboarding BOOLEAN,
  onboarding_step INTEGER,
  is_superuser BOOLEAN,
  is_active BOOLEAN,
  enrolled_at TIMESTAMPTZ,
  last_activity_date DATE,
  last_daily_bonus_date DATE,

  -- Consent data
  has_consent BOOLEAN,

  -- Aggregated data as JSONB arrays
  xp_transactions JSONB,
  diary_entries JSONB,
  sessions JSONB
);

-- Main RPC function
CREATE OR REPLACE FUNCTION get_agora_user_data(p_user_id UUID)
RETURNS agora_user_data
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result agora_user_data;
  v_profile agora_profiles%ROWTYPE;
  v_has_consent BOOLEAN;
BEGIN
  -- Get profile
  SELECT * INTO v_profile
  FROM agora_profiles
  WHERE user_id = p_user_id;

  -- Check consent
  SELECT EXISTS(
    SELECT 1 FROM agora_consent WHERE user_id = p_user_id
  ) INTO v_has_consent;

  -- Build result
  result.profile_id := v_profile.id;
  result.user_id := v_profile.user_id;
  result.email := v_profile.email;
  result.full_name := v_profile.full_name;
  result.avatar_url := v_profile.avatar_url;
  result.github_username := v_profile.github_username;
  result.matricula := v_profile.matricula;
  result.curso := v_profile.curso;
  result.periodo := v_profile.periodo;
  result.total_xp := v_profile.total_xp;
  result.current_level := v_profile.current_level;
  result.current_rank := v_profile.current_rank;
  result.tracks := v_profile.tracks;
  result.current_streak := v_profile.current_streak;
  result.longest_streak := v_profile.longest_streak;
  result.total_sessions := v_profile.total_sessions;
  result.total_time_minutes := v_profile.total_time_minutes;
  result.total_videos_completed := v_profile.total_videos_completed;
  result.has_accepted_terms := v_profile.has_accepted_terms;
  result.has_completed_onboarding := v_profile.has_completed_onboarding;
  result.onboarding_step := v_profile.onboarding_step;
  result.is_superuser := v_profile.is_superuser;
  result.is_active := v_profile.is_active;
  result.enrolled_at := v_profile.enrolled_at;
  result.last_activity_date := v_profile.last_activity_date;
  result.last_daily_bonus_date := v_profile.last_daily_bonus_date;

  result.has_consent := v_has_consent;

  -- Get XP transactions (last 50)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'amount', t.amount,
        'balance_after', t.balance_after,
        'source_type', t.source_type,
        'description', t.description,
        'created_at', t.created_at
      ) ORDER BY t.created_at DESC
    ),
    '[]'::jsonb
  ) INTO result.xp_transactions
  FROM (
    SELECT * FROM agora_xp_transactions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 50
  ) t;

  -- Get diary entries (last 50)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'content', d.content,
        'mood', d.mood,
        'tags', d.tags,
        'created_at', d.created_at
      ) ORDER BY d.created_at DESC
    ),
    '[]'::jsonb
  ) INTO result.diary_entries
  FROM (
    SELECT * FROM agora_diary_entries
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 50
  ) d;

  -- Get sessions (last 50)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'track_id', s.track_id,
        'video_id', s.video_id,
        'started_at', s.started_at,
        'ended_at', s.ended_at,
        'duration_minutes', s.duration_minutes,
        'completed', s.completed,
        'xp_earned', s.xp_earned
      ) ORDER BY s.started_at DESC
    ),
    '[]'::jsonb
  ) INTO result.sessions
  FROM (
    SELECT * FROM agora_sessions
    WHERE user_id = p_user_id
    ORDER BY started_at DESC
    LIMIT 50
  ) s;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_agora_user_data(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_agora_user_data(UUID) IS
'Fetches all Agora user data in a single call for performance optimization.
Returns profile, consent status, XP transactions, diary entries, and sessions.
Reduces 5 separate queries to 1 RPC call (~300ms TTFB improvement).';
