-- ============================================================================
-- CIDADAO.AI - SECURITY HARDENING MIGRATION
-- Fixes Supabase Database Linter warnings
-- Date: December 2025
-- Author: Anderson Henrique da Silva
-- ============================================================================
--
-- ISSUES ADDRESSED:
-- 1. RLS disabled on public tables (agora_events, agora_videos, agora_required_readings)
-- 2. SECURITY DEFINER views (10 views)
-- 3. Functions with mutable search_path (16 functions)
-- 4. Functions with unnecessary SECURITY DEFINER
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENABLE RLS ON PUBLIC TABLES
-- These tables had policies created but RLS was never enabled
-- ============================================================================

ALTER TABLE IF EXISTS public.agora_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agora_required_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agora_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 2: RECREATE ANALYTICS VIEWS WITHOUT SECURITY DEFINER
-- Views are recreated to ensure no SECURITY DEFINER property
-- ============================================================================

-- Drop and recreate daily_event_summary
DROP VIEW IF EXISTS public.daily_event_summary CASCADE;
CREATE VIEW public.daily_event_summary AS
SELECT
  DATE(created_at) as date,
  event_type,
  event_category,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(duration_ms) as avg_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as median_duration,
  COUNT(*) FILTER (WHERE is_authenticated) as authenticated_events,
  COUNT(*) FILTER (WHERE is_demo_mode) as demo_mode_events
FROM usability_events
WHERE has_research_consent = true
GROUP BY DATE(created_at), event_type, event_category
ORDER BY date DESC, event_count DESC;

-- Drop and recreate agent_usage_stats
DROP VIEW IF EXISTS public.agent_usage_stats CASCADE;
CREATE VIEW public.agent_usage_stats AS
SELECT
  agent_used,
  COUNT(*) as total_uses,
  AVG(duration_ms) as avg_interaction_time,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_hash) FILTER (WHERE user_hash IS NOT NULL) as unique_users,
  SUM(CASE WHEN event_type = 'investigation_completed' THEN 1 ELSE 0 END) as investigations_completed,
  AVG(steps_taken) FILTER (WHERE steps_taken IS NOT NULL) as avg_steps
FROM usability_events
WHERE agent_used IS NOT NULL
  AND has_research_consent = true
GROUP BY agent_used
ORDER BY total_uses DESC;

-- Drop and recreate device_browser_stats
DROP VIEW IF EXISTS public.device_browser_stats CASCADE;
CREATE VIEW public.device_browser_stats AS
SELECT
  device_type,
  browser,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(screen_width) as avg_screen_width,
  AVG(screen_height) as avg_screen_height
FROM usability_events
WHERE has_research_consent = true
GROUP BY device_type, browser
ORDER BY event_count DESC;

-- Drop and recreate accessibility_usage
DROP VIEW IF EXISTS public.accessibility_usage CASCADE;
CREATE VIEW public.accessibility_usage AS
SELECT
  interaction_type as feature,
  COUNT(*) as usage_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_hash) FILTER (WHERE user_hash IS NOT NULL) as unique_users
FROM usability_events
WHERE event_type = 'accessibility_toggle'
  AND has_research_consent = true
GROUP BY interaction_type
ORDER BY usage_count DESC;

-- Drop and recreate performance_metrics
DROP VIEW IF EXISTS public.performance_metrics CASCADE;
CREATE VIEW public.performance_metrics AS
SELECT
  event_type,
  COUNT(*) as total_events,
  AVG(duration_ms) as avg_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50_duration,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_duration,
  MAX(duration_ms) as max_duration
FROM usability_events
WHERE duration_ms IS NOT NULL
  AND has_research_consent = true
GROUP BY event_type
ORDER BY total_events DESC;

-- Drop and recreate investigation_summaries
DROP VIEW IF EXISTS public.investigation_summaries CASCADE;
CREATE VIEW public.investigation_summaries AS
SELECT
  session_id,
  MIN(created_at) as started_at,
  MAX(created_at) as completed_at,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) * 1000 as duration_ms,
  COUNT(*) as steps_taken,
  MAX(agent_used) as primary_agent,
  bool_or(event_type = 'investigation_completed') as was_completed
FROM usability_events
WHERE event_category = 'investigation'
  AND has_research_consent = true
