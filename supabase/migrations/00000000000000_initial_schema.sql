-- ============================================================================
-- CIDADAO.AI - CONSOLIDATED DATABASE SCHEMA
-- Version: 1.0.0
-- Date: December 2025
-- Author: Anderson Henrique da Silva
-- 
-- This migration consolidates all database objects for the Cidadao.AI platform
-- organized into logical sections for maintainability.
-- ============================================================================

-- ============================================================================
-- SECTION 0: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ============================================================================
-- SECTION 1: UTILITY FUNCTIONS (Consolidated)
-- All functions use SET search_path = '' for security
-- ============================================================================

-- 1.1 Generic updated_at trigger function
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

COMMENT ON FUNCTION public.handle_updated_at() IS 'Generic trigger to update updated_at timestamp';

-- 1.2 Badge functions
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

-- 1.3 Analytics functions
CREATE OR REPLACE FUNCTION public.get_session_journey(p_session_id VARCHAR)
RETURNS TABLE (
  event_time TIMESTAMPTZ,
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
  SELECT ue.created_at, ue.event_type, ue.page_path, ue.element_clicked, ue.agent_used, ue.duration_ms
  FROM public.usability_events ue
  WHERE ue.session_id = p_session_id AND ue.has_research_consent = true
  ORDER BY ue.created_at ASC;
END;
$$;

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
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT,
    AVG(array_length(agents_used, 1))::NUMERIC
  FROM public.investigations;
END;
$$;

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
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT,
    (SELECT element_clicked FROM public.usability_events
     WHERE event_type = 'anomaly_detected'
     GROUP BY element_clicked ORDER BY COUNT(*) DESC LIMIT 1)
  FROM public.usability_events WHERE event_type = 'anomaly_detected';
END;
$$;

-- 1.4 User preferences auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SECTION 2: CORE PLATFORM TABLES
-- ============================================================================

-- 2.1 User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'pt' CHECK (language IN ('pt', 'en')),
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 User Activities
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('chat', 'investigation', 'search', 'export', 'login', 'logout', 'settings', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL DEFAULT 'colaborador' CHECK (badge_type IN ('colaborador', 'pioneiro', 'especialista', 'guardiao')),
    earned_at TIMESTAMPTZ DEFAULT now(),
    source_type VARCHAR(50) DEFAULT 'survey' CHECK (source_type IN ('survey', 'achievement', 'admin', 'system')),
    source_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, badge_type)
);

COMMENT ON TABLE public.user_badges IS 'Achievement badges for gamification';

-- 2.4 Survey Responses
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    survey_version VARCHAR(20) DEFAULT 'v1',
    answers JSONB NOT NULL DEFAULT '{}',
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 9,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    badge_awarded BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, survey_version)
);

-- 2.5 Usability Events (Analytics)
CREATE TABLE IF NOT EXISTS public.usability_events (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view', 'navigation', 'click', 'chat_interaction', 'agent_selected', 'investigation_started', 'investigation_completed', 'export_data', 'accessibility_toggle', 'time_on_page', 'error', 'anomaly_detected')),
    event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('navigation', 'interaction', 'performance', 'accessibility', 'error', 'investigation')),
    session_id VARCHAR(100) NOT NULL,
    user_hash VARCHAR(64),
    page_path VARCHAR(255),
    element_clicked VARCHAR(100),
    agent_used VARCHAR(50),
    interaction_type VARCHAR(50),
    duration_ms INTEGER,
    time_on_page INTEGER,
    steps_taken INTEGER,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser VARCHAR(50),
    screen_width INTEGER,
    screen_height INTEGER,
    is_demo_mode BOOLEAN DEFAULT false,
    is_authenticated BOOLEAN DEFAULT false,
    has_research_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.usability_events IS 'Anonymized usability analytics (LGPD compliant)';

-- ============================================================================
-- SECTION 3: INVESTIGATIONS & CHAT SYSTEM
-- ============================================================================

