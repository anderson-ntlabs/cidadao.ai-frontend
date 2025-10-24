-- Migration: Create Usability Events Table
-- Author: Anderson Henrique da Silva
-- Date: 2025-01-24
-- Purpose: Store anonymized usability analytics for research

-- Create usability_events table
CREATE TABLE IF NOT EXISTS usability_events (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event identification
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(50) NOT NULL,

  -- Anonymized user data
  session_id VARCHAR(100) NOT NULL,
  user_hash VARCHAR(64), -- SHA-256 hash if authenticated

  -- Event data
  page_path VARCHAR(255),
  element_clicked VARCHAR(100),
  agent_used VARCHAR(50),
  interaction_type VARCHAR(50),

  -- Performance metrics
  duration_ms INTEGER,
  time_on_page INTEGER,
  steps_taken INTEGER,

  -- Context
  device_type VARCHAR(20),
  browser VARCHAR(50),
  screen_width INTEGER,
  screen_height INTEGER,

  -- Flags
  is_demo_mode BOOLEAN DEFAULT false,
  is_authenticated BOOLEAN DEFAULT false,
  has_research_consent BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT event_type_check CHECK (event_type IN (
    'page_view',
    'navigation',
    'click',
    'chat_interaction',
    'agent_selected',
    'investigation_started',
    'investigation_completed',
    'export_data',
    'accessibility_toggle',
    'time_on_page',
    'error'
  )),

  CONSTRAINT event_category_check CHECK (event_category IN (
    'navigation',
    'interaction',
    'performance',
    'accessibility',
    'error'
  )),

  CONSTRAINT device_type_check CHECK (device_type IN (
    'mobile',
    'tablet',
    'desktop'
  ))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_created_at ON usability_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON usability_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_category ON usability_events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_session ON usability_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_user_hash ON usability_events(user_hash);
CREATE INDEX IF NOT EXISTS idx_events_consent ON usability_events(has_research_consent);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_date_type ON usability_events(created_at DESC, event_type);
CREATE INDEX IF NOT EXISTS idx_events_session_date ON usability_events(session_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE usability_events ENABLE ROW LEVEL SECURITY;

-- Policy: App can insert events
CREATE POLICY "App can insert events" ON usability_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users with admin role can read
CREATE POLICY "Admin can read events" ON usability_events
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy: Users can read their own anonymized events (via user_hash)
CREATE POLICY "Users can read own events" ON usability_events
  FOR SELECT
  USING (
    user_hash IS NOT NULL AND
    user_hash = encode(digest(auth.uid()::text, 'sha256'), 'hex')
  );

-- Create view: Daily Event Summary
CREATE OR REPLACE VIEW daily_event_summary AS
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

-- Create view: Agent Usage Statistics
CREATE OR REPLACE VIEW agent_usage_stats AS
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

-- Create view: Device and Browser Statistics
CREATE OR REPLACE VIEW device_browser_stats AS
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

-- Create view: Accessibility Feature Usage
CREATE OR REPLACE VIEW accessibility_usage AS
SELECT
  DATE(created_at) as date,
  interaction_type as feature,
  COUNT(*) as usage_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_hash) FILTER (WHERE user_hash IS NOT NULL) as unique_users
FROM usability_events
WHERE event_category = 'accessibility'
  AND has_research_consent = true
GROUP BY DATE(created_at), interaction_type
ORDER BY date DESC, usage_count DESC;

-- Create view: Performance Metrics
CREATE OR REPLACE VIEW performance_metrics AS
SELECT
  event_type,
  COUNT(*) as total_events,
  AVG(duration_ms) as avg_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as median_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms,
  MIN(duration_ms) as min_duration_ms,
  MAX(duration_ms) as max_duration_ms,
  AVG(steps_taken) as avg_steps
FROM usability_events
WHERE duration_ms IS NOT NULL
  AND has_research_consent = true
GROUP BY event_type
ORDER BY total_events DESC;

-- Create function: Get session journey
CREATE OR REPLACE FUNCTION get_session_journey(p_session_id VARCHAR)
RETURNS TABLE (
  event_time TIMESTAMP WITH TIME ZONE,
  event_type VARCHAR,
  page_path VARCHAR,
  element_clicked VARCHAR,
  agent_used VARCHAR,
  duration_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    created_at,
    usability_events.event_type,
    usability_events.page_path,
    usability_events.element_clicked,
    usability_events.agent_used,
    usability_events.duration_ms
  FROM usability_events
  WHERE session_id = p_session_id
    AND has_research_consent = true
  ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on views to authenticated users
GRANT SELECT ON daily_event_summary TO authenticated;
GRANT SELECT ON agent_usage_stats TO authenticated;
GRANT SELECT ON device_browser_stats TO authenticated;
GRANT SELECT ON accessibility_usage TO authenticated;
GRANT SELECT ON performance_metrics TO authenticated;

-- Add comment to table
COMMENT ON TABLE usability_events IS 'Anonymized usability analytics for research purposes. All data is LGPD compliant with user consent.';

-- Add comments to columns
COMMENT ON COLUMN usability_events.user_hash IS 'SHA-256 hash of user ID for anonymization';
COMMENT ON COLUMN usability_events.has_research_consent IS 'User explicitly consented to data collection for research';
COMMENT ON COLUMN usability_events.created_at IS 'Event timestamp in UTC';