GROUP BY session_id
ORDER BY started_at DESC;

-- Drop and recreate high_severity_anomalies
DROP VIEW IF EXISTS public.high_severity_anomalies CASCADE;
CREATE VIEW public.high_severity_anomalies AS
SELECT
  created_at,
  session_id,
  agent_used,
  page_path,
  duration_ms
FROM usability_events
WHERE event_type = 'anomaly_detected'
  AND has_research_consent = true
ORDER BY created_at DESC;

-- Drop and recreate auto_investigation_summary
DROP VIEW IF EXISTS public.auto_investigation_summary CASCADE;
CREATE VIEW public.auto_investigation_summary AS
SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE event_type = 'investigation_started') as investigations_started,
  COUNT(*) FILTER (WHERE event_type = 'investigation_completed') as investigations_completed,
  ROUND(
    100.0 *
    COUNT(*) FILTER (WHERE event_type = 'investigation_completed') /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'investigation_started'), 0),
    2
  ) as completion_rate,
  AVG(duration_ms) FILTER (WHERE event_type = 'investigation_completed') as avg_completion_time
FROM usability_events
WHERE event_category = 'investigation'
  AND has_research_consent = true
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Drop and recreate anomaly_stats_by_source
DROP VIEW IF EXISTS public.anomaly_stats_by_source CASCADE;
CREATE VIEW public.anomaly_stats_by_source AS
SELECT
  element_clicked as anomaly_source,
  COUNT(*) as anomaly_count,
  COUNT(DISTINCT session_id) as affected_sessions,
  AVG(duration_ms) as avg_detection_time
FROM usability_events
WHERE event_type = 'anomaly_detected'
  AND has_research_consent = true
  AND element_clicked IS NOT NULL
GROUP BY element_clicked
ORDER BY anomaly_count DESC;

-- Drop and recreate agora_leaderboard
DROP VIEW IF EXISTS public.agora_leaderboard CASCADE;
CREATE VIEW public.agora_leaderboard AS
SELECT
    id,
    user_id,
    full_name,
    avatar_url,
    total_xp,
    current_level,
    current_rank,
    current_streak,
    total_time_minutes,
    total_sessions,
    is_active
FROM agora_profiles
WHERE is_active = TRUE
ORDER BY total_xp DESC;

-- Grant SELECT on views to authenticated users
GRANT SELECT ON public.daily_event_summary TO authenticated;
GRANT SELECT ON public.agent_usage_stats TO authenticated;
GRANT SELECT ON public.device_browser_stats TO authenticated;
GRANT SELECT ON public.accessibility_usage TO authenticated;
GRANT SELECT ON public.performance_metrics TO authenticated;
GRANT SELECT ON public.investigation_summaries TO authenticated;
GRANT SELECT ON public.high_severity_anomalies TO authenticated;
GRANT SELECT ON public.auto_investigation_summary TO authenticated;
GRANT SELECT ON public.anomaly_stats_by_source TO authenticated;
GRANT SELECT ON public.agora_leaderboard TO authenticated;

-- ============================================================================
-- SECTION 3: RECREATE FUNCTIONS WITH SECURE search_path
-- All functions now have SET search_path = '' for security
-- SECURITY DEFINER removed where not necessary
-- ============================================================================

-- 3.1 Survey/Badge Functions
DROP FUNCTION IF EXISTS public.update_survey_response_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_survey_response_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger for survey_responses
DROP TRIGGER IF EXISTS trigger_survey_response_updated_at ON survey_responses;
CREATE TRIGGER trigger_survey_response_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_survey_response_updated_at();

-- user_has_badge: Needs SECURITY DEFINER to allow checking other users' badges
DROP FUNCTION IF EXISTS public.user_has_badge(UUID, VARCHAR) CASCADE;
CREATE OR REPLACE FUNCTION public.user_has_badge(p_user_id UUID, p_badge_type VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_badges
    WHERE user_id = p_user_id
    AND badge_type = p_badge_type
  );
END;
$$;

-- award_badge: Needs SECURITY DEFINER to allow system to award badges
DROP FUNCTION IF EXISTS public.award_badge(UUID, VARCHAR, VARCHAR, VARCHAR) CASCADE;
CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id UUID,
  p_badge_type VARCHAR,
  p_source_type VARCHAR DEFAULT 'survey',
  p_source_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inserted BOOLEAN;