-- 3.1 Investigations
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    query TEXT NOT NULL,
    data_source VARCHAR(100) NOT NULL CHECK (data_source IN ('contracts', 'expenses', 'agreements', 'biddings', 'servants')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    current_phase VARCHAR(100),
    progress FLOAT DEFAULT 0.0 CHECK (progress >= 0.0 AND progress <= 1.0),
    anomalies_found INTEGER DEFAULT 0,
    total_records_analyzed INTEGER DEFAULT 0,
    confidence_score FLOAT CHECK (confidence_score IS NULL OR (confidence_score >= 0.0 AND confidence_score <= 1.0)),
    filters JSONB DEFAULT '{}',
    anomaly_types JSONB DEFAULT '[]',
    results JSONB DEFAULT '[]',
    investigation_metadata JSONB DEFAULT '{}',
    summary TEXT,
    error_message TEXT,
    agents_used TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER
);

COMMENT ON TABLE public.investigations IS 'User investigations for transparency research';

-- 3.2 Auto Investigations
CREATE TABLE IF NOT EXISTS public.auto_investigations (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    query TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    initiated_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    results JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 3.3 Anomalies
CREATE TABLE IF NOT EXISTS public.anomalies (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    investigation_id UUID REFERENCES public.investigations(id) ON DELETE CASCADE,
    auto_investigation_id UUID REFERENCES public.auto_investigations(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    source_id VARCHAR(255),
    anomaly_type VARCHAR(100) NOT NULL,
    anomaly_score NUMERIC(5,4) NOT NULL CHECK (anomaly_score >= 0 AND anomaly_score <= 1),
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT,
    indicators JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    contract_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'detected' CHECK (status IN ('detected', 'under_review', 'confirmed', 'false_positive', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT has_investigation_link CHECK (investigation_id IS NOT NULL OR auto_investigation_id IS NOT NULL)
);

-- 3.4 Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    anomaly_id UUID NOT NULL REFERENCES public.anomalies(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('email', 'webhook', 'dashboard', 'sms')),
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipients JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'acknowledged')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.5 Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(100) NOT NULL,
    investigation_id UUID REFERENCES public.investigations(id) ON DELETE SET NULL,
    auto_investigation_id UUID REFERENCES public.auto_investigations(id) ON DELETE SET NULL,
    anomaly_id UUID REFERENCES public.anomalies(id) ON DELETE SET NULL,
    event_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.6 Chat Sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES public.investigations(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    session_id TEXT NOT NULL UNIQUE,
    messages JSONB DEFAULT '[]',
    session_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.chat_sessions IS 'Chat sessions linked to investigations';

-- 3.7 Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    agent_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.8 Katana Dispensas (Government Data)
CREATE TABLE IF NOT EXISTS public.katana_dispensas (
    id VARCHAR(255) PRIMARY KEY,
    numero VARCHAR(255),
    objeto TEXT,
    valor NUMERIC(15,2),
    fornecedor_nome VARCHAR(500),
    fornecedor_cnpj VARCHAR(20),
    raw_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 4: AGORA LEARNING PLATFORM
-- ============================================================================

-- 4.1 Agora Gamification Functions
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

CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    RETURN GREATEST(1, (xp / 100) + 1);
END;
$$;

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

-- 4.2 Agora Leaderboard Functions
CREATE OR REPLACE FUNCTION public.get_agora_leaderboard(sort_by TEXT DEFAULT 'xp', limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID, user_id UUID, full_name TEXT, avatar_url TEXT,
    total_xp INTEGER, current_level INTEGER, current_rank TEXT,
    current_streak INTEGER, total_time_minutes INTEGER, rank_position BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF sort_by = 'xp' THEN
        RETURN QUERY SELECT p.id, p.user_id, p.full_name, p.avatar_url, p.total_xp, p.current_level, p.current_rank, p.current_streak, p.total_time_minutes, ROW_NUMBER() OVER (ORDER BY p.total_xp DESC)
        FROM public.agora_profiles p WHERE p.is_active = TRUE ORDER BY p.total_xp DESC LIMIT limit_count;
    ELSIF sort_by = 'time' THEN
        RETURN QUERY SELECT p.id, p.user_id, p.full_name, p.avatar_url, p.total_xp, p.current_level, p.current_rank, p.current_streak, p.total_time_minutes, ROW_NUMBER() OVER (ORDER BY p.total_time_minutes DESC)
        FROM public.agora_profiles p WHERE p.is_active = TRUE ORDER BY p.total_time_minutes DESC LIMIT limit_count;
    ELSE
        RETURN QUERY SELECT p.id, p.user_id, p.full_name, p.avatar_url, p.total_xp, p.current_level, p.current_rank, p.current_streak, p.total_time_minutes, ROW_NUMBER() OVER (ORDER BY p.current_streak DESC)
        FROM public.agora_profiles p WHERE p.is_active = TRUE ORDER BY p.current_streak DESC LIMIT limit_count;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID, sort_by TEXT DEFAULT 'xp')
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE user_rank INTEGER;
BEGIN
    IF sort_by = 'xp' THEN
        SELECT rp INTO user_rank FROM (SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) AS rp FROM public.agora_profiles WHERE is_active = TRUE) ranked WHERE ranked.user_id = p_user_id;
    ELSIF sort_by = 'time' THEN
        SELECT rp INTO user_rank FROM (SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_time_minutes DESC) AS rp FROM public.agora_profiles WHERE is_active = TRUE) ranked WHERE ranked.user_id = p_user_id;
    ELSE
        SELECT rp INTO user_rank FROM (SELECT user_id, ROW_NUMBER() OVER (ORDER BY current_streak DESC) AS rp FROM public.agora_profiles WHERE is_active = TRUE) ranked WHERE ranked.user_id = p_user_id;
    END IF;
    RETURN COALESCE(user_rank, 0);
END;
$$;

-- 4.3 Agora Profiles
CREATE TABLE IF NOT EXISTS public.agora_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    github_username TEXT,
    matricula TEXT,
    curso TEXT DEFAULT 'Ciência da Computação',
    periodo INTEGER,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_rank TEXT DEFAULT 'novato',
    main_track TEXT DEFAULT 'backend',
    badges JSONB DEFAULT '[]',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_sessions INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    total_missions_completed INTEGER DEFAULT 0,
    total_articles_read INTEGER DEFAULT 0,
    total_videos_completed INTEGER DEFAULT 0,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    program_start_date DATE,
    program_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    program_status TEXT DEFAULT 'enrolled',
    is_superuser BOOLEAN DEFAULT false,
    has_completed_onboarding BOOLEAN DEFAULT false,
    has_accepted_terms BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    tracks TEXT[] DEFAULT '{}',
    github_fork_verified BOOLEAN DEFAULT false,
    github_fork_url TEXT,
    last_session_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.agora_profiles IS 'Agora learning platform user profiles with gamification';

-- 4.4 Agora Consent (LGPD)
CREATE TABLE IF NOT EXISTS public.agora_consent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_version TEXT NOT NULL DEFAULT 'v1.0',
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    tracking_consent BOOLEAN DEFAULT true,
    data_processing_consent BOOLEAN DEFAULT true,
    certificate_consent BOOLEAN DEFAULT true,
    consent_text_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, consent_version)
);

COMMENT ON TABLE public.agora_consent IS 'LGPD consent records';

-- 4.5 Agora Sessions
CREATE TABLE IF NOT EXISTS public.agora_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 0,
    videos_watched JSONB DEFAULT '[]',
    conversations JSONB DEFAULT '[]',
    missions_worked JSONB DEFAULT '[]',
    articles_read JSONB DEFAULT '[]',
    xp_earned INTEGER DEFAULT 0,
    badges_earned JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active',
    posthog_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4.6 Agora XP Transactions
CREATE TABLE IF NOT EXISTS public.agora_xp_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.7 Agora Diary Entries
CREATE TABLE IF NOT EXISTS public.agora_diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.agora_sessions(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    mood TEXT,
    topics_learned JSONB DEFAULT '[]',
    questions JSONB DEFAULT '[]',
    what_learned TEXT,
    what_struggled TEXT,
    next_steps TEXT,
    session_duration_minutes INTEGER,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4.8 Agora Videos
CREATE TABLE IF NOT EXISTS public.agora_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER NOT NULL,
    category TEXT NOT NULL,
    track TEXT,
    difficulty TEXT DEFAULT 'beginner',
    order_index INTEGER DEFAULT 0,
    agent_name TEXT,
    is_active BOOLEAN DEFAULT true,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.9 Agora Video Progress
CREATE TABLE IF NOT EXISTS public.agora_video_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.agora_videos(id) ON DELETE CASCADE,
    watched_seconds INTEGER DEFAULT 0,
    total_seconds INTEGER NOT NULL,
    progress_percentage NUMERIC(5,2) DEFAULT 0,
    status TEXT DEFAULT 'not_started',
    completed_at TIMESTAMPTZ,
    xp_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, video_id)
);

