-- Migration: Remove SECURITY DEFINER from Analytics Views
-- Author: Anderson Henrique da Silva
-- Date: 2025-01-28
-- Purpose: Fix Supabase Database Linter warnings about SECURITY DEFINER views
--
-- CONTEXT:
-- Supabase Database Linter flags views with SECURITY DEFINER as potential
-- security risks. Since our analytics views:
-- 1. Only aggregate anonymized data
-- 2. Filter by research consent
-- 3. Are read-only
-- 4. Don't expose sensitive information
--
-- We can safely recreate them WITHOUT SECURITY DEFINER, relying instead
-- on the RLS policies of the underlying usability_events table.

-- Recreate daily_event_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS daily_event_summary;
CREATE VIEW daily_event_summary AS
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

-- Recreate agent_usage_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS agent_usage_stats;
CREATE VIEW agent_usage_stats AS
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

-- Recreate device_browser_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS device_browser_stats;
CREATE VIEW device_browser_stats AS
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

-- Recreate accessibility_usage view without SECURITY DEFINER
DROP VIEW IF EXISTS accessibility_usage;
CREATE VIEW accessibility_usage AS
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

-- Recreate performance_metrics view without SECURITY DEFINER
DROP VIEW IF EXISTS performance_metrics;
CREATE VIEW performance_metrics AS
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

-- Recreate investigation_summaries view without SECURITY DEFINER
DROP VIEW IF EXISTS investigation_summaries;
CREATE VIEW investigation_summaries AS
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

-- Recreate high_severity_anomalies view without SECURITY DEFINER
DROP VIEW IF EXISTS high_severity_anomalies;
CREATE VIEW high_severity_anomalies AS
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

-- Recreate auto_investigation_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS auto_investigation_summary;
CREATE VIEW auto_investigation_summary AS
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

-- Recreate anomaly_stats_by_source view without SECURITY DEFINER
DROP VIEW IF EXISTS anomaly_stats_by_source;
CREATE VIEW anomaly_stats_by_source AS
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

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON daily_event_summary TO authenticated;
GRANT SELECT ON agent_usage_stats TO authenticated;
GRANT SELECT ON device_browser_stats TO authenticated;
GRANT SELECT ON accessibility_usage TO authenticated;
GRANT SELECT ON performance_metrics TO authenticated;
GRANT SELECT ON investigation_summaries TO authenticated;
GRANT SELECT ON high_severity_anomalies TO authenticated;
GRANT SELECT ON auto_investigation_summary TO authenticated;
GRANT SELECT ON anomaly_stats_by_source TO authenticated;

-- Note: Views now rely on RLS policies of usability_events table
-- Users can only see aggregated data they have permission to access