BEGIN
  INSERT INTO public.user_badges (user_id, badge_type, source_type, source_id)
  VALUES (p_user_id, p_badge_type, p_source_type, p_source_id)
  ON CONFLICT (user_id, badge_type) DO NOTHING
  RETURNING TRUE INTO v_inserted;

  RETURN COALESCE(v_inserted, FALSE);
END;
$$;

-- 3.2 Session Journey Function
DROP FUNCTION IF EXISTS public.get_session_journey(VARCHAR) CASCADE;
CREATE OR REPLACE FUNCTION public.get_session_journey(p_session_id VARCHAR)
RETURNS TABLE (
  event_time TIMESTAMP WITH TIME ZONE,
  event_type VARCHAR,
  page_path VARCHAR,
  element_clicked VARCHAR,
  agent_used VARCHAR,
  duration_ms INTEGER
)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ue.created_at,
    ue.event_type,
    ue.page_path,
    ue.element_clicked,
    ue.agent_used,
    ue.duration_ms
  FROM public.usability_events ue
  WHERE ue.session_id = p_session_id
    AND ue.has_research_consent = true
  ORDER BY ue.created_at ASC;
END;
$$;

-- 3.3 Agora/Academy Functions
DROP FUNCTION IF EXISTS public.calculate_rank(INTEGER) CASCADE;
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