-- 4.10 Agora Required Readings
CREATE TABLE IF NOT EXISTS public.agora_required_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    article_type TEXT DEFAULT 'paper',
    track TEXT,
    difficulty TEXT DEFAULT 'beginner',
    estimated_time_minutes INTEGER DEFAULT 30,
    week_number INTEGER,
    is_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.11 Agora Reading Progress
CREATE TABLE IF NOT EXISTS public.agora_reading_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reading_id UUID NOT NULL REFERENCES public.agora_required_readings(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    confirmed_read BOOLEAN DEFAULT false,
    confirmation_date TIMESTAMPTZ,
    notes TEXT,
    rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, reading_id)
);

-- 4.12 Agora Events (Calendar)
CREATE TABLE IF NOT EXISTS public.agora_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    is_public BOOLEAN DEFAULT true,
    track TEXT,
    ics_uid TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.13 Agora Calendar Events (Personal)
CREATE TABLE IF NOT EXISTS public.agora_calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    event_type TEXT NOT NULL CHECK (event_type IN ('study', 'reading', 'video', 'chat', 'deadline')),
    description TEXT,
    xp_reward INTEGER DEFAULT 10,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4.14 Agora Certificates
CREATE TABLE IF NOT EXISTS public.agora_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    certificate_type TEXT DEFAULT 'completion',
    program_start_date DATE NOT NULL,
    program_end_date DATE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    total_hours NUMERIC(10,2) NOT NULL,
    total_xp INTEGER NOT NULL,
    final_rank TEXT NOT NULL,
    final_level INTEGER NOT NULL,
    missions_completed INTEGER DEFAULT 0,
    articles_read INTEGER DEFAULT 0,
    conversations_count INTEGER DEFAULT 0,
    final_position INTEGER,
    total_participants INTEGER,
    badges JSONB DEFAULT '[]',
    verification_hash TEXT NOT NULL,
    verification_url TEXT,
    qr_code_url TEXT,
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 5: ANALYTICS VIEWS (security_invoker = true)
-- ============================================================================

