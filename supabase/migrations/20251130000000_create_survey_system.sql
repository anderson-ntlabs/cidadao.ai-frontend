-- Migration: Create Survey and Badge System
-- Author: Anderson Henrique da Silva
-- Date: 2025-11-30
-- Purpose: Store UX survey responses and user achievement badges for gamification

-- ============================================
-- TABLE: user_badges
-- Stores permanent achievement badges earned by users
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Badge information
  badge_type VARCHAR(50) NOT NULL DEFAULT 'colaborador',

  -- Timestamps
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Source tracking
  source_type VARCHAR(50) DEFAULT 'survey',
  source_id VARCHAR(100),

  -- Metadata for extensibility
  metadata JSONB DEFAULT '{}',

  -- Constraints
  CONSTRAINT badge_type_check CHECK (badge_type IN (
    'colaborador',   -- UX Survey completion badge
    'pioneiro',      -- Early adopter badge (future)
    'especialista',  -- Power user badge (future)
    'guardiao'       -- Heavy investigation user (future)
  )),

  CONSTRAINT source_type_check CHECK (source_type IN (
    'survey',
    'achievement',
    'admin',
    'system'
  )),

  -- Unique constraint: one badge type per user
  CONSTRAINT unique_user_badge UNIQUE(user_id, badge_type)
);

-- ============================================
-- TABLE: survey_responses
-- Stores user survey answers and completion status
-- ============================================
CREATE TABLE IF NOT EXISTS survey_responses (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Survey identification
  survey_version VARCHAR(20) DEFAULT 'v1',

  -- Survey answers as JSONB for flexibility
  -- Format: { "q1": 8, "q2": 5, "q3": 4, "q4": 5, "q5": ["chat", "agents"], ... }
  answers JSONB NOT NULL DEFAULT '{}',

  -- Progress tracking
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 9,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Status flags
  badge_awarded BOOLEAN DEFAULT FALSE,

  -- Device/context metadata
  metadata JSONB DEFAULT '{}',

  -- Unique constraint: one response per user per survey version
  CONSTRAINT unique_user_survey UNIQUE(user_id, survey_version)
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed ON survey_responses(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_survey_responses_version ON survey_responses(survey_version);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Badges: Anyone can view all badges (for public profiles)
CREATE POLICY "Anyone can view badges"
  ON user_badges
  FOR SELECT
  USING (true);

-- Badges: Users can only insert their own badges
CREATE POLICY "Users can insert own badges"
  ON user_badges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Survey responses: Users can only view their own responses
CREATE POLICY "Users can view own survey responses"
  ON survey_responses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Survey responses: Users can create their own responses
CREATE POLICY "Users can create own survey responses"
  ON survey_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Survey responses: Users can update their own responses
CREATE POLICY "Users can update own survey responses"
  ON survey_responses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_survey_response_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_survey_response_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_survey_response_updated_at();

-- ============================================
-- FUNCTION: Check if user has specific badge
-- ============================================
CREATE OR REPLACE FUNCTION user_has_badge(p_user_id UUID, p_badge_type VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_badges
    WHERE user_id = p_user_id
    AND badge_type = p_badge_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Award badge to user (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id UUID,
  p_badge_type VARCHAR,
  p_source_type VARCHAR DEFAULT 'survey',
  p_source_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_inserted BOOLEAN;
BEGIN
  -- Try to insert badge, ignore if already exists
  INSERT INTO user_badges (user_id, badge_type, source_type, source_id)
  VALUES (p_user_id, p_badge_type, p_source_type, p_source_id)
  ON CONFLICT (user_id, badge_type) DO NOTHING
  RETURNING TRUE INTO v_inserted;

  RETURN COALESCE(v_inserted, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS for documentation
-- ============================================
COMMENT ON TABLE user_badges IS 'Stores permanent achievement badges earned by users for gamification';
COMMENT ON TABLE survey_responses IS 'Stores user experience survey responses with progress tracking';

COMMENT ON COLUMN user_badges.badge_type IS 'Type of badge: colaborador (survey), pioneiro (early adopter), etc.';
COMMENT ON COLUMN user_badges.source_type IS 'How the badge was earned: survey, achievement, admin, system';

COMMENT ON COLUMN survey_responses.answers IS 'JSONB storing answers keyed by question ID';
COMMENT ON COLUMN survey_responses.current_step IS 'Current progress step (0-indexed)';
COMMENT ON COLUMN survey_responses.metadata IS 'Device info, browser, timing data for analytics';

COMMENT ON FUNCTION user_has_badge IS 'Check if a user has earned a specific badge type';
COMMENT ON FUNCTION award_badge IS 'Award a badge to a user, returns FALSE if already owned';
