-- ============================================================================
-- CIDADAO.AI - RENAME ACADEMY TO AGORA
-- Migration to rebrand the Academy subsystem to Agora
-- Date: December 2025
-- Author: Anderson Henrique da Silva
-- ============================================================================

-- ============================================================================
-- 1. DROP DEPENDENT OBJECTS FIRST (views, functions, triggers)
-- ============================================================================

-- Drop the leaderboard view
DROP VIEW IF EXISTS academy_leaderboard CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_academy_leaderboard(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_rank(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS calculate_rank(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS calculate_level(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_rank_and_level() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- ============================================================================
-- 2. RENAME ALL TABLES
-- ============================================================================

ALTER TABLE IF EXISTS academy_profiles RENAME TO agora_profiles;
ALTER TABLE IF EXISTS academy_consent RENAME TO agora_consent;
ALTER TABLE IF EXISTS academy_sessions RENAME TO agora_sessions;
ALTER TABLE IF EXISTS academy_diary_entries RENAME TO agora_diary_entries;
ALTER TABLE IF EXISTS academy_required_readings RENAME TO agora_required_readings;
ALTER TABLE IF EXISTS academy_reading_progress RENAME TO agora_reading_progress;
ALTER TABLE IF EXISTS academy_certificates RENAME TO agora_certificates;
ALTER TABLE IF EXISTS academy_xp_transactions RENAME TO agora_xp_transactions;
ALTER TABLE IF EXISTS academy_videos RENAME TO agora_videos;
ALTER TABLE IF EXISTS academy_video_progress RENAME TO agora_video_progress;
ALTER TABLE IF EXISTS academy_events RENAME TO agora_events;

-- ============================================================================
-- 3. RENAME INDEXES
-- ============================================================================

ALTER INDEX IF EXISTS idx_academy_profiles_user_id RENAME TO idx_agora_profiles_user_id;
ALTER INDEX IF EXISTS idx_academy_profiles_email RENAME TO idx_agora_profiles_email;
ALTER INDEX IF EXISTS idx_academy_profiles_rank RENAME TO idx_agora_profiles_rank;
ALTER INDEX IF EXISTS idx_academy_profiles_xp RENAME TO idx_agora_profiles_xp;
ALTER INDEX IF EXISTS idx_academy_sessions_user_id RENAME TO idx_agora_sessions_user_id;
ALTER INDEX IF EXISTS idx_academy_sessions_status RENAME TO idx_agora_sessions_status;
ALTER INDEX IF EXISTS idx_academy_sessions_date RENAME TO idx_agora_sessions_date;
ALTER INDEX IF EXISTS idx_academy_diary_user_id RENAME TO idx_agora_diary_user_id;
ALTER INDEX IF EXISTS idx_academy_diary_date RENAME TO idx_agora_diary_date;
ALTER INDEX IF EXISTS idx_academy_xp_user_id RENAME TO idx_agora_xp_user_id;
ALTER INDEX IF EXISTS idx_academy_xp_created RENAME TO idx_agora_xp_created;
ALTER INDEX IF EXISTS idx_academy_certificates_user RENAME TO idx_agora_certificates_user;
ALTER INDEX IF EXISTS idx_academy_certificates_number RENAME TO idx_agora_certificates_number;

-- ============================================================================
-- 4. RECREATE FUNCTIONS WITH NEW NAMES
-- ============================================================================

-- Function to calculate rank based on XP
CREATE OR REPLACE FUNCTION calculate_rank(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF xp >= 5000 THEN RETURN 'arquiteto';
    ELSIF xp >= 2000 THEN RETURN 'mentor';
    ELSIF xp >= 500 THEN RETURN 'contribuidor';
    ELSIF xp >= 100 THEN RETURN 'aprendiz';
    ELSE RETURN 'novato';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate level based on XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(1, (xp / 100) + 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update rank and level automatically
CREATE OR REPLACE FUNCTION update_rank_and_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_rank := calculate_rank(NEW.total_xp);
    NEW.current_level := calculate_level(NEW.total_xp);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. RECREATE TRIGGERS ON NEW TABLES
-- ============================================================================

CREATE TRIGGER trigger_update_rank_level
    BEFORE UPDATE OF total_xp ON agora_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_rank_and_level();

CREATE TRIGGER trigger_profiles_updated
    BEFORE UPDATE ON agora_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_sessions_updated
    BEFORE UPDATE ON agora_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 6. RECREATE VIEW WITH NEW NAME
-- ============================================================================

CREATE OR REPLACE VIEW agora_leaderboard AS
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

-- Grant access to the view for authenticated users
GRANT SELECT ON agora_leaderboard TO authenticated;

-- ============================================================================
-- 7. RECREATE LEADERBOARD FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_agora_leaderboard(
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
) AS $$
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
        FROM agora_profiles p
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
        FROM agora_profiles p
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
        FROM agora_profiles p
        WHERE p.is_active = TRUE
        ORDER BY p.current_streak DESC
        LIMIT limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_agora_leaderboard TO authenticated;

-- ============================================================================
-- 8. RECREATE USER RANK FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_rank(
    p_user_id UUID,
    sort_by TEXT DEFAULT 'xp'
)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    IF sort_by = 'xp' THEN
        SELECT rp INTO user_rank
        FROM (
            SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) AS rp
            FROM agora_profiles
            WHERE is_active = TRUE
        ) ranked
        WHERE ranked.user_id = p_user_id;
    ELSIF sort_by = 'time' THEN
        SELECT rp INTO user_rank
        FROM (
            SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_time_minutes DESC) AS rp
            FROM agora_profiles
            WHERE is_active = TRUE
        ) ranked
        WHERE ranked.user_id = p_user_id;
    ELSE -- streak
        SELECT rp INTO user_rank
        FROM (
            SELECT user_id, ROW_NUMBER() OVER (ORDER BY current_streak DESC) AS rp
            FROM agora_profiles
            WHERE is_active = TRUE
        ) ranked
        WHERE ranked.user_id = p_user_id;
    END IF;

    RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_rank TO authenticated;

-- ============================================================================
-- 9. UPDATE RLS POLICIES
-- ============================================================================

-- Drop old policies (they reference old table names in internal catalogs)
DROP POLICY IF EXISTS "Users can view own profile" ON agora_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON agora_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON agora_profiles;
DROP POLICY IF EXISTS "Authenticated users can view leaderboard" ON agora_profiles;

DROP POLICY IF EXISTS "Users can view own consent" ON agora_consent;
DROP POLICY IF EXISTS "Users can insert own consent" ON agora_consent;

DROP POLICY IF EXISTS "Users can view own sessions" ON agora_sessions;

DROP POLICY IF EXISTS "Users can manage own diary" ON agora_diary_entries;

DROP POLICY IF EXISTS "Users can manage own reading progress" ON agora_reading_progress;

DROP POLICY IF EXISTS "Users can view own certificates" ON agora_certificates;

DROP POLICY IF EXISTS "Users can view own xp transactions" ON agora_xp_transactions;

DROP POLICY IF EXISTS "Users can manage own video progress" ON agora_video_progress;

DROP POLICY IF EXISTS "Anyone can view videos" ON agora_videos;

DROP POLICY IF EXISTS "Anyone can view readings" ON agora_required_readings;

DROP POLICY IF EXISTS "Anyone can view events" ON agora_events;

-- Recreate policies with new names
CREATE POLICY "Users can view own profile" ON agora_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON agora_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON agora_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view leaderboard" ON agora_profiles
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND is_active = TRUE
    );

CREATE POLICY "Users can view own consent" ON agora_consent
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent" ON agora_consent
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON agora_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own diary" ON agora_diary_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reading progress" ON agora_reading_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own certificates" ON agora_certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own xp transactions" ON agora_xp_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own video progress" ON agora_video_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view videos" ON agora_videos
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view readings" ON agora_required_readings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view events" ON agora_events
    FOR SELECT USING (is_public = true);

-- ============================================================================
-- 10. UPDATE COMMENTS
-- ============================================================================

COMMENT ON TABLE agora_profiles IS 'Perfis dos participantes da Agora - dados gamificacao e progresso';
COMMENT ON TABLE agora_consent IS 'Registro de aceite do termo LGPD - obrigatorio para participar';
COMMENT ON TABLE agora_sessions IS 'Sessoes de estudo com tracking de tempo via PostHog';
COMMENT ON TABLE agora_diary_entries IS 'Diario de aprendizado - reflexao ao fim de cada sessao';
COMMENT ON TABLE agora_certificates IS 'Certificados gerados ao fim do programa';
COMMENT ON TABLE agora_xp_transactions IS 'Historico de todas as transacoes de XP';
COMMENT ON TABLE agora_required_readings IS 'Leituras obrigatorias do programa';
COMMENT ON TABLE agora_reading_progress IS 'Progresso de leitura dos participantes';
COMMENT ON TABLE agora_videos IS 'Videos do programa de capacitacao';
COMMENT ON TABLE agora_video_progress IS 'Progresso de visualizacao de videos';
COMMENT ON TABLE agora_events IS 'Calendario de eventos da Agora';

COMMENT ON VIEW agora_leaderboard IS 'Public view for leaderboard display - limited fields for privacy';
COMMENT ON FUNCTION get_agora_leaderboard IS 'Returns top N users sorted by XP, time, or streak';
COMMENT ON FUNCTION get_user_rank IS 'Returns a specific users rank position';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