CREATE OR REPLACE VIEW public.daily_event_summary WITH (security_invoker = true) AS
SELECT DATE(created_at) as date, event_type, event_category,
    COUNT(*) as event_count, COUNT(DISTINCT session_id) as unique_sessions,
    AVG(duration_ms) as avg_duration,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as median_duration,
    COUNT(*) FILTER (WHERE is_authenticated) as authenticated_events,
    COUNT(*) FILTER (WHERE is_demo_mode) as demo_mode_events
FROM public.usability_events WHERE has_research_consent = true
GROUP BY DATE(created_at), event_type, event_category ORDER BY date DESC, event_count DESC;

CREATE OR REPLACE VIEW public.agent_usage_stats WITH (security_invoker = true) AS
SELECT agent_used, COUNT(*) as total_uses, AVG(duration_ms) as avg_interaction_time,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_hash) FILTER (WHERE user_hash IS NOT NULL) as unique_users,
    SUM(CASE WHEN event_type = 'investigation_completed' THEN 1 ELSE 0 END) as investigations_completed,
    AVG(steps_taken) FILTER (WHERE steps_taken IS NOT NULL) as avg_steps
FROM public.usability_events WHERE agent_used IS NOT NULL AND has_research_consent = true
GROUP BY agent_used ORDER BY total_uses DESC;

CREATE OR REPLACE VIEW public.device_browser_stats WITH (security_invoker = true) AS
SELECT device_type, browser, COUNT(*) as event_count, COUNT(DISTINCT session_id) as unique_sessions,
    AVG(screen_width) as avg_screen_width, AVG(screen_height) as avg_screen_height
FROM public.usability_events WHERE has_research_consent = true
GROUP BY device_type, browser ORDER BY event_count DESC;

