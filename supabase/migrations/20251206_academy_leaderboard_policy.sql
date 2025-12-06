-- ============================================================================
-- CIDADÃO.AI ACADEMY - LEADERBOARD PUBLIC VIEW
-- Allows authenticated users to see ranking data from other users
-- Date: December 2025
-- ============================================================================

-- Create a view for public leaderboard data (limited fields for privacy)
CREATE OR REPLACE VIEW academy_leaderboard AS
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
FROM academy_profiles
WHERE is_active = TRUE
ORDER BY total_xp DESC;

-- Grant access to the view for authenticated users
GRANT SELECT ON academy_leaderboard TO authenticated;

-- Alternative: If views don't work with RLS, add a policy for SELECT
-- This allows authenticated users to see public leaderboard fields
CREATE POLICY "Authenticated users can view leaderboard" ON academy_profiles
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND is_active = TRUE
    );

-- ============================================================================
-- FUNCTION: Get Top N Leaderboard
-- ============================================================================
CREATE OR REPLACE FUNCTION get_academy_leaderboard(
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
        FROM academy_profiles p
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
        FROM academy_profiles p
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
        FROM academy_profiles p
        WHERE p.is_active = TRUE
        ORDER BY p.current_streak DESC
        LIMIT limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_academy_leaderboard TO authenticated;

-- ============================================================================
-- FUNCTION: Get User Rank
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
            FROM academy_profiles
            WHERE is_active = TRUE
        ) ranked
        WHERE ranked.user_id = p_user_id;
    ELSIF sort_by = 'time' THEN
        SELECT rp INTO user_rank
        FROM (
            SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_time_minutes DESC) AS rp
            FROM academy_profiles
            WHERE is_active = TRUE
        ) ranked
        WHERE ranked.user_id = p_user_id;
    ELSE -- streak
        SELECT rp INTO user_rank
        FROM (
            SELECT user_id, ROW_NUMBER() OVER (ORDER BY current_streak DESC) AS rp
            FROM academy_profiles
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
-- COMMENTS
-- ============================================================================
COMMENT ON VIEW academy_leaderboard IS 'Public view for leaderboard display - limited fields for privacy';
COMMENT ON FUNCTION get_academy_leaderboard IS 'Returns top N users sorted by XP, time, or streak';
COMMENT ON FUNCTION get_user_rank IS 'Returns a specific users rank position';
