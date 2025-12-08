-- ============================================================================
-- CIDADAO.AI - FIX SECURITY DEFINER VIEWS
-- Explicitly removes SECURITY DEFINER from all analytics views
-- Date: December 2025
-- Author: Anderson Henrique da Silva
-- ============================================================================
--
-- ISSUE: CREATE OR REPLACE VIEW does not remove SECURITY DEFINER attribute
-- SOLUTION: Use ALTER VIEW to explicitly remove security_invoker or
--           DROP and CREATE without SECURITY DEFINER
-- ============================================================================

-- Method: DROP CASCADE then CREATE (not CREATE OR REPLACE)
-- This ensures the view is created fresh without any previous attributes

-- 1. daily_event_summary
DROP VIEW IF EXISTS public.daily_event_summary CASCADE;
CREATE VIEW public.daily_event_summary
WITH (security_invoker = true)
AS
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

-- 2. agent_usage_stats
DROP VIEW IF EXISTS public.agent_usage_stats CASCADE;
CREATE VIEW public.agent_usage_stats
WITH (security_invoker = true)
AS
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

-- 3. device_browser_stats
DROP VIEW IF EXISTS public.device_browser_stats CASCADE;
CREATE VIEW public.device_browser_stats
WITH (security_invoker = true)
AS
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

-- 4. accessibility_usage
DROP VIEW IF EXISTS public.accessibility_usage CASCADE;
CREATE VIEW public.accessibility_usage
WITH (security_invoker = true)
AS
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

-- 5. performance_metrics
DROP VIEW IF EXISTS public.performance_metrics CASCADE;
CREATE VIEW public.performance_metrics
WITH (security_invoker = true)
AS
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

-- 6. investigation_summaries
DROP VIEW IF EXISTS public.investigation_summaries CASCADE;
CREATE VIEW public.investigation_summaries
WITH (security_invoker = true)
AS
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

-- 7. high_severity_anomalies
DROP VIEW IF EXISTS public.high_severity_anomalies CASCADE;
CREATE VIEW public.high_severity_anomalies
WITH (security_invoker = true)
AS
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

-- 8. auto_investigation_summary
DROP VIEW IF EXISTS public.auto_investigation_summary CASCADE;
CREATE VIEW public.auto_investigation_summary
WITH (security_invoker = true)
AS
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

-- 9. anomaly_stats_by_source
DROP VIEW IF EXISTS public.anomaly_stats_by_source CASCADE;
CREATE VIEW public.anomaly_stats_by_source
WITH (security_invoker = true)
AS
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

-- 10. agora_leaderboard
DROP VIEW IF EXISTS public.agora_leaderboard CASCADE;
CREATE VIEW public.agora_leaderboard
WITH (security_invoker = true)
AS
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

-- Grant SELECT on all views to authenticated users
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
-- MIGRATION COMPLETE
-- All views now use security_invoker = true (opposite of SECURITY DEFINER)
-- This means queries will run with the permissions of the querying user
-- ============================================================================