CREATE OR REPLACE VIEW public.accessibility_usage WITH (security_invoker = true) AS
SELECT interaction_type as feature, COUNT(*) as usage_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_hash) FILTER (WHERE user_hash IS NOT NULL) as unique_users
FROM public.usability_events WHERE event_type = 'accessibility_toggle' AND has_research_consent = true
GROUP BY interaction_type ORDER BY usage_count DESC;

CREATE OR REPLACE VIEW public.performance_metrics WITH (security_invoker = true) AS
SELECT event_type, COUNT(*) as total_events, AVG(duration_ms) as avg_duration_ms,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50_duration,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_duration,
    MAX(duration_ms) as max_duration
FROM public.usability_events WHERE duration_ms IS NOT NULL AND has_research_consent = true
GROUP BY event_type ORDER BY total_events DESC;

CREATE OR REPLACE VIEW public.investigation_summaries WITH (security_invoker = true) AS
SELECT session_id, MIN(created_at) as started_at, MAX(created_at) as completed_at,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) * 1000 as duration_ms,
    COUNT(*) as steps_taken, MAX(agent_used) as primary_agent,
    bool_or(event_type = 'investigation_completed') as was_completed
FROM public.usability_events WHERE event_category = 'investigation' AND has_research_consent = true
GROUP BY session_id ORDER BY started_at DESC;

CREATE OR REPLACE VIEW public.high_severity_anomalies WITH (security_invoker = true) AS
SELECT created_at, session_id, agent_used, page_path, duration_ms
FROM public.usability_events WHERE event_type = 'anomaly_detected' AND has_research_consent = true
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW public.auto_investigation_summary WITH (security_invoker = true) AS
SELECT DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event_type = 'investigation_started') as investigations_started,
    COUNT(*) FILTER (WHERE event_type = 'investigation_completed') as investigations_completed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE event_type = 'investigation_completed') / NULLIF(COUNT(*) FILTER (WHERE event_type = 'investigation_started'), 0), 2) as completion_rate,
    AVG(duration_ms) FILTER (WHERE event_type = 'investigation_completed') as avg_completion_time
FROM public.usability_events WHERE event_category = 'investigation' AND has_research_consent = true
GROUP BY DATE(created_at) ORDER BY date DESC;

CREATE OR REPLACE VIEW public.anomaly_stats_by_source WITH (security_invoker = true) AS
SELECT element_clicked as anomaly_source, COUNT(*) as anomaly_count,
    COUNT(DISTINCT session_id) as affected_sessions, AVG(duration_ms) as avg_detection_time
FROM public.usability_events WHERE event_type = 'anomaly_detected' AND has_research_consent = true AND element_clicked IS NOT NULL
GROUP BY element_clicked ORDER BY anomaly_count DESC;

CREATE OR REPLACE VIEW public.agora_leaderboard WITH (security_invoker = true) AS
SELECT id, user_id, full_name, avatar_url, total_xp, current_level, current_rank,
    current_streak, total_time_minutes, total_sessions, is_active
FROM public.agora_profiles WHERE is_active = true ORDER BY total_xp DESC;


-- ============================================================================
-- SECTION 6: INDEXES
-- ============================================================================

-- 6.1 Core Platform Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON public.user_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON public.user_badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON public.survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_version ON public.survey_responses(survey_version);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed ON public.survey_responses(completed_at) WHERE completed_at IS NOT NULL;

-- 6.2 Usability Events Indexes
CREATE INDEX IF NOT EXISTS idx_events_type ON public.usability_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.usability_events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_session ON public.usability_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.usability_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_consent ON public.usability_events(has_research_consent);
CREATE INDEX IF NOT EXISTS idx_events_user_hash ON public.usability_events(user_hash);
CREATE INDEX IF NOT EXISTS idx_events_date_type ON public.usability_events(created_at DESC, event_type);
CREATE INDEX IF NOT EXISTS idx_events_session_date ON public.usability_events(session_id, created_at DESC);