DROP FUNCTION IF EXISTS public.calculate_level(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    RETURN GREATEST(1, (xp / 100) + 1);
END;
$$;

DROP FUNCTION IF EXISTS public.update_rank_and_level() CASCADE;
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

-- Recreate trigger for agora_profiles
DROP TRIGGER IF EXISTS trigger_update_rank_level ON agora_profiles;
CREATE TRIGGER trigger_update_rank_level
    BEFORE UPDATE OF total_xp ON agora_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rank_and_level();

DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

-- Recreate triggers using update_updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated ON agora_profiles;
CREATE TRIGGER trigger_profiles_updated
    BEFORE UPDATE ON agora_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_sessions_updated ON agora_sessions;
CREATE TRIGGER trigger_sessions_updated
    BEFORE UPDATE ON agora_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 3.4 handle_updated_at (for chat tables)
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate triggers for chat tables
DROP TRIGGER IF EXISTS set_investigations_updated_at ON public.investigations;
CREATE TRIGGER set_investigations_updated_at
    BEFORE UPDATE ON public.investigations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER set_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3.5 Leaderboard Functions (need SECURITY DEFINER to access all profiles)
DROP FUNCTION IF EXISTS public.get_agora_leaderboard(TEXT, INTEGER) CASCADE;
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
        SELECT
            p.id,
            p.user_id,
            p.full_name,
            p.avatar_url,
            p.total_xp,
            p.current_level,
            p.current_rank,
            p.current_streak,
            p.total_time_minutes,
            ROW_NUMBER() OVER (ORDER BY p.total_xp DESC) AS rank_position
        FROM public.agora_profiles p
        WHERE p.is_active = TRUE
        ORDER BY p.total_xp DESC
        LIMIT limit_count;
    ELSIF sort_by = 'time' THEN
        RETURN QUERY
        SELECT
            p.id,
            p.user_id,
            p.full_name,
            p.avatar_url,
            p.total_xp,
            p.current_level,
            p.current_rank,
            p.current_streak,
            p.total_time_minutes,
            ROW_NUMBER() OVER (ORDER BY p.total_time_minutes DESC) AS rank_position
        FROM public.agora_profiles p
        WHERE p.is_active = TRUE
        ORDER BY p.total_time_minutes DESC
        LIMIT limit_count;
    ELSE -- streak
        RETURN QUERY
        SELECT
            p.id,
            p.user_id,
            p.full_name,
            p.avatar_url,
            p.total_xp,
            p.current_level,
            p.current_rank,
            p.current_streak,
            p.total_time_minutes,
            ROW_NUMBER() OVER (ORDER BY p.current_streak DESC) AS rank_position
        FROM public.agora_profiles p
        WHERE p.is_active = TRUE
        ORDER BY p.current_streak DESC
        LIMIT limit_count;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_agora_leaderboard TO authenticated;

DROP FUNCTION IF EXISTS public.get_user_rank(UUID, TEXT) CASCADE;
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
    ELSE -- streak
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

GRANT EXECUTE ON FUNCTION public.get_user_rank TO authenticated;

-- 3.6 User Preferences Functions
DROP FUNCTION IF EXISTS public.handle_new_user_preferences() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();

DROP FUNCTION IF EXISTS public.update_user_preferences_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_preferences_updated_at();

-- 3.7 Additional functions that may exist (safe to run even if not present)
-- update_updated_at_column (alias for handle_updated_at)
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- get_investigation_stats (drop all overloads first)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT oid::regprocedure as func_sig
        FROM pg_proc
        WHERE proname = 'get_investigation_stats'
        AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_sig || ' CASCADE';
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.get_investigation_stats()
RETURNS TABLE (
    total_investigations BIGINT,
    completed_investigations BIGINT,
    active_investigations BIGINT,
    avg_agents_used NUMERIC
)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_investigations,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_investigations,
        COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active_investigations,
        AVG(array_length(agents_used, 1))::NUMERIC as avg_agents_used
    FROM public.investigations;
END;
$$;

-- get_anomaly_stats (drop all overloads first)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT oid::regprocedure as func_sig
        FROM pg_proc
        WHERE proname = 'get_anomaly_stats'
        AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_sig || ' CASCADE';
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.get_anomaly_stats()
RETURNS TABLE (
    total_anomalies BIGINT,
    anomalies_today BIGINT,
    anomalies_this_week BIGINT,
    most_common_source TEXT
)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_anomalies,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as anomalies_today,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as anomalies_this_week,
        (SELECT element_clicked FROM public.usability_events
         WHERE event_type = 'anomaly_detected'
         GROUP BY element_clicked
         ORDER BY COUNT(*) DESC
         LIMIT 1) as most_common_source
    FROM public.usability_events
    WHERE event_type = 'anomaly_detected';
END;
$$;

-- ============================================================================
-- SECTION 4: COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.calculate_rank IS 'Calculate user rank based on XP - secure search_path';
COMMENT ON FUNCTION public.calculate_level IS 'Calculate user level based on XP - secure search_path';
COMMENT ON FUNCTION public.update_rank_and_level IS 'Trigger function to auto-update rank and level - secure search_path';
COMMENT ON FUNCTION public.update_updated_at IS 'Generic trigger function to update updated_at timestamp - secure search_path';
COMMENT ON FUNCTION public.handle_updated_at IS 'Trigger function for chat tables updated_at - secure search_path';
COMMENT ON FUNCTION public.get_agora_leaderboard IS 'Get top N users sorted by XP, time, or streak - secure search_path';
COMMENT ON FUNCTION public.get_user_rank IS 'Get specific user rank position - secure search_path';
COMMENT ON FUNCTION public.user_has_badge IS 'Check if user has a specific badge - secure search_path';
COMMENT ON FUNCTION public.award_badge IS 'Award a badge to a user - secure search_path';
COMMENT ON FUNCTION public.get_session_journey IS 'Get all events for a session - secure search_path';
COMMENT ON FUNCTION public.handle_new_user_preferences IS 'Auto-create preferences for new users - secure search_path';
COMMENT ON FUNCTION public.update_user_preferences_updated_at IS 'Update timestamp on preferences change - secure search_path';
COMMENT ON FUNCTION public.update_survey_response_updated_at IS 'Update timestamp on survey response change - secure search_path';
-- Use full function signature for comments to avoid ambiguity
COMMENT ON FUNCTION public.get_investigation_stats() IS 'Get investigation statistics - secure search_path';
COMMENT ON FUNCTION public.get_anomaly_stats() IS 'Get anomaly detection statistics - secure search_path';
COMMENT ON FUNCTION public.update_updated_at_column IS 'Alias for handle_updated_at - secure search_path';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Expected results after applying this migration:
-- 1. agora_videos, agora_required_readings, agora_events have RLS enabled
-- 2. All 10 views recreated without SECURITY DEFINER
-- 3. All 16+ functions now have SET search_path = ''
-- 4. Functions that need SECURITY DEFINER (badge, leaderboard) retain it with secure search_path
-- ============================================================================
