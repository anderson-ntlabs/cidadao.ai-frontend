-- Migration: fix_get_agora_user_data_rpc
-- Description: Fix RPC function - use correct column names from actual schema
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-16
--
-- Issues fixed:
-- - column d.tags does not exist in agora_diary_entries
-- - column s.track_id, s.video_id, s.completed do not exist in agora_sessions

-- Recreate the RPC function with correct column references
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

  -- Get diary entries (last 50) - FIXED: use actual columns from schema
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'content', d.content,
        'mood', d.mood,
        'entry_date', d.entry_date,
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

  -- Get sessions (last 50) - FIXED: use actual columns from schema
  -- Schema has: id, user_id, started_at, ended_at, duration_minutes, xp_earned, status
  -- No: track_id, video_id, completed
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'started_at', s.started_at,
        'ended_at', s.ended_at,
        'duration_minutes', s.duration_minutes,
        'xp_earned', s.xp_earned,
        'status', s.status,
        'completed', (s.status = 'completed')
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

-- Add updated comment
COMMENT ON FUNCTION get_agora_user_data(UUID) IS
'Fetches all Agora user data in a single call for performance optimization.
Returns profile, consent status, XP transactions, diary entries, and sessions.
Reduces 5 separate queries to 1 RPC call (~300ms TTFB improvement).
Fixed: 2025-12-16 - corrected column references to match actual schema.';