-- 6.3 Investigation Indexes
CREATE INDEX IF NOT EXISTS idx_investigations_user_id ON public.investigations(user_id);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON public.investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_user_created ON public.investigations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_user_status ON public.investigations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_investigations_session_id ON public.investigations(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_investigations_filters ON public.investigations USING gin(filters);
CREATE INDEX IF NOT EXISTS idx_investigations_results ON public.investigations USING gin(results);

-- 6.4 Anomaly & Alert Indexes
CREATE INDEX IF NOT EXISTS idx_anomalies_status ON public.anomalies(status);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON public.anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_anomalies_source ON public.anomalies(source);
CREATE INDEX IF NOT EXISTS idx_anomalies_score ON public.anomalies(anomaly_score DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_created_at ON public.anomalies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_investigation_id ON public.anomalies(investigation_id) WHERE investigation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_anomalies_auto_investigation_id ON public.anomalies(auto_investigation_id) WHERE auto_investigation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_anomalies_contract_data ON public.anomalies USING gin(contract_data);
CREATE INDEX IF NOT EXISTS idx_anomalies_indicators ON public.anomalies USING gin(indicators);
CREATE INDEX IF NOT EXISTS idx_alerts_anomaly_id ON public.alerts(anomaly_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_alert_type ON public.alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);

-- 6.5 Audit & Auto Investigation Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_source ON public.audit_logs(event_source);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_investigation_id ON public.audit_logs(investigation_id) WHERE investigation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_auto_investigation_id ON public.audit_logs(auto_investigation_id) WHERE auto_investigation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_anomaly_id ON public.audit_logs(anomaly_id) WHERE anomaly_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auto_investigations_status ON public.auto_investigations(status);
CREATE INDEX IF NOT EXISTS idx_auto_investigations_initiated_by ON public.auto_investigations(initiated_by);
CREATE INDEX IF NOT EXISTS idx_auto_investigations_created_at ON public.auto_investigations(created_at DESC);

-- 6.6 Chat Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_id ON public.chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_investigation_id ON public.chat_sessions(investigation_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_agent_id ON public.chat_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- 6.7 Katana Indexes
CREATE INDEX IF NOT EXISTS idx_katana_dispensas_numero ON public.katana_dispensas(numero);
CREATE INDEX IF NOT EXISTS idx_katana_dispensas_fornecedor_cnpj ON public.katana_dispensas(fornecedor_cnpj);
CREATE INDEX IF NOT EXISTS idx_katana_dispensas_valor ON public.katana_dispensas(valor DESC);
CREATE INDEX IF NOT EXISTS idx_katana_dispensas_created_at ON public.katana_dispensas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_katana_dispensas_raw_data ON public.katana_dispensas USING gin(raw_data);

-- 6.8 Agora Indexes
CREATE INDEX IF NOT EXISTS idx_agora_profiles_user_id ON public.agora_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_profiles_email ON public.agora_profiles(email);
CREATE INDEX IF NOT EXISTS idx_agora_profiles_xp ON public.agora_profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_agora_profiles_rank ON public.agora_profiles(current_rank);
CREATE INDEX IF NOT EXISTS idx_agora_profiles_superuser ON public.agora_profiles(is_superuser) WHERE is_superuser = true;
CREATE INDEX IF NOT EXISTS idx_agora_consent_user_id ON public.agora_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_sessions_user_id ON public.agora_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_sessions_date ON public.agora_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_agora_sessions_status ON public.agora_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agora_xp_user_id ON public.agora_xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_xp_created ON public.agora_xp_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_agora_diary_user_id ON public.agora_diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_diary_date ON public.agora_diary_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_agora_video_progress_user_id ON public.agora_video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_reading_progress_user_id ON public.agora_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_calendar_events_user_id ON public.agora_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_calendar_events_start_time ON public.agora_calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_agora_calendar_events_user_start ON public.agora_calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_agora_certificates_user ON public.agora_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_certificates_number ON public.agora_certificates(certificate_number);

-- ============================================================================
-- SECTION 7: TRIGGERS
-- ============================================================================

-- 7.1 Updated at triggers
CREATE OR REPLACE TRIGGER set_investigations_updated_at
    BEFORE UPDATE ON public.investigations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_profiles_updated
    BEFORE UPDATE ON public.agora_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_sessions_updated
    BEFORE UPDATE ON public.agora_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_survey_response_updated_at
    BEFORE UPDATE ON public.survey_responses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7.2 Agora rank/level auto-update trigger
CREATE OR REPLACE TRIGGER trigger_update_rank_level
    BEFORE UPDATE OF total_xp ON public.agora_profiles FOR EACH ROW EXECUTE FUNCTION public.update_rank_and_level();

-- 7.3 Auto-create user preferences on signup
CREATE OR REPLACE TRIGGER on_auth_user_created_preferences
    AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

-- ============================================================================
-- SECTION 8: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usability_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.katana_dispensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_required_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 9: RLS POLICIES
-- ============================================================================

-- 9.1 User Preferences Policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

-- 9.2 User Activities Policies
CREATE POLICY "Users can view their own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activities" ON public.user_activities FOR DELETE USING (auth.uid() = user_id);

-- 9.3 User Badges Policies
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9.4 Survey Responses Policies
CREATE POLICY "Users can view own survey responses" ON public.survey_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own survey responses" ON public.survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own survey responses" ON public.survey_responses FOR UPDATE USING (auth.uid() = user_id);

-- 9.5 Usability Events Policies
CREATE POLICY "App can insert events" ON public.usability_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read events" ON public.usability_events FOR SELECT USING ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY "Users can read own events" ON public.usability_events FOR SELECT USING (user_hash IS NOT NULL AND user_hash = encode(extensions.digest(auth.uid()::text, 'sha256'), 'hex'));

-- 9.6 Investigations Policies
CREATE POLICY "Users can view own investigations" ON public.investigations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create investigations" ON public.investigations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investigations" ON public.investigations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own investigations" ON public.investigations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all investigations" ON public.investigations USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 9.7 Anomalies & Alerts Policies
CREATE POLICY "Users can view anomalies from their investigations" ON public.anomalies FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.investigations i WHERE i.id = anomalies.investigation_id AND i.user_id = auth.uid())
    OR auth.role() = 'service_role'
);
CREATE POLICY "Service role can manage anomalies" ON public.anomalies USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Users can view alerts from their anomalies" ON public.alerts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.anomalies a JOIN public.investigations i ON i.id = a.investigation_id WHERE a.id = alerts.anomaly_id AND i.user_id = auth.uid())
    OR auth.role() = 'service_role'
);
CREATE POLICY "Service role can manage alerts" ON public.alerts USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 9.8 Audit & Auto Investigation Policies
CREATE POLICY "Service role can manage audit_logs" ON public.audit_logs USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can manage auto_investigations" ON public.auto_investigations USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 9.9 Chat Policies
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own messages" ON public.chat_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- 9.10 Katana Policies
CREATE POLICY "Service role can manage katana_dispensas" ON public.katana_dispensas USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 9.11 Agora Profiles Policies
CREATE POLICY "Users can view own profile" ON public.agora_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view leaderboard" ON public.agora_profiles FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
CREATE POLICY "Users can insert own profile" ON public.agora_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.agora_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 9.12 Agora Consent Policies
CREATE POLICY "Users can view own consent" ON public.agora_consent FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consent" ON public.agora_consent FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consent" ON public.agora_consent FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9.13 Agora Sessions & XP Policies
CREATE POLICY "Users can view own sessions" ON public.agora_sessions USING (auth.uid() = user_id);
CREATE POLICY "Users can view own xp transactions" ON public.agora_xp_transactions FOR SELECT USING (auth.uid() = user_id);

-- 9.14 Agora Content Policies
CREATE POLICY "Users can manage own diary" ON public.agora_diary_entries USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view videos" ON public.agora_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own video progress" ON public.agora_video_progress USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view readings" ON public.agora_required_readings FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own reading progress" ON public.agora_reading_progress USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view events" ON public.agora_events FOR SELECT USING (is_public = true);

-- 9.15 Agora Calendar & Certificates Policies
CREATE POLICY "Users can view own calendar events" ON public.agora_calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar events" ON public.agora_calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar events" ON public.agora_calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar events" ON public.agora_calendar_events FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own certificates" ON public.agora_certificates FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 10: GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- SECTION 11: SEED DATA (Superuser)
-- ============================================================================

-- Set Anderson as superuser (if profile exists)
UPDATE public.agora_profiles 
SET is_superuser = true 
WHERE email = 'anderson-ufrj@ufrj.br' OR email LIKE '%anderson%';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables: 25
-- Views: 10
-- Functions: 12
-- Indexes: 80+
-- RLS Policies: 50+
-- ============================================================================
