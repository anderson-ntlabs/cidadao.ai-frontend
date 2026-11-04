-- Restrict the Agora leaderboard and add self-service account deletion
--
-- 1. Leaderboard leak: the policy "Authenticated users can view leaderboard"
--    let any signed-in user select every column of every active
--    agora_profiles row (email, full_name, matricula, github_username...).
--    It is dropped, so authenticated users only read their own profile
--    through "Users can view own profile". The ranking keeps working through
--    the SECURITY DEFINER function get_agora_leaderboard(), which returns only
--    the columns the ranking page renders, and the agora_leaderboard view is
--    rebuilt on top of that function.
--
-- 2. Account deletion (LGPD art. 18, VI): the API route used the anon key,
--    and several tables have no DELETE policy, so deletion silently removed
--    nothing. delete_my_account() deletes every row owned by auth.uid() and
--    then the auth user itself, in one transaction.

-- ============================================================================
-- 1. Leaderboard
-- ============================================================================

ALTER TABLE public.agora_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view leaderboard" ON public.agora_profiles;

-- Ranking functions: signed-in users only
REVOKE ALL ON FUNCTION public.get_agora_leaderboard(TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_agora_leaderboard(TEXT, INTEGER) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_rank(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_rank(UUID, TEXT) TO authenticated;

-- The view exposes only non-sensitive ranking columns. It reads through the
-- SECURITY DEFINER function, so it does not need a table-wide SELECT policy.
DROP VIEW IF EXISTS public.agora_leaderboard;

CREATE VIEW public.agora_leaderboard
WITH (security_invoker = true) AS
SELECT
    lb.id,
    lb.user_id,
    lb.full_name,
    lb.avatar_url,
    lb.total_xp,
    lb.current_level,
    lb.current_rank,
    lb.current_streak,
    lb.total_time_minutes,
    lb.rank_position
FROM public.get_agora_leaderboard('xp', 1000) AS lb;

COMMENT ON VIEW public.agora_leaderboard IS
    'Agora ranking: name, avatar and gamification counters only (no email, matricula or GitHub data)';

REVOKE ALL ON public.agora_leaderboard FROM PUBLIC, anon;
GRANT SELECT ON public.agora_leaderboard TO authenticated;

-- ============================================================================
-- 2. Account deletion
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_target TEXT[];
    v_table TEXT;
    v_column TEXT;
    v_count BIGINT;
    v_deleted JSONB := '{}'::JSONB;
    -- {table, owner column}. Order matters only where a foreign key has no
    -- ON DELETE CASCADE (kids profiles and parental codes reference
    -- auth.users without cascade). Tables missing from a given database are
    -- skipped, so the function works on partially migrated projects.
    v_targets TEXT[] := ARRAY[
        ARRAY['chat_messages', 'user_id'],
        ARRAY['chat_sessions', 'user_id'],
        ARRAY['user_preferences', 'user_id'],
        ARRAY['user_activities', 'user_id'],
        ARRAY['user_badges', 'user_id'],
        ARRAY['survey_responses', 'user_id'],
        ARRAY['investigations', 'user_id'],
        ARRAY['agora_xp_transactions', 'user_id'],
        ARRAY['agora_diary_entries', 'user_id'],
        ARRAY['agora_video_progress', 'user_id'],
        ARRAY['agora_reading_progress', 'user_id'],
        ARRAY['agora_calendar_events', 'user_id'],
        ARRAY['agora_challenge_progress', 'user_id'],
        ARRAY['agora_badge_awards', 'user_id'],
        ARRAY['agora_user_progress', 'user_id'],
        ARRAY['agora_user_tracks', 'user_id'],
        ARRAY['agora_certificates', 'user_id'],
        ARRAY['agora_sessions', 'user_id'],
        ARRAY['agora_consent', 'user_id'],
        ARRAY['parental_access_codes', 'user_id'],
        ARRAY['agora_parental_codes', 'parent_user_id'],
        ARRAY['agora_kids_profiles', 'parent_user_id'],
        ARRAY['agora_profiles', 'user_id']
    ];
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
    END IF;

    FOREACH v_target SLICE 1 IN ARRAY v_targets LOOP
        v_table := v_target[1];
        v_column := v_target[2];

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns c
            WHERE c.table_schema = 'public'
              AND c.table_name = v_table
              AND c.column_name = v_column
        ) THEN
            EXECUTE format('DELETE FROM public.%I WHERE %I = $1', v_table, v_column)
            USING v_uid;
            GET DIAGNOSTICS v_count = ROW_COUNT;
            v_deleted := v_deleted || jsonb_build_object(v_table, v_count);
        END IF;
    END LOOP;

    -- Finally the auth user (cascades to any remaining owned rows)
    DELETE FROM auth.users WHERE id = v_uid;
    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count = 0 THEN
        RAISE EXCEPTION 'Account % not found', v_uid USING ERRCODE = 'P0002';
    END IF;

    RETURN jsonb_build_object('user_deleted', true, 'deleted_rows', v_deleted);
END;
$$;

COMMENT ON FUNCTION public.delete_my_account() IS
    'LGPD art. 18: deletes every row owned by the calling user and the auth user itself';

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
